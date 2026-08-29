import React from 'react';
import { 
  FileCheck,
  User, 
  LogOut, 
  History, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Sun, 
  Moon,
  Sparkles,
  Info,
  Layers,
  Gauge
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  activeTab: 'analyzer' | 'atsReview' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile';
  setActiveTab: (tab: 'analyzer' | 'atsReview' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile') => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onLogout: () => void;
  hasAnalyzedResume: boolean;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenAboutModal,
  onLogout,
  hasAnalyzedResume,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 text-[#0F172A] dark:text-slate-100 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
          onClick={() => setActiveTab('analyzer')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            RM
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-[#0F172A] dark:text-white">
                ResuMind
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 rounded border border-emerald-200/60 dark:border-emerald-800">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-normal hidden sm:block">
              Resume Diagnostics & ATS Review
            </p>
          </div>
        </div>

        {/* Primary Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1 bg-[#F8FAFC] dark:bg-[#121212] p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
          
          {/* 1. Audit & Score */}
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Audit & Score</span>
          </button>

          {/* 2. ATS Review (Requested separate option) */}
          <button
            onClick={() => setActiveTab('atsReview')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'atsReview'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="Detailed ATS Score & Compliance Review"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>ATS Review</span>
          </button>

          {/* 3. Job Match */}
          <button
            onClick={() => setActiveTab('jobMatch')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-[#64748B] dark:text-slate-500'
                : activeTab === 'jobMatch'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs cursor-pointer'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to enable Job Matching' : 'Tailor resume to job description'}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Match</span>
          </button>

          {/* 4. Cover Letter */}
          <button
            onClick={() => setActiveTab('coverLetter')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-[#64748B] dark:text-slate-500'
                : activeTab === 'coverLetter'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs cursor-pointer'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to generate cover letters' : 'Cover Letter Drafter'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>

          {/* 5. Interview Prep */}
          <button
            onClick={() => setActiveTab('interviewPrep')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-[#64748B] dark:text-slate-500'
                : activeTab === 'interviewPrep'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs cursor-pointer'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to generate interview questions' : 'Interview Q&A Guide'}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>

          {/* 6. History / Profile */}
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-[#334155] dark:text-slate-400 hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </nav>

        {/* Right Action Utilities */}
        <div className="flex items-center space-x-2.5 shrink-0">
          
          {/* About / Description Modal Button */}
          <button
            onClick={onOpenAboutModal}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
            title="What is ResuMind?"
          >
            <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">About</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#64748B] dark:text-slate-300 hover:text-[#0F172A] dark:hover:text-white border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Session Profile Badge or Sign In */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-[#F8FAFC] dark:bg-[#121212] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-xs font-semibold text-[#0F172A] dark:text-slate-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 py-2 px-3 bg-[#F8FAFC] dark:bg-black overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'analyzer' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          Audit
        </button>
        <button
          onClick={() => setActiveTab('atsReview')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'atsReview' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          ATS Review
        </button>
        <button
          onClick={() => setActiveTab('jobMatch')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'jobMatch' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          Job Match
        </button>
        <button
          onClick={() => setActiveTab('coverLetter')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'coverLetter' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          Cover Letter
        </button>
        <button
          onClick={() => setActiveTab('interviewPrep')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'interviewPrep' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          Interview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-[#64748B] dark:text-slate-400'}`}
        >
          History
        </button>
      </div>
    </header>
  );
};
