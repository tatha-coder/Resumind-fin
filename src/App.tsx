import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { AtsReviewSection } from './components/AtsReviewSection';
import { UserProfile } from './components/UserProfile';
import { PdfUploader } from './components/PdfUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { JobMatchSection } from './components/JobMatchSection';
import { CoverLetterModal } from './components/CoverLetterModal';
import { InterviewPrepModal } from './components/InterviewPrepModal';
import { SupabaseBadge } from './components/SupabaseBadge';
import { User, AnalysisResult } from './types';
import { ShieldCheck, Mail, UserPlus, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import { supabase, mapSupabaseUser } from './lib/supabase';
import { safeFetchJson } from './lib/api';
import { SAMPLE_RESUMES } from './lib/sampleResumes';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('resumind_token'));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'analyzer' | 'atsReview' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile'>('analyzer');
  
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Dark / Light Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('resumind_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('resumind_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Initialize and listen to Supabase Auth state & local session
  useEffect(() => {
    let mounted = true;

    // 1. Check direct Supabase Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        setToken(session.access_token);
        localStorage.setItem('resumind_token', session.access_token);
        if (mappedUser.targetRole) setTargetRole(mappedUser.targetRole);
      } else if (token) {
        // Fallback: Check backend /api/auth/me if local token exists
        safeFetchJson('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => {
            if (!mounted) return;
            if (res.ok && res.data?.user) {
              setUser(res.data.user);
              if (res.data.user?.targetRole) setTargetRole(res.data.user.targetRole);
            }
          })
          .catch(() => {
            // Keep user if offline or static host
          });
      }
    });

    // 2. Listen to active Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        const mappedUser = mapSupabaseUser(session.user);
        setUser(mappedUser);
        setToken(session.access_token);
        localStorage.setItem('resumind_token', session.access_token);
        if (mappedUser.targetRole) setTargetRole(mappedUser.targetRole);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setToken(null);
        localStorage.removeItem('resumind_token');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginSuccess = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    if (newUser.targetRole) setTargetRole(newUser.targetRole);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('resumind_token');
    setUser(null);
    setToken(null);
    setAnalysisResult(null);
    setActiveTab('analyzer');
  };

  const handleUploadAndAnalyze = async (pdfBase64: string, filename: string, role: string) => {
    if (!token || !user) {
      setAuthModalOpen(true);
      throw new Error('Please sign in or create an account to audit and save resumes to your profile.');
    }

    setLoading(true);

    try {
      const res = await safeFetchJson('/api/resume/upload-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pdfBase64,
          filename,
          targetRole: role || targetRole,
        }),
      });

      if (!res.ok || !res.data) {
        throw new Error(res.error || 'Failed to analyze resume.');
      }

      setAnalysisResult(res.data.analysis);
    } finally {
      setLoading(false);
    }
  };

  const handleResetUpload = () => {
    setAnalysisResult(null);
  };

  const handleSelectHistoryResume = (selectedAnalysis: AnalysisResult) => {
    setAnalysisResult(selectedAnalysis);
    setActiveTab('analyzer');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-black text-[#0F172A] dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAboutModal={() => setAboutModalOpen(true)}
        onLogout={handleLogout}
        hasAnalyzedResume={!!analysisResult}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* User Session Banner or Guest Callout */}
        {!user ? (
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-white">Confidential Profile & Isolated Resume Storage</h2>
                <p className="text-xs text-[#64748B] dark:text-slate-400">
                  Each authenticated account gets isolated resume audit histories, private cover letter records, and customized target role baselines.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-lg shrink-0 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-[#64748B] dark:text-slate-300 transition-colors shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active session: <strong className="text-[#0F172A] dark:text-white font-semibold">{user.name}</strong> ({user.email})</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Saved Audits →
            </button>
          </div>
        )}

        {/* Tab View Routing */}

        {/* TAB 1: Main Analyzer */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            
            {/* HERO SECTION */}
            {!analysisResult && (
              <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 pb-2">
                
                {/* Author Badge & About trigger */}
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-slate-800 text-[#64748B] dark:text-slate-300 text-xs font-medium shadow-xs">
                  <span>Created by Tathagata Chakraborty</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    onClick={() => setAboutModalOpen(true)}
                    className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>What is ResuMind?</span>
                  </button>
                </div>

                {/* Hero Title with requested Highlight */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-tight">
                  <span className="font-madinah font-normal text-4xl sm:text-5xl md:text-6xl tracking-normal text-[#0F172A] dark:text-slate-100 block sm:inline-block sm:mr-2">
                    Your resume gets one chance.
                  </span>{' '}
                  <span className="text-emerald-600 dark:text-emerald-400 inline-block font-extrabold font-heading">
                    Make it count.
                  </span>
                </h1>

                {/* Hero Subtitle */}
                <p className="text-sm sm:text-base text-[#334155] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                  ResuMind is your smart resume companion that analyzes your resume, identifies strengths and weaknesses, checks ATS compatibility, and gives you practical recommendations to make your resume stronger.
                </p>

                {/* 3 Quick Benefit Badges */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>ATS Parsability Audit</span>
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-900/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>Keyword Density Diagnostic</span>
                  </span>
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Actionable Recommendations</span>
                  </span>
                </div>
              </div>
            )}

            {/* PDF Dropzone Component */}
            <PdfUploader
              onUploadAndAnalyze={handleUploadAndAnalyze}
              onLoadSampleAnalysis={(sample) => setAnalysisResult(sample)}
              loading={loading}
              analyzedPdfMeta={analysisResult ? analysisResult.pdfMeta : null}
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              onReset={handleResetUpload}
            />

            {/* Deep Analysis Results */}
            {analysisResult && (
              <AnalysisResults
                analysis={analysisResult}
                onOpenJobMatch={() => setActiveTab('jobMatch')}
                onOpenCoverLetter={() => setActiveTab('coverLetter')}
                onOpenInterviewPrep={() => setActiveTab('interviewPrep')}
              />
            )}

          </div>
        )}

        {/* TAB 2: ATS Review (Dedicated Option) */}
        {activeTab === 'atsReview' && (
          <AtsReviewSection
            analysis={analysisResult}
            onNavigateToUpload={() => setActiveTab('analyzer')}
            onLoadSample={(sample) => {
              setAnalysisResult(sample);
            }}
          />
        )}

        {/* TAB 3: Job Matcher & Tailor */}
        {activeTab === 'jobMatch' && analysisResult && token && (
          <JobMatchSection
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 4: Cover Letter */}
        {activeTab === 'coverLetter' && analysisResult && token && (
          <CoverLetterModal
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 5: Interview Prep */}
        {activeTab === 'interviewPrep' && analysisResult && token && (
          <InterviewPrepModal
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 6: User Profile & Private History */}
        {activeTab === 'profile' && user && token && (
          <UserProfile
            user={user}
            token={token}
            onUpdateUser={setUser}
            onSelectHistoryResume={handleSelectHistoryResume}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-black py-6 text-xs text-[#64748B] dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#0F172A] dark:text-white">ResuMind</span>
            <span>•</span>
            <p className="font-medium text-[#64748B] dark:text-slate-400">Professional Career SaaS & ATS Benchmark Platform</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setAboutModalOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              What is ResuMind?
            </button>
            <SupabaseBadge />
            <div className="flex items-center space-x-2 text-[11px] text-[#334155] dark:text-slate-300 font-medium bg-[#F8FAFC] dark:bg-[#121212] px-3 py-1 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <span>Contact: <strong className="text-[#0F172A] dark:text-white font-semibold">Tathagata Chakraborty</strong></span>
              <span>•</span>
              <a
                href="mailto:tathagatachakraborty1234@gmail.com"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1 font-semibold"
              >
                <Mail className="w-3 h-3" />
                <span>tathagatachakraborty1234@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
        onSelectSample={() => {
          setAnalysisResult(SAMPLE_RESUMES[0].mockAnalysis);
          setActiveTab('analyzer');
        }}
      />

    </div>
  );
}

