# 🤖 AI Resume Analysis System

> An intelligent AI-powered Resume Analysis platform that helps job seekers optimize their resumes through ATS scoring, AI feedback, skill gap analysis, and personalized recommendations.

**🌐 Live Demo:** https://ai-resume-analysis-s.ai.studio

---

## 📌 Overview

The AI Resume Analysis System is a modern web application that enables users to upload their resumes, receive an in-depth AI-powered analysis, and improve their chances of getting shortlisted by Applicant Tracking Systems (ATS) and recruiters.

The platform leverages Google's Gemini AI to extract information from PDF resumes, evaluate resume quality, identify strengths and weaknesses, and generate actionable suggestions for improvement.

Designed with secure authentication, each user has their own private dashboard where their uploaded resumes and analysis history remain accessible only to them.

---

## ✨ Features

### 🔐 Secure Authentication
- Email & Password based login
- Individual user accounts
- Private user dashboard
- Protected routes
- Secure session management

---

### 📄 Resume Upload
- Upload PDF resumes
- Drag & Drop support
- File validation
- Resume preview
- Fast upload processing

---

### 🤖 AI Resume Analysis

The AI engine performs comprehensive analysis including:

- Resume Summary
- ATS Compatibility Score
- Resume Strength Score
- Overall Resume Rating
- Skills Extraction
- Experience Evaluation
- Education Review
- Projects Analysis
- Achievement Identification
- Keyword Detection
- Missing Keyword Suggestions
- Formatting Review
- Grammar Suggestions
- Readability Score
- Professionalism Assessment

---

### 🎯 ATS Optimization

The application evaluates resumes based on ATS best practices including:

- Resume formatting
- Keyword optimization
- Section structure
- Contact information
- Skills relevance
- Experience quality
- Education formatting
- Resume completeness

---

### 💡 AI Recommendations

Personalized suggestions include:

- Skills to add
- Missing technologies
- Resume formatting improvements
- Better action verbs
- Project enhancement suggestions
- Experience improvements
- Professional summary optimization
- Industry-specific recommendations

---

### 📊 Analytics Dashboard

Users can view:

- ATS Score
- Resume Score
- Skill Distribution
- Missing Skills
- Strength Areas
- Improvement Areas
- Resume History
- Previous Analysis Reports

---

### 📂 Resume History

Users can:

- View previous uploads
- Access past AI reports
- Track resume improvements
- Compare analyses over time

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Next.js
- TypeScript
- Tailwind CSS
- ShadCN UI

### Backend
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Storage

### AI
- Google Gemini API
- AI Resume Parsing
- Natural Language Processing (NLP)

### Deployment
- Google AI Studio
- Vercel (Optional)
- GitHub

---

## 📁 Project Structure

```
AI-Resume-Analysis-System/
│
├── app/
├── components/
├── lib/
├── hooks/
├── public/
├── styles/
├── utils/
├── types/
├── supabase/
├── assets/
├── README.md
└── package.json
```

---

## 🚀 Installation

Clone the repository

```bash
git clone https://github.com/yourusername/AI-Resume-Analysis-System.git
```

Go inside the project

```bash
cd AI-Resume-Analysis-System
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env.local` file.

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

## 🔄 Workflow

```
User Login
      │
      ▼
Upload Resume (PDF)
      │
      ▼
PDF Parsing
      │
      ▼
Gemini AI Analysis
      │
      ▼
ATS Evaluation
      │
      ▼
Skill Extraction
      │
      ▼
Feedback Generation
      │
      ▼
Dashboard Report
```

---

## 📈 Future Enhancements

- Resume Builder
- Cover Letter Generator
- Job Description Matching
- AI Interview Preparation
- Portfolio Analysis
- LinkedIn Profile Review
- Resume Version Comparison
- Multi-language Support
- Resume Templates
- HR Recruiter Dashboard
- Bulk Resume Screening

---

## 🔒 Security

- Secure Authentication
- Row Level Security (RLS)
- Protected Database Access
- User-specific Data Isolation
- Encrypted Sessions
- Secure File Storage

---

## 📸 Screenshots

Add screenshots of:

- Login Page
- Dashboard
- Resume Upload
- AI Analysis Report
- ATS Score
- Analytics Dashboard

---

## 🎯 Use Cases

- Students
- Fresh Graduates
- Experienced Professionals
- Career Switchers
- Recruiters
- Placement Cells
- Career Coaches

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push changes

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Tathagata Chakraborty**

B.Tech CSE (AI & ML)

---

## ⭐ Support

If you found this project useful:

⭐ Star the repository

🍴 Fork the project

📢 Share it with others

---

## 📬 Contact

For suggestions, issues, or collaborations, please open an Issue on GitHub or submit a Pull Request.

---

### Built with ❤️ using React, Next.js, Supabase, Google Gemini AI, and Tailwind CSS.
