import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { AboutModal } from './components/AboutModal';
import { HomeSection } from './components/HomeSection';
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
  
  const [activeTab, setActiveTab] = useState<'home' | 'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile'>('home');
  
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

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
    <div className="min-h-screen bg-transparent text-[#1C1917] flex flex-col font-sans transition-colors duration-200">
      
      {/* Navigation Bar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenAboutModal={() => setAboutModalOpen(true)}
        onLogout={handleLogout}
        hasAnalyzedResume={!!analysisResult}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* User Session Banner or Guest Callout */}
        {!user ? (
          <div className="bg-white/85 backdrop-blur-xs border border-[#E5DDD0] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors shadow-xs">
            <div className="flex items-center space-x-3.5">
              <div className="w-9 h-9 bg-emerald-100/90 rounded-lg text-emerald-700 shrink-0 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917]">Confidential Profile & Isolated Resume Storage</h2>
                <p className="text-xs text-[#78716C]">
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
          <div className="flex items-center justify-between bg-white/85 backdrop-blur-xs border border-[#E5DDD0] rounded-xl px-4 py-2.5 text-xs text-[#78716C] transition-colors shadow-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Active session: <strong className="text-[#1C1917] font-semibold">{user.name}</strong> ({user.email})</span>
            </div>
            <button
              onClick={() => setActiveTab('profile')}
              className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              Saved Audits →
            </button>
          </div>
        )}

        {/* Tab View Routing */}

        {/* TAB 1: Home (Dedicated Description & Value Overview) */}
        {activeTab === 'home' && (
          <HomeSection
            onStartAudit={() => setActiveTab('analyzer')}
            onLoadSample={(sample) => {
              setAnalysisResult(sample);
              setActiveTab('analyzer');
            }}
            onOpenAuthModal={() => setAuthModalOpen(true)}
            userLoggedIn={!!user}
          />
        )}

        {/* TAB 2: Combined Audit, Score & ATS Review Window */}
        {activeTab === 'analyzer' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Header banner for the unified workspace */}
            {!analysisResult && (
              <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-2">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Unified ATS & Resume Diagnostic Engine</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#1C1917] tracking-tight">
                  Comprehensive Resume Audit & ATS Review
                </h1>

                <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl mx-auto leading-relaxed">
                  Upload your PDF resume below to trigger an instant 360° audit: complete ATS parsing scores, format compatibility checks, keyword density analysis, and quantifiable bullet rewrites in one unified view.
                </p>
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

            {/* Deep Analysis Results & Combined ATS Scorecard */}
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
      <footer className="mt-auto border-t border-[#E5DDD0] bg-white/80 backdrop-blur-xs py-6 text-xs text-[#78716C] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#1C1917]">ResuMind</span>
            <span>•</span>
            <p className="font-medium text-[#78716C]">Professional Career SaaS & ATS Benchmark Platform</p>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setAboutModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 hover:underline font-semibold cursor-pointer"
            >
              What is ResuMind?
            </button>
            <SupabaseBadge />
            <div className="flex items-center space-x-2 text-[11px] text-[#44403C] font-medium bg-[#F6F1EA]/90 px-3 py-1 rounded-lg border border-[#E5DDD0]">
              <span>Contact: <strong className="text-[#1C1917] font-semibold">Tathagata Chakraborty</strong></span>
              <span>•</span>
              <a
                href="mailto:tathagatachakraborty1234@gmail.com"
                className="text-emerald-700 hover:text-emerald-800 hover:underline flex items-center space-x-1 font-semibold"
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

