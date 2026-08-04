import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { UserProfile } from './components/UserProfile';
import { PdfUploader } from './components/PdfUploader';
import { AnalysisResults } from './components/AnalysisResults';
import { JobMatchSection } from './components/JobMatchSection';
import { CoverLetterModal } from './components/CoverLetterModal';
import { InterviewPrepModal } from './components/InterviewPrepModal';
import { SupabaseBadge } from './components/SupabaseBadge';
import { InteractiveCursor } from './components/InteractiveCursor';
import { User, AnalysisResult, PdfMetadata } from './types';
import { Sparkles, ShieldCheck, FileText, ArrowRight, UserPlus, Info, Mail } from 'lucide-react';
import { supabase, mapSupabaseUser } from './lib/supabase';
import { safeFetchJson } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('resumind_token'));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile'>('analyzer');
  
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
      throw new Error('Please sign in or create an account to analyze and save resumes to your profile.');
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200 relative">
      
      {/* Custom Interactive Reactive Cursor */}
      <InteractiveCursor theme={theme} />

      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        hasAnalyzedResume={!!analysisResult}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* User Session Banner or Guest Callout */}
        {!user ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-800 rounded-xl text-blue-600 dark:text-blue-400 shrink-0 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Unique Profile & Confidential Storage</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each user account has isolated resume analysis records, custom target roles, and private cover letters.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 shadow-xs transition-colors duration-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Logged in as <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.email})</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold underline cursor-pointer"
            >
              View My Confidential History →
            </button>
          </div>
        )}

        {/* Tab View Routing */}

        {/* TAB 1: Main Analyzer */}
        {activeTab === 'analyzer' && (
          <div className="space-y-8">
            
            {/* Page Title Header */}
            {!analysisResult && (
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-bold shadow-xs">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Created by Tathagata Chakraborty</span>
                  </div>
                  <span className="hidden sm:inline text-blue-300 dark:text-blue-700">•</span>
                  <a
                    href="mailto:tathagatachakraborty1234@gmail.com"
                    className="flex items-center space-x-1 hover:underline text-blue-800 dark:text-blue-200 font-semibold"
                  >
                    <Mail className="w-3 h-3" />
                    <span>tathagatachakraborty1234@gmail.com</span>
                  </a>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  AI Resume Analysis & ATS Optimizer
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload your PDF resume to receive immediate ATS compliance scores, section-by-section diagnostics, and AI-rewritten high-impact metrics.
                </p>
              </div>
            )}

            {/* PDF Dropzone Component */}
            <PdfUploader
              onUploadAndAnalyze={handleUploadAndAnalyze}
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

        {/* TAB 2: Job Matcher & Tailor */}
        {activeTab === 'jobMatch' && analysisResult && token && (
          <JobMatchSection
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 3: Cover Letter */}
        {activeTab === 'coverLetter' && analysisResult && token && (
          <CoverLetterModal
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 4: Interview Prep */}
        {activeTab === 'interviewPrep' && analysisResult && token && (
          <InterviewPrepModal
            analysis={analysisResult}
            token={token}
          />
        )}

        {/* TAB 5: User Profile & Private History */}
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
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600 dark:text-slate-400">ResuMind AI Resume System • Multi-tenant Profile Isolation</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <SupabaseBadge />
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <span>Contact: <strong>Tathagata Chakraborty</strong></span>
              <span>•</span>
              <a
                href="mailto:tathagatachakraborty1234@gmail.com"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1 font-semibold"
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

    </div>
  );
}
