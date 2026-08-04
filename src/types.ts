export interface User {
  id: string;
  email: string;
  name: string;
  targetRole?: string;
  createdAt: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface PdfMetadata {
  filename: string;
  filesize: number; // in bytes
  pageCount: number;
  wordCount: number;
  extractedText: string;
  uploadDate: string;
}

export interface BulletRewrite {
  original: string;
  suggested: string;
  reasoning: string;
  section: string;
}

export interface SectionAnalysis {
  sectionName: string;
  score: number; // 0 - 100
  status: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  feedback: string[];
  suggestions: string[];
  rewrites?: BulletRewrite[];
}

export interface AtsCheck {
  category: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  recommendation?: string;
}

export interface AnalysisResult {
  id: string;
  userId: string;
  createdAt: string;
  pdfMeta: PdfMetadata;
  overallScore: number;
  atsScore: number;
  contentScore: number;
  formattingScore: number;
  impactScore: number;
  keywordScore: number;
  summary: string;
  keyStrengths: string[];
  criticalGaps: string[];
  atsChecks: AtsCheck[];
  sections: SectionAnalysis[];
  detectedSkills: {
    technical: string[];
    soft: string[];
    toolsAndFrameworks: string[];
  };
  actionableNextSteps: string[];
}

export interface JobMatchResult {
  id: string;
  analysisId: string;
  jobTitle: string;
  companyName?: string;
  jobDescriptionText: string;
  matchScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  skillsGap: string[];
  tailoringAdvice: string[];
  tailoredSummary: string;
  tailoredBullets: {
    original: string;
    tailored: string;
    targetKeyword: string;
  }[];
}

export interface CoverLetter {
  id: string;
  jobTitle: string;
  companyName: string;
  content: string;
  createdAt: string;
}

export interface InterviewQuestion {
  question: string;
  type: 'technical' | 'behavioral' | 'situational' | 'background';
  context: string;
  idealAnswerKeypoints: string[];
}
