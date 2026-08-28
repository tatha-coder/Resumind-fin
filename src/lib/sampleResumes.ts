import { AnalysisResult } from '../types';

export interface SampleResumePreset {
  id: string;
  role: string;
  candidateName: string;
  filename: string;
  experienceLevel: string;
  summary: string;
  mockAnalysis: AnalysisResult;
}

export const SAMPLE_RESUMES: SampleResumePreset[] = [
  {
    id: 'sample-swe',
    role: 'Senior Full Stack Engineer',
    candidateName: 'Alex Morgan',
    filename: 'Alex_Morgan_Senior_FullStack_Resume.pdf',
    experienceLevel: '6+ Years Experience',
    summary: 'Strong engineering track record in React, TypeScript, Node.js, and AWS with quantified performance metrics.',
    mockAnalysis: {
      id: 'sample-analysis-swe-01',
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      pdfMeta: {
        filename: 'Alex_Morgan_Senior_FullStack_Resume.pdf',
        filesize: 142850,
        pageCount: 2,
        wordCount: 520,
        extractedText: `ALEX MORGAN
alex.morgan@techmail.io | +1 (555) 349-2810 | San Francisco, CA | linkedin.com/in/alexmorgan-dev

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 6+ years designing, scaling, and maintaining distributed microservices and reactive single-page applications. Proven track record reducing page load latency by 42% and architecting real-time streaming architectures on AWS.

CORE COMPETENCIES
- Frontend: React 19, TypeScript, Next.js, Tailwind CSS, Webpack, Redux Toolkit
- Backend & Cloud: Node.js, Express, Python (FastAPI), PostgreSQL, Redis, Docker, Kubernetes, AWS (Lambda, ECS, S3, CloudFront)
- Engineering Practices: CI/CD (GitHub Actions), Unit Testing (Jest, Playwright), System Design, Agile

EXPERIENCE
Senior Software Engineer | CloudScale Systems | 2022 - Present
- Architected enterprise React/TypeScript analytics dashboard used by 120,000+ monthly active enterprise operators, improving rendering throughput by 38%.
- Designed asynchronous task queue with Redis and BullMQ, preventing server downtime and reducing API response time from 420ms to 85ms.
- Mentored 6 mid-level and junior engineers through weekly code reviews and architecture design documents.

Full Stack Engineer | Nexus Solutions | 2019 - 2022
- Migrated legacy monolithic PHP application to modular Node.js microservices, cutting infrastructure cloud spend by $64,000 annually.
- Integrated Stripe billing and automated webhook reconciliation handling $4.2M in annual recurring revenue with zero data discrepancies.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2015 - 2019)`,
        uploadDate: new Date().toISOString(),
      },
      overallScore: 88,
      atsScore: 94,
      contentScore: 86,
      formattingScore: 92,
      impactScore: 89,
      keywordScore: 87,
      summary: 'High-performing technical resume with outstanding ATS parsability, clean layout hierarchy, and strong quantified engineering impact. Passes modern ATS engines (Greenhouse, Lever, Workday) with high confidence.',
      keyStrengths: [
        'Exceptional quantification: Metrics like "reduced API response time from 420ms to 85ms" and "saved $64,000 annually" show high ROI.',
        'Modern technical stack alignment: Strong coverage of modern React 19, TypeScript, Node.js, and AWS technologies.',
        'Clean standard section headings that parse cleanly across 99% of ATS applicant scanners.'
      ],
      criticalGaps: [
        'Project section could explicitly highlight open-source contributions or system architecture diagrams.',
        'Could include explicit unit test coverage targets (e.g. "Maintained 94% unit test coverage using Jest").'
      ],
      atsChecks: [
        {
          category: 'Document Parsability',
          status: 'pass',
          detail: 'Text extracted without encoding artifacts or multi-column parsing collisions.',
        },
        {
          category: 'Standard Section Headings',
          status: 'pass',
          detail: 'Summary, Experience, Education, and Skills follow standard ATS ontology.',
        },
        {
          category: 'Contact Information Completeness',
          status: 'pass',
          detail: 'Email, phone, location, and LinkedIn URL are clearly formatted.',
        },
        {
          category: 'Font & Layout Compatibility',
          status: 'pass',
          detail: 'Clean typography without nested tables, text boxes, or invisible glyphs.',
        },
        {
          category: 'Action Verb Impact Density',
          status: 'pass',
          detail: 'High ratio of strong lead verbs (Architected, Designed, Migrated, Integrated).',
        }
      ],
      sections: [
        {
          sectionName: 'Professional Summary',
          score: 92,
          status: 'excellent',
          feedback: ['Concise and highlights 6+ years of relevant distributed systems engineering experience.'],
          suggestions: ['Optionally tailor the summary to mention specific domain domains (Fintech/SaaS).'],
        },
        {
          sectionName: 'Work Experience',
          score: 89,
          status: 'excellent',
          feedback: ['Excellent bullet point structure with strong problem-action-result cadence.'],
          suggestions: ['Add 1-2 extra details about cross-functional collaboration with product management.'],
          rewrites: [
            {
              original: 'Built React dashboard for analytics users.',
              suggested: 'Architected enterprise React/TypeScript analytics dashboard for 120,000+ MAUs, boosting rendering speed by 38%.',
              reasoning: 'Quantifies user scale and performance benchmark to illustrate tangible value.',
              section: 'Experience',
            },
            {
              original: 'Helped reduce server response time with Redis.',
              suggested: 'Engineered an asynchronous task queue with Redis and BullMQ, decreasing p95 latency from 420ms to 85ms.',
              reasoning: 'Highlights technical architecture ownership and exact latency optimization metric.',
              section: 'Experience',
            }
          ]
        },
        {
          sectionName: 'Skills & Tools',
          score: 95,
          status: 'excellent',
          feedback: ['Categorized cleanly into Frontend, Backend & Cloud, and Practices.'],
          suggestions: ['Ensure newer libraries like Next.js 15 or Tailwind v4 are noted if applicable.'],
        }
      ],
      detectedSkills: {
        technical: ['React 19', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Python (FastAPI)', 'Docker', 'Kubernetes', 'AWS'],
        soft: ['Technical Mentorship', 'System Architecture', 'Cross-Functional Collaboration', 'Agile / Scrum'],
        toolsAndFrameworks: ['Next.js', 'Tailwind CSS', 'BullMQ', 'Jest', 'Playwright', 'GitHub Actions', 'Stripe API']
      },
      actionableNextSteps: [
        'Add a dedicated "Key Architectures" bullet detailing high-throughput system capacity.',
        'Target specific job descriptions using the Job Tailor tab to maximize domain match score above 95%.'
      ]
    }
  },
  {
    id: 'sample-pm',
    role: 'Lead Product Manager',
    candidateName: 'Jordan Chen',
    filename: 'Jordan_Chen_Lead_PM_Resume.pdf',
    experienceLevel: '8+ Years Experience',
    summary: 'Strategic B2B SaaS Product Leader experienced in PLG, revenue expansion, and cross-functional engineering execution.',
    mockAnalysis: {
      id: 'sample-analysis-pm-02',
      userId: 'demo-user',
      createdAt: new Date().toISOString(),
      pdfMeta: {
        filename: 'Jordan_Chen_Lead_PM_Resume.pdf',
        filesize: 138200,
        pageCount: 2,
        wordCount: 490,
        extractedText: `JORDAN CHEN
jordan.chen@productmail.com | +1 (555) 892-1049 | New York, NY | linkedin.com/in/jordanchen-pm

EXECUTIVE SUMMARY
Lead Product Manager with 8+ years driving end-to-end product strategy, PLG monetization, and AI-assisted automation for high-growth B2B platforms. Spearheaded 0-to-1 launches that generated $8.5M in ARR within 18 months.

CORE COMPETENCIES
- Strategy & Roadmapping: Product Discovery, OKRs, Opportunity Solution Trees, Agile/Scrum, GTM Strategy
- Analytics & Experiments: SQL, Amplitude, Mixpanel, A/B Testing, User Cohort Retention, User Interviews
- Technical & Design Acumen: Jira, Figma, API Integrations, LLM/AI Workflows, Customer Journey Mapping

EXPERIENCE
Lead Product Manager | Horizon SaaS | 2021 - Present
- Led 14-person cross-functional squad (6 engineers, 2 designers, 2 data scientists) delivering AI-driven automated workflow builder.
- Increased user retention rate from 62% to 81% in Q3 by revamping onboarding activation funnel and self-serve tutorials.
- Generated $3.8M in net-new expansion revenue by introducing tiered enterprise workspace permissions.

Senior Product Manager | Veloce Commerce | 2018 - 2021
- Defined roadmap for merchant checkout experience, reducing cart abandonment rate by 14.5% across 4,000+ online storefronts.
- Conducted 80+ customer discovery interviews and synthesized telemetry metrics to prioritize backlog items.

EDUCATION
B.A. in Economics & Information Systems | Columbia University (2014 - 2018)`,
        uploadDate: new Date().toISOString(),
      },
      overallScore: 85,
      atsScore: 91,
      contentScore: 84,
      formattingScore: 90,
      impactScore: 86,
      keywordScore: 82,
      summary: 'Strong product leadership resume with clear ARR monetization impact, cross-functional squad size metrics, and PLG experience. Highly competitive for Staff/Lead PM positions.',
      keyStrengths: [
        'High commercial impact: Clearly states revenue milestones ($8.5M ARR, $3.8M expansion revenue).',
        'Strong cross-functional leadership indicators: Details exact squad composition and stakeholder alignment.',
        'Data-driven experimentation metrics (A/B testing, 14.5% cart abandonment reduction).'
      ],
      criticalGaps: [
        'Could include more specific AI/LLM infrastructure keywords if targeting AI Product Management roles.',
        'Missing explicit mention of technical frameworks like REST APIs or data warehouse technologies.'
      ],
      atsChecks: [
        {
          category: 'Document Parsability',
          status: 'pass',
          detail: 'Clean plain text extraction with proper line delimiters.',
        },
        {
          category: 'Executive Title Alignment',
          status: 'pass',
          detail: 'Clear match for Lead / Senior Product Manager job family.',
        },
        {
          category: 'Action Verbs & Impact',
          status: 'pass',
          detail: 'Strong leadership verbs (Spearheaded, Led, Revamped, Generated).',
        },
        {
          category: 'Keyword Breadth',
          status: 'warning',
          detail: 'Recommend adding specific data tools like Snowflake, dbt, or PostHog if applicable.',
          recommendation: 'Incorporate modern data stack keywords in the skills section.'
        }
      ],
      sections: [
        {
          sectionName: 'Executive Summary',
          score: 88,
          status: 'good',
          feedback: ['Strong summary highlighting 8+ years and 0-to-1 ARR milestones.'],
          suggestions: ['Add 1 sentence on preferred industry segment (Fintech, DevTools, or Enterprise B2B).'],
        },
        {
          sectionName: 'Experience',
          score: 86,
          status: 'good',
          feedback: ['Great balance between customer discovery and commercial outcomes.'],
          suggestions: ['Add a bullet point on collaborating with sales/marketing on product-led growth.'],
          rewrites: [
            {
              original: 'Improved onboarding experience and user retention.',
              suggested: 'Revamped self-serve onboarding activation flow, lifting 90-day cohort retention from 62% to 81%.',
              reasoning: 'Specifies exact timeline, cohort definition, and percentage lift.',
              section: 'Experience',
            }
          ]
        }
      ],
      detectedSkills: {
        technical: ['SQL', 'A/B Testing', 'Amplitude', 'Mixpanel', 'Figma', 'Jira', 'API Integrations'],
        soft: ['Cross-Functional Leadership', 'User Discovery', 'Executive Stakeholder Management', 'PLG Strategy'],
        toolsAndFrameworks: ['Opportunity Solution Trees', 'Cohort Retention Analysis', 'GTM Planning', 'OKRs']
      },
      actionableNextSteps: [
        'Add 1-2 enterprise integration bullet points to appeal to B2B SaaS recruiters.',
        'Use the AI Cover Letter Studio to generate a tailored narrative for VP/Director of Product roles.'
      ]
    }
  }
];
