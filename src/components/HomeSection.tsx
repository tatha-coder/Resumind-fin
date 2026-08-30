import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  FileCheck, 
  Gauge, 
  Target, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  Layers
} from 'lucide-react';
import { SAMPLE_RESUMES } from '../lib/sampleResumes';
import { AnalysisResult } from '../types';

interface HomeSectionProps {
  onStartAudit: () => void;
  onLoadSample: (sample: AnalysisResult) => void;
  onOpenAuthModal: () => void;
  userLoggedIn: boolean;
}

// Bidirectional pop up animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.5, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }
};

const popIn = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.45, 
      ease: [0.175, 0.885, 0.32, 1.12] 
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04
    }
  }
};

// Reusable viewport config for bidirectional scrolling
const bidirectionalViewport = {
  once: false,
  amount: 0.15
};

export const HomeSection: React.FC<HomeSectionProps> = ({
  onStartAudit,
  onLoadSample,
  onOpenAuthModal,
  userLoggedIn,
}) => {
  return (
    <div className="w-full space-y-12 pb-8 overflow-hidden">
      
      {/* 1. HERO SECTION (Bidirectional Pop-up) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={bidirectionalViewport}
        variants={staggerContainer}
        className="text-center max-w-4xl mx-auto space-y-5 pt-4"
      >
        
        {/* Creator & Platform Badge */}
        <motion.div 
          variants={popIn} 
          className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E5DDD0] text-[#78716C] text-xs font-medium shadow-xs"
        >
          <span className="flex items-center space-x-1 text-emerald-800 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>ResuMind Intelligence Platform</span>
          </span>
          <span className="text-stone-300">•</span>
          <span>Crafted by <strong>Tathagata Chakraborty</strong></span>
        </motion.div>

        {/* Dynamic Display Headline */}
        <motion.h1 variants={fadeInUp} className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#1C1917] tracking-tight leading-tight">
          <span className="font-madinah font-normal text-4xl sm:text-6xl md:text-7xl tracking-normal text-[#1C1917] block sm:inline-block sm:mr-3">
            Your resume gets one chance.
          </span>{' '}
          <span className="text-emerald-700 inline-block font-extrabold font-heading">
            Make it count.
          </span>
        </motion.h1>

        {/* Expanded Engaging Value Subtitle */}
        <motion.p variants={fadeInUp} className="text-base sm:text-lg text-[#57534E] leading-relaxed max-w-3xl mx-auto font-normal">
          ResuMind is an enterprise-grade AI resume auditor and career diagnostic suite. In seconds, it evaluates your ATS parsability, diagnoses critical formatting risks, enhances bullet points with measurable impact, and generates customized cover letters and interview prep.
        </motion.p>

        {/* Hero Call to Action Buttons */}
        <motion.div variants={popIn} className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={onStartAudit}
            className="w-full sm:w-auto px-7 py-3.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer group hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileCheck className="w-4 h-4" />
            <span>Launch Resume & ATS Audit</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onLoadSample(SAMPLE_RESUMES[0].mockAnalysis)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white/90 hover:bg-white text-[#1C1917] font-semibold text-sm rounded-xl transition-all border border-[#E5DDD0] flex items-center justify-center space-x-2 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Explore Live Demo Report</span>
          </button>
        </motion.div>

        {/* Quick Highlights Bar */}
        <motion.div variants={staggerContainer} className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-3xl mx-auto text-left">
          {[
            { metric: '100%', label: 'ATS Compliant Parsing' },
            { metric: '< 3 Sec', label: 'Full 360° Diagnostic' },
            { metric: 'XYZ Rule', label: 'Google Metric Formula' },
            { metric: 'Supabase', label: 'Secure Cloud Storage' },
          ].map((item, idx) => (
            <motion.div 
              key={idx} 
              variants={popIn}
              whileHover={{ y: -3, scale: 1.02 }}
              className="bg-white/80 border border-[#E5DDD0] rounded-xl p-3 shadow-2xs"
            >
              <div className="text-lg font-bold text-emerald-800">{item.metric}</div>
              <div className="text-xs text-[#78716C]">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 2. THE PROBLEM VS. THE SOLUTION (Bidirectional Scroll Pop-up) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={bidirectionalViewport}
        variants={fadeInUp}
        className="bg-white/90 border border-[#E5DDD0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <motion.span 
            variants={popIn}
            className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-200"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>The Hiring Bottleneck</span>
          </motion.span>
          <motion.h2 variants={fadeInUp} className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Why 75% of Qualified Resumes Never Reach a Human
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-xs sm:text-sm text-[#78716C]">
            Enterprise hiring workflows depend heavily on Applicant Tracking Systems (ATS) like Workday, Greenhouse, and Lever. Small formatting oversights or missing keywords lead to immediate silent disqualification.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 pt-2">
          {/* Traditional Resume Block */}
          <motion.div 
            variants={popIn}
            className="bg-[#FAF7F2] border border-rose-200/80 rounded-xl p-5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center space-x-2 text-rose-700 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Standard Un-Optimized Resumes</span>
            </div>
            <ul className="space-y-2 text-xs text-[#57534E]">
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Multi-column tables & icons:</strong> Scrambles automated ATS parsers, turning work experience into gibberish.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Passive duty descriptions:</strong> "Responsible for managing tasks" fails to demonstrate real business impact.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span><strong>Missing JD keywords:</strong> Drops your match ranking below the top 10% candidate cutoff.</span>
              </li>
            </ul>
          </motion.div>

          {/* ResuMind AI Block */}
          <motion.div 
            variants={popIn}
            className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-5 space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
          >
            <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>ResuMind-Optimized Resumes</span>
            </div>
            <ul className="space-y-2 text-xs text-[#57534E]">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Clean single-tier layout validation:</strong> 100% parsable by modern enterprise ATS algorithms.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Google XYZ Metric Rewrites:</strong> "Accomplished [X] as measured by [Y] by doing [Z]" with measurable ROI.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Targeted Domain Keyword Ingestion:</strong> Automatically detects missing hard & soft technical competencies.</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </motion.section>

      {/* 3. CORE PLATFORM MODULES (Bidirectional Scroll Pop-up Grid) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={bidirectionalViewport}
        variants={staggerContainer}
        className="space-y-6"
      >
        <motion.div variants={fadeInUp} className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-800 border border-emerald-200">
            <Layers className="w-3.5 h-3.5" />
            <span>Comprehensive Suite</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] tracking-tight">
            Everything You Need to Land Top-Tier Interviews
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C]">
            One unified platform that guides you from PDF upload to tailored job applications and mock interview readiness.
          </p>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Module 1 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Unified ATS & Audit Scorecard
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Combines ATS parsability, impact score, formatting compliance, and keyword density under one unified diagnostic window with letter grades (A+ to D).
            </p>
          </motion.div>

          {/* Module 2 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              AI Bullet Enhancer & Rewrites
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Transforms weak bullet points into high-impact accomplishment statements backed by quantitative numbers and strong action verbs.
            </p>
          </motion.div>

          {/* Module 3 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Target Job Matcher
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Paste any job description to compare your resume in real time, discover exact keyword matches, and bridge critical skill gaps.
            </p>
          </motion.div>

          {/* Module 4 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Instant Cover Letter Drafter
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Generates tailored, persuasive 3-paragraph cover letters matching your resume background directly with the target company's job requirements.
            </p>
          </motion.div>

          {/* Module 5 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Interview Preparation Guide
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Simulates technical, behavioral, and role-specific interview questions based on your resume's weaknesses with model STAR responses.
            </p>
          </motion.div>

          {/* Module 6 */}
          <motion.div 
            variants={popIn}
            whileHover={{ y: -4, scale: 1.02 }}
            className="bg-white/90 border border-[#E5DDD0] rounded-xl p-5 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Supabase User Vault
            </h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Secure authentication and database isolation to save multiple audit iterations, track score improvements over time, and export markdown reports.
            </p>
          </motion.div>

        </motion.div>
      </motion.section>

      {/* 4. STEP-BY-STEP WORKFLOW (Bidirectional Scroll Pop-up Steps) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={bidirectionalViewport}
        variants={fadeInUp}
        className="bg-white/90 border border-[#E5DDD0] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Simple 4-Step Process
          </span>
          <h2 className="text-2xl font-bold text-[#1C1917]">
            How ResuMind Elevates Your Career
          </h2>
        </div>

        <motion.div variants={staggerContainer} className="grid sm:grid-cols-4 gap-4">
          {[
            { num: 1, title: 'Upload PDF Resume', desc: 'Upload any single or multi-page resume. Text and metadata are parsed instantly.' },
            { num: 2, title: 'Get 360° Diagnostic', desc: 'Inspect your overall score, ATS checks, format safety, and missing industry skills.' },
            { num: 3, title: 'Enhance & Tailor', desc: 'Copy high-impact metric rewrites and generate job-matched cover letters with 1-click.' },
            { num: 4, title: 'Ace The Interview', desc: 'Practice tailored behavioral and technical Q&A to speak with confidence.' },
          ].map((step) => (
            <motion.div 
              key={step.num}
              variants={popIn}
              whileHover={{ y: -3 }}
              className="bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-4 space-y-2"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                {step.num}
              </div>
              <h4 className="text-xs font-bold text-[#1C1917]">{step.title}</h4>
              <p className="text-[11px] text-[#78716C]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* 5. BOTTOM CALL TO ACTION (Bidirectional Scroll Pop-up Banner) */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={bidirectionalViewport}
        variants={fadeInUp}
        className="bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-2xl p-8 sm:p-10 text-white text-center space-y-5 shadow-md"
      >
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-200 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready to transform your job search?</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Audit Your Resume with ResuMind Today
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
            Take the guesswork out of job applications. Uncover hidden parsing roadblocks, refine your accomplishments, and stand out in any recruiter's queue.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onStartAudit}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-stone-100 text-emerald-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <FileCheck className="w-4 h-4 text-emerald-800" />
            <span>Start Free Resume Audit</span>
          </button>
          {!userLoggedIn && (
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-900/60 hover:bg-emerald-900 text-white border border-emerald-600/50 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Sign In / Create Profile</span>
            </button>
          )}
        </div>
      </motion.section>

    </div>
  );
};
