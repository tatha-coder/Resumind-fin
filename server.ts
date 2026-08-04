import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import * as pdfParseModule from 'pdf-parse';

// Universal PDF text extractor supporting both pdf-parse v1 function & v2 PDFParse class
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<{ text: string; pageCount: number }> {
  let extractedText = '';
  let pageCount = 1;

  try {
    const mod = pdfParseModule as any;
    // 1. Try v1 style function call: pdfParse(buffer)
    const fn = typeof mod === 'function' ? mod : typeof mod?.default === 'function' ? mod.default : null;
    if (fn) {
      const data = await fn(pdfBuffer);
      return {
        text: data?.text || '',
        pageCount: data?.numpages || data?.numPages || 1,
      };
    }

    // 2. Try v2 style class: new PDFParse({ data: buffer })
    const PDFParseClass = mod?.PDFParse || mod?.default?.PDFParse;
    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: new Uint8Array(pdfBuffer) });
      if (typeof parser.load === 'function') {
        await parser.load();
      }
      if (typeof parser.getText === 'function') {
        const textResult = await parser.getText();
        extractedText = typeof textResult === 'string' ? textResult : textResult?.text || '';
      }
      if (typeof parser.getInfo === 'function') {
        const info = await parser.getInfo();
        if (info?.numPages || info?.numpages || info?.pageCount) {
          pageCount = info.numPages || info.numpages || info.pageCount;
        }
      }
      return { text: extractedText, pageCount: pageCount || 1 };
    }
  } catch (err) {
    console.warn('PDF text extraction notice (Gemini AI multimodal will process PDF directly):', err);
  }

  return { text: extractedText, pageCount };
}

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ohbyloyfwowslgxpogum.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_mCgdiWspb8VxMEvtrSKP_Q_Odwi3rer';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();
const PORT = 3000;

// Increase payload size limit to 20MB for PDF base64 uploads
app.use(express.json({ limit: '20mb' }));

// Ensure data directory exists for JSON DB persistence (safely handled on read-only serverless environments like Vercel)
const DATA_DIR = path.join(process.cwd(), 'data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Read-only filesystem on Vercel
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const RESUMES_FILE = path.join(DATA_DIR, 'resumes.json');

// Memory cache backed by file persistence
interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  targetRole?: string;
  createdAt: string;
  avatarUrl?: string;
}

interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: number;
}

let users: UserRecord[] = [];
try {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  }
} catch (err) {
  users = [];
}

function saveUsers() {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem notice
  }
}

let resumes: any[] = [];
try {
  if (fs.existsSync(RESUMES_FILE)) {
    resumes = JSON.parse(fs.readFileSync(RESUMES_FILE, 'utf-8'));
  }
} catch (err) {
  resumes = [];
}

function saveResumes() {
  try {
    fs.writeFileSync(RESUMES_FILE, JSON.stringify(resumes, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem notice
  }
}

const sessions: Map<string, SessionRecord> = new Map();

// Helper crypto functions for auth
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Check local session map
  const session = sessions.get(token);
  if (session && session.expiresAt >= Date.now()) {
    const user = users.find((u) => u.id === session.userId);
    if (user) {
      req.user = user;
      return next();
    }
  }

  // 2. Validate with Supabase Auth
  try {
    const { data: { user: sbUser }, error } = await supabase.auth.getUser(token);
    if (!error && sbUser) {
      let user = users.find((u) => u.id === sbUser.id || u.email === sbUser.email?.toLowerCase());
      if (!user) {
        const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User';
        const targetRole = sbUser.user_metadata?.target_role || 'Software Engineer';
        user = {
          id: sbUser.id,
          email: (sbUser.email || '').toLowerCase(),
          name,
          passwordHash: '',
          salt: '',
          targetRole,
          createdAt: sbUser.created_at || new Date().toISOString(),
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        };
        users.push(user);
        saveUsers();
      }
      req.user = user;
      return next();
    }
  } catch (err) {
    // fallthrough
  }

  return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
}

// Gemini AI Client Helper
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing on the server. Please add GEMINI_API_KEY to your Vercel Project Settings under Environment Variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// --- SUPABASE STATUS ROUTE ---
app.get('/api/supabase/status', async (req: Request, res: Response) => {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    return res.json({
      connected: true,
      projectName: "tatha-coder's Project",
      projectId: "ohbyloyfwowslgxpogum",
      supabaseUrl: SUPABASE_URL,
      status: response.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      connected: false,
      projectName: "tatha-coder's Project",
      projectId: "ohbyloyfwowslgxpogum",
      error: err.message,
    });
  }
});

// --- AUTH ROUTES ---

// 1. Register User with Supabase
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, targetRole } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Call Supabase Auth signUp
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: name.trim(),
          target_role: targetRole ? targetRole.trim() : 'Software Engineer',
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const sbUser = data.user;
    if (!sbUser) {
      return res.status(400).json({ error: 'Failed to create user account in Supabase.' });
    }

    let user = users.find((u) => u.email === normalizedEmail || u.id === sbUser.id);
    if (!user) {
      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = hashPassword(password, salt);
      user = {
        id: sbUser.id,
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        salt,
        targetRole: targetRole ? targetRole.trim() : 'Software Engineer',
        createdAt: sbUser.created_at || new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}`,
      };
      users.push(user);
      saveUsers();
    }

    const token = data.session?.access_token || generateToken();
    sessions.set(token, {
      token,
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, salt: __, ...userProfile } = user;
    return res.json({
      user: userProfile,
      token,
      session: data.session,
      message: data.session
        ? 'Account registered successfully with Supabase!'
        : 'Account created! Please check your email to confirm your account if required by Supabase settings, then log in.',
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create user account.' });
  }
});

// 2. Login User with Supabase
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Call Supabase Auth signInWithPassword
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      // Fallback to local accounts (e.g. demo test profiles)
      const localUser = users.find((u) => u.email === normalizedEmail);
      if (localUser && localUser.passwordHash) {
        const computedHash = hashPassword(password, localUser.salt);
        if (computedHash === localUser.passwordHash) {
          const token = generateToken();
          sessions.set(token, {
            token,
            userId: localUser.id,
            expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
          });
          const { passwordHash: _, salt: __, ...userProfile } = localUser;
          return res.json({
            user: userProfile,
            token,
            message: 'Logged in successfully!',
          });
        }
      }
      return res.status(401).json({ error: error.message || 'Invalid email or password.' });
    }

    const sbUser = data.user;
    let user = users.find((u) => u.email === normalizedEmail || u.id === sbUser.id);
    if (!user) {
      const name = sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || normalizedEmail.split('@')[0];
      const targetRole = sbUser.user_metadata?.target_role || 'Software Engineer';
      user = {
        id: sbUser.id,
        email: normalizedEmail,
        name,
        passwordHash: '',
        salt: '',
        targetRole,
        createdAt: sbUser.created_at || new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
      };
      users.push(user);
      saveUsers();
    }

    const token = data.session.access_token;
    sessions.set(token, {
      token,
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    const { passwordHash: _, salt: __, ...userProfile } = user;
    return res.json({
      user: userProfile,
      token,
      session: data.session,
      message: 'Logged in successfully with Supabase!',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

// 3. Get Current User Profile
app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { passwordHash: _, salt: __, ...userProfile } = req.user;
  return res.json({ user: userProfile });
});

// 4. Update Profile
app.put('/api/auth/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  const { name, targetRole } = req.body;

  const userIdx = users.findIndex((u) => u.id === req.user!.id);
  if (userIdx === -1) return res.status(404).json({ error: 'User not found' });

  if (name) users[userIdx].name = name.trim();
  if (targetRole !== undefined) users[userIdx].targetRole = targetRole.trim();

  saveUsers();

  const { passwordHash: _, salt: __, ...updatedProfile } = users[userIdx];
  return res.json({ user: updatedProfile, message: 'Profile updated successfully.' });
});

// --- PDF PARSING & RESUME AI ANALYSIS ROUTES ---

// Parse PDF and perform full AI analysis
app.post('/api/resume/upload-and-analyze', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { pdfBase64, filename, targetRole } = req.body;

    if (!pdfBase64) {
      return res.status(400).json({ error: 'PDF file base64 data is required.' });
    }

    // Convert base64 to Buffer
    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    // Parse PDF text with universal extractTextFromPDF helper
    let extractedText = '';
    let pageCount = 1;
    let filesize = pdfBuffer.length;

    try {
      const parsed = await extractTextFromPDF(pdfBuffer);
      extractedText = parsed.text || '';
      pageCount = parsed.pageCount || 1;
    } catch (parseErr) {
      console.warn('PDF parsing notice:', parseErr);
    }

    const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(Boolean).length : 0;

    const pdfMeta = {
      filename: filename || 'resume.pdf',
      filesize,
      pageCount,
      wordCount,
      extractedText: extractedText.substring(0, 3000), // Preview sample
      uploadDate: new Date().toISOString(),
    };

    // Call Gemini API for Deep Resume Analysis
    const ai = getGeminiClient();

    const pdfPart = {
      inlineData: {
        mimeType: 'application/pdf',
        data: cleanBase64,
      },
    };

    const promptText = `
You are an expert Executive Resume Reviewer, ATS (Applicant Tracking System) Specialist, and Tech Recruiter.
Analyze the attached PDF resume for the target job role: "${targetRole || req.user?.targetRole || 'Professional'}".

Extracted plain text from resume for reference:
"""
${extractedText.substring(0, 6000)}
"""

Provide a thorough, highly detailed JSON response evaluating the resume.
Return ONLY valid JSON with this EXACT structure (do not add Markdown code fences, quotes outside json, or commentary):

{
  "overallScore": 82,
  "atsScore": 85,
  "contentScore": 80,
  "formattingScore": 88,
  "impactScore": 75,
  "keywordScore": 82,
  "summary": "High-level 2-3 sentence executive review highlighting overall impression and biggest growth area.",
  "keyStrengths": [
    "3-5 specific, well-articulated strengths found in the resume"
  ],
  "criticalGaps": [
    "3-5 actionable critical gaps or missing elements that drag down the ATS score"
  ],
  "atsChecks": [
    {
      "category": "Contact Information",
      "status": "pass",
      "detail": "Email, phone number, and LinkedIn URL are clearly readable.",
      "recommendation": "Add location (City, State) if applying for local/hybrid roles."
    },
    {
      "category": "Parsable Headers & Formatting",
      "status": "pass",
      "detail": "Standard section titles (Experience, Education, Skills) are present."
    },
    {
      "category": "Quantifiable Metrics & Impact",
      "status": "warning",
      "detail": "Only 3 bullet points contain percentage or dollar metrics.",
      "recommendation": "Incorporate numerical results (e.g., 'improved performance by 35%')."
    },
    {
      "category": "Action Verbs & Buzzwords",
      "status": "pass",
      "detail": "Strong action verbs like 'Engineered', 'Optimized', and 'Spearheaded' are used."
    },
    {
      "category": "Length & Density",
      "status": "pass",
      "detail": "Page count and word density fit industry standards."
    }
  ],
  "sections": [
    {
      "sectionName": "Professional Summary",
      "score": 78,
      "status": "good",
      "feedback": [
        "Concise intro, but lacks target role keyword hooks.",
        "Could highlight years of relevant industry experience earlier."
      ],
      "suggestions": [
        "Include years of experience and core domain focus in the first sentence."
      ]
    },
    {
      "sectionName": "Work Experience & Achievement Bullets",
      "score": 75,
      "status": "needs_improvement",
      "feedback": [
        "Some bullet points read like job descriptions rather than accomplishments.",
        "Need stronger metric outcomes (e.g. ROI, performance gains, team size)."
      ],
      "suggestions": [
        "Structure bullets using the STAR method (Situation, Task, Action, Result)."
      ],
      "rewrites": [
        {
          "original": "Responsible for maintaining front end code and fixing bugs.",
          "suggested": "Spearheaded front-end optimization across 12 React applications, resolving 45+ critical bugs and improving page load speeds by 28%.",
          "reasoning": "Replaced weak passive verb 'Responsible for' with active power verb and quantified impact.",
          "section": "Work Experience"
        },
        {
          "original": "Worked with cross-functional teams to release features.",
          "suggested": "Collaborated with cross-functional product teams of 8 developers and designers to deliver 5 major feature releases on time.",
          "reasoning": "Added explicit team size and delivery milestone.",
          "section": "Work Experience"
        }
      ]
    },
    {
      "sectionName": "Skills & Technologies",
      "score": 90,
      "status": "excellent",
      "feedback": [
        "Great coverage of modern tech stack.",
        "Well categorized."
      ],
      "suggestions": [
        "Group by primary mastery vs secondary exposure for better readability."
      ]
    },
    {
      "sectionName": "Education & Certifications",
      "score": 88,
      "status": "excellent",
      "feedback": [
        "Degree and university cleanly listed."
      ],
      "suggestions": [
        "Consider adding relevant coursework or high GPA if recent graduate."
      ]
    }
  ],
  "detectedSkills": {
    "technical": ["React", "TypeScript", "Node.js", "Express", "REST APIs", "Git"],
    "soft": ["Cross-functional Leadership", "Problem Solving", "Agile Collaboration"],
    "toolsAndFrameworks": ["Vite", "Tailwind CSS", "Docker", "Jest"]
  },
  "actionableNextSteps": [
    "Update 3 work experience bullets with quantifiable metrics (%, $, scale).",
    "Tailor skills section specifically to match targeted job descriptions.",
    "Add a targeted 2-sentence career summary at the top."
  ]
}
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [pdfPart, { text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawJsonText = aiResponse.text || '{}';
    const firstBrace = rawJsonText.indexOf('{');
    const lastBrace = rawJsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      rawJsonText = rawJsonText.substring(firstBrace, lastBrace + 1);
    } else {
      rawJsonText = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const analysisData = JSON.parse(rawJsonText);

    const fullAnalysisRecord = {
      id: 'anl_' + crypto.randomBytes(8).toString('hex'),
      userId: req.user!.id,
      createdAt: new Date().toISOString(),
      pdfMeta,
      ...analysisData,
    };

    // Save analysis strictly under user's private history
    resumes.push(fullAnalysisRecord);
    saveResumes();

    // Persist to Supabase resume_analyses table
    try {
      await supabase.from('resume_analyses').insert({
        id: fullAnalysisRecord.id,
        user_id: req.user!.id,
        filename: pdfMeta.filename,
        filesize: pdfMeta.filesize,
        page_count: pdfMeta.pageCount,
        word_count: pdfMeta.wordCount,
        extracted_text: pdfMeta.extractedText,
        target_role: targetRole || req.user?.targetRole || 'Professional',
        overall_score: fullAnalysisRecord.overallScore,
        ats_score: fullAnalysisRecord.atsScore,
        content_score: fullAnalysisRecord.contentScore,
        formatting_score: fullAnalysisRecord.formattingScore,
        impact_score: fullAnalysisRecord.impactScore,
        keyword_score: fullAnalysisRecord.keywordScore,
        summary: fullAnalysisRecord.summary,
        key_strengths: fullAnalysisRecord.keyStrengths,
        critical_gaps: fullAnalysisRecord.criticalGaps,
        ats_checks: fullAnalysisRecord.atsChecks,
        sections: fullAnalysisRecord.sections,
        detected_skills: fullAnalysisRecord.detectedSkills,
        actionable_next_steps: fullAnalysisRecord.actionableNextSteps,
        created_at: fullAnalysisRecord.createdAt,
      });
    } catch (sbInsertErr) {
      console.warn('Supabase resume_analyses insert notice:', sbInsertErr);
    }

    return res.json({
      success: true,
      analysis: fullAnalysisRecord,
    });
  } catch (err: any) {
    console.error('Upload and analyze error:', err);
    return res.status(500).json({
      error: err.message || 'Failed to analyze resume.',
      details: err.message,
    });
  }
});

// Helper to retrieve resume record from memory or Supabase
async function getResumeRecord(analysisId: string | undefined, userId: string): Promise<any> {
  if (!analysisId) {
    return resumes.find((r) => r.userId === userId) || null;
  }

  let record = resumes.find((r) => r.id === analysisId && r.userId === userId);
  if (!record) {
    try {
      const { data: sbRow } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', userId)
        .single();

      if (sbRow) {
        record = {
          id: sbRow.id,
          userId: sbRow.user_id,
          overallScore: sbRow.overall_score,
          atsScore: sbRow.ats_score,
          contentScore: sbRow.content_score,
          formattingScore: sbRow.formatting_score,
          impactScore: sbRow.impact_score,
          keywordScore: sbRow.keyword_score,
          summary: sbRow.summary,
          keyStrengths: sbRow.key_strengths,
          criticalGaps: sbRow.critical_gaps,
          atsChecks: sbRow.ats_checks,
          sections: sbRow.sections,
          detectedSkills: sbRow.detected_skills,
          actionableNextSteps: sbRow.actionable_next_steps,
          pdfMeta: {
            filename: sbRow.filename || 'resume.pdf',
            filesize: sbRow.filesize || 0,
            pageCount: sbRow.page_count || 1,
            wordCount: sbRow.word_count || 0,
            extractedText: sbRow.extracted_text || sbRow.summary || '',
            uploadDate: sbRow.created_at,
          },
          createdAt: sbRow.created_at,
        };
      }
    } catch (e) {
      // ignore
    }
  }

  if (!record) {
    // Return latest user resume as fallback
    record = resumes.find((r) => r.userId === userId) || null;
  }

  return record;
}

// Job Description Match Analysis Endpoint
app.post('/api/resume/analyze-jd-match', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { analysisId, jobTitle, companyName, jobDescriptionText } = req.body;

    if (!jobDescriptionText || !jobDescriptionText.trim()) {
      return res.status(400).json({ error: 'Job description text is required.' });
    }

    const resumeRecord = await getResumeRecord(analysisId, req.user!.id);
    const resumeText = resumeRecord?.pdfMeta?.extractedText || resumeRecord?.summary || 'Experienced professional.';

    const ai = getGeminiClient();
    const prompt = `
You are a Senior Talent Acquisition Specialist & Technical Recruiter.
Compare the applicant's resume with the following target Job Description.

TARGET JOB TITLE: ${jobTitle || 'Target Position'}
COMPANY NAME: ${companyName || 'Target Company'}

JOB DESCRIPTION:
"""
${jobDescriptionText.substring(0, 4000)}
"""

RESUME EXTRACTED CONTENT:
"""
${resumeText.substring(0, 5000)}
"""

Analyze the gap between the candidate's experience and the job requirements.
Return ONLY valid JSON matching this structure:

{
  "matchScore": 76,
  "matchedKeywords": ["React", "TypeScript", "REST APIs", "Agile"],
  "missingKeywords": ["GraphQL", "CI/CD", "AWS", "Unit Testing"],
  "skillsGap": [
    "AWS cloud deployment knowledge missing in work experience",
    "GraphQL client integration experience not mentioned"
  ],
  "tailoringAdvice": [
    "Add 'AWS' or 'Cloud services' to your technical skills section if you have exposure.",
    "Highlight experience with Automated Testing in your most recent software role."
  ],
  "tailoredSummary": "A compelling 3-sentence professional summary explicitly engineered to match this target ${jobTitle} role at ${companyName}.",
  "tailoredBullets": [
    {
      "original": "Built user interfaces using React and modern JavaScript.",
      "tailored": "Engineered scalable, responsive React UI components integrated with REST APIs, aligning with high-traffic enterprise requirements.",
      "targetKeyword": "Scalable React Architecture"
    }
  ]
}
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    let rawJsonText = aiResponse.text || '{}';
    const firstBrace = rawJsonText.indexOf('{');
    const lastBrace = rawJsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      rawJsonText = rawJsonText.substring(firstBrace, lastBrace + 1);
    } else {
      rawJsonText = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const jdMatchData = JSON.parse(rawJsonText);

    const result = {
      id: 'jdm_' + crypto.randomBytes(8).toString('hex'),
      analysisId: analysisId || resumeRecord?.id || 'res_default',
      jobTitle: jobTitle || 'Target Position',
      companyName: companyName || '',
      jobDescriptionText,
      ...jdMatchData,
      createdAt: new Date().toISOString(),
    };

    return res.json({ success: true, matchResult: result });
  } catch (err: any) {
    console.error('JD Match error:', err);
    return res.status(500).json({ error: 'Failed to analyze job description match.', details: err.message });
  }
});

// Generate AI Cover Letter
app.post('/api/resume/generate-cover-letter', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { analysisId, jobTitle, companyName, jobDescriptionText } = req.body;

    const resumeRecord = await getResumeRecord(analysisId, req.user!.id);
    const resumeText = resumeRecord?.pdfMeta?.extractedText || resumeRecord?.summary || 'Experienced professional.';

    const ai = getGeminiClient();
    const prompt = `
Write a highly compelling, professional 3-4 paragraph Cover Letter for candidate ${req.user!.name}.

Job Title: ${jobTitle || 'Target Role'}
Company Name: ${companyName || 'the Hiring Team'}
Target Role: ${req.user!.targetRole || jobTitle}

Candidate Resume Context:
"""
${resumeText.substring(0, 3000)}
"""

Target Job Description:
"""
${jobDescriptionText ? jobDescriptionText.substring(0, 2000) : 'Standard requirements for ' + jobTitle}
"""

Return ONLY JSON format:
{
  "jobTitle": "${jobTitle || 'Target Role'}",
  "companyName": "${companyName || 'Hiring Manager'}",
  "coverLetterText": "Full formatted text of the cover letter..."
}
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let rawJsonText = aiResponse.text || '{}';
    const firstBrace = rawJsonText.indexOf('{');
    const lastBrace = rawJsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      rawJsonText = rawJsonText.substring(firstBrace, lastBrace + 1);
    } else {
      rawJsonText = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const data = JSON.parse(rawJsonText);
    return res.json({ success: true, coverLetter: data.coverLetterText });
  } catch (err: any) {
    console.error('Cover letter error:', err);
    return res.status(500).json({ error: 'Failed to generate cover letter.', details: err.message });
  }
});

// Generate Mock Interview Questions
app.post('/api/resume/generate-interview-prep', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { analysisId, jobTitle, jobDescriptionText } = req.body;

    const resumeRecord = await getResumeRecord(analysisId, req.user!.id);
    const resumeText = resumeRecord?.pdfMeta?.extractedText || resumeRecord?.summary || 'Experienced professional.';

    const ai = getGeminiClient();
    const prompt = `
Generate 5 high-yield interview questions tailored to candidate ${req.user!.name}'s resume and target position (${jobTitle || req.user!.targetRole}).

Candidate Resume Summary:
"""
${resumeText.substring(0, 3000)}
"""

Target Job Context:
"""
${jobDescriptionText || 'General requirements for ' + (jobTitle || 'Software Professional')}
"""

Return ONLY JSON matching this array structure:
{
  "questions": [
    {
      "question": "Can you walk us through how you optimized front-end performance in your recent role?",
      "type": "technical",
      "context": "Based on the performance optimization bullet point in your experience section.",
      "idealAnswerKeypoints": [
        "Mention specific tools used (Lighthouse, profiler)",
        "State starting baseline metric vs final result",
        "Describe code splitting or lazy loading strategy"
      ]
    }
  ]
}
`;

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    let rawJsonText = aiResponse.text || '{}';
    const firstBrace = rawJsonText.indexOf('{');
    const lastBrace = rawJsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      rawJsonText = rawJsonText.substring(firstBrace, lastBrace + 1);
    } else {
      rawJsonText = rawJsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    }

    const data = JSON.parse(rawJsonText);
    return res.json({ success: true, questions: data.questions || [] });
  } catch (err: any) {
    console.error('Interview prep error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate interview prep questions.', details: err.message });
  }
});

// Get User's Private Resume History (Isolate per user)
app.get('/api/resume/history', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: sbResumes, error: sbError } = await supabase
      .from('resume_analyses')
      .select('id, created_at, filename, filesize, page_count, word_count, overall_score, ats_score, summary')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (!sbError && sbResumes && sbResumes.length > 0) {
      const formatted = sbResumes.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        filename: r.filename,
        filesize: r.filesize,
        pageCount: r.page_count,
        wordCount: r.word_count,
        overallScore: r.overall_score,
        atsScore: r.ats_score,
        summary: r.summary,
      }));
      return res.json({ resumes: formatted });
    }
  } catch (err) {
    // Fallback to memory
  }

  const userResumes = resumes
    .filter((r) => r.userId === req.user!.id)
    .map((r) => ({
      id: r.id,
      createdAt: r.createdAt,
      filename: r.pdfMeta.filename,
      filesize: r.pdfMeta.filesize,
      pageCount: r.pdfMeta.pageCount,
      wordCount: r.pdfMeta.wordCount,
      overallScore: r.overallScore,
      atsScore: r.atsScore,
      summary: r.summary,
    }));

  return res.json({ resumes: userResumes });
});

// Get single resume full analysis
app.get('/api/resume/history/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: sbRow, error: sbErr } = await supabase
      .from('resume_analyses')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (!sbErr && sbRow) {
      const fullAnalysis = {
        id: sbRow.id,
        userId: sbRow.user_id,
        createdAt: sbRow.created_at,
        pdfMeta: {
          filename: sbRow.filename,
          filesize: sbRow.filesize,
          pageCount: sbRow.page_count,
          wordCount: sbRow.word_count,
          extractedText: sbRow.extracted_text || '',
          uploadDate: sbRow.created_at,
        },
        overallScore: sbRow.overall_score,
        atsScore: sbRow.ats_score,
        contentScore: sbRow.content_score,
        formattingScore: sbRow.formatting_score,
        impactScore: sbRow.impact_score,
        keywordScore: sbRow.keyword_score,
        summary: sbRow.summary,
        keyStrengths: sbRow.key_strengths || [],
        criticalGaps: sbRow.critical_gaps || [],
        atsChecks: sbRow.ats_checks || [],
        sections: sbRow.sections || [],
        detectedSkills: sbRow.detected_skills || { technical: [], soft: [], toolsAndFrameworks: [] },
        actionableNextSteps: sbRow.actionable_next_steps || [],
      };
      return res.json({ analysis: fullAnalysis });
    }
  } catch (err) {
    // Fallback to memory
  }

  const record = resumes.find((r) => r.id === req.params.id && r.userId === req.user!.id);
  if (!record) {
    return res.status(404).json({ error: 'Resume record not found or access denied.' });
  }
  return res.json({ analysis: record });
});

// Delete resume from user profile history
app.delete('/api/resume/history/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await supabase
      .from('resume_analyses')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);
  } catch (err) {
    // ignore
  }

  const index = resumes.findIndex((r) => r.id === req.params.id && r.userId === req.user!.id);
  if (index !== -1) {
    resumes.splice(index, 1);
    saveResumes();
  }

  return res.json({ message: 'Resume deleted successfully from your profile.' });
});

// --- VITE & STATIC FILES CONFIG ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

if (process.env.VERCEL !== '1') {
  startServer();
}

export { app };
export default app;
