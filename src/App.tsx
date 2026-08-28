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
import { User, AnalysisResult } from './types';
import { ShieldCheck, Mail, UserPlus, FileCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
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
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* User Session Banner or Guest Callout */}
        {!user ? (
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Confidential Profile & Isolated Resume Storage</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Each authenticated account gets isolated resume audit histories, private cover letter records, and customized target role baselines.
                </p>
              </div>
            </div>

            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-lg shrink-0 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign In / Create Account</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active session: <strong className="text-slate-900 dark:text-white">{user.name}</strong> ({user.email})</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-slate-900 dark:text-slate-100 hover:underline font-semibold cursor-pointer"
            >
              Saved Audits →
            </button>
          </div>
        )}

        {/* Tab View Routing */}

        {/* TAB 1: Main Analyzer */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6">
            
            {/* Page Title Header */}
            {!analysisResult && (
              <div className="text-center max-w-2xl mx-auto space-y-2.5 pt-2 pb-1">
                <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <span>Created by Tathagata Chakraborty</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <a
                    href="mailto:tathagatachakraborty1234@gmail.com"
                    className="flex items-center space-x-1 hover:underline text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <Mail className="w-3 h-3" />
                    <span>tathagatachakraborty1234@gmail.com</span>
                  </a>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Resume Diagnostics & ATS Compatibility Audit
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
                  Upload your PDF resume to evaluate ATS parsing readability, uncover missing high-frequency keywords, and review quantified bullet rewrites.
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
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1220] py-5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-medium text-slate-600 dark:text-slate-400">ResuMind • Professional Resume Audit & Keyword Benchmark</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SupabaseBadge />
            <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700">
              <span>Contact: <strong>Tathagata Chakraborty</strong></span>
              <span>•</span>
              <a
                href="mailto:tathagatachakraborty1234@gmail.com"
                className="text-slate-800 dark:text-slate-200 hover:underline flex items-center space-x-1 font-semibold"
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
