import React from 'react';
import { 
  FileCheck,
  User, 
  LogOut, 
  History, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  ShieldCheck, 
  Sun, 
  Moon,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { User as UserType } from '../types';
import { SupabaseBadge } from './SupabaseBadge';

interface NavbarProps {
  user: UserType | null;
  activeTab: 'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile';
  setActiveTab: (tab: 'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile') => void;
  onOpenAuthModal: () => void;
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
  onLogout,
  hasAnalyzedResume,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0e1422] border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
          onClick={() => setActiveTab('analyzer')}
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs tracking-wider">
            RM
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                ResuMind
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded">
                Audit
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal hidden sm:block">
              Resume Diagnostics & ATS Scoring
            </p>
          </div>
        </div>

        {/* Primary Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100 dark:bg-[#131b2e] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Audit & Score</span>
          </button>

          <button
            onClick={() => setActiveTab('jobMatch')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'jobMatch'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs cursor-pointer'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to enable Job Matching' : 'Tailor resume to job description'}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Match</span>
          </button>

          <button
            onClick={() => setActiveTab('coverLetter')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'coverLetter'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs cursor-pointer'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to generate cover letters' : 'Cover Letter Drafter'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('interviewPrep')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'interviewPrep'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs cursor-pointer'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to generate interview questions' : 'Interview Q&A Guide'}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </nav>

        {/* Right Action Utilities */}
        <div className="flex items-center space-x-3 shrink-0">
          
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
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
                className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-slate-100 dark:bg-[#131b2e] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">
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
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 py-2 px-2 bg-slate-50 dark:bg-[#0c1220] overflow-x-auto">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-3 py-1 rounded-md text-xs font-medium ${activeTab === 'analyzer' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Audit
        </button>
        <button
          onClick={() => setActiveTab('jobMatch')}
          disabled={!hasAnalyzedResume}
          className={`px-3 py-1 rounded-md text-xs font-medium ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'jobMatch' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Job Match
        </button>
        <button
          onClick={() => setActiveTab('coverLetter')}
          disabled={!hasAnalyzedResume}
          className={`px-3 py-1 rounded-md text-xs font-medium ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'coverLetter' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Cover Letter
        </button>
        <button
          onClick={() => setActiveTab('interviewPrep')}
          disabled={!hasAnalyzedResume}
          className={`px-3 py-1 rounded-md text-xs font-medium ${!hasAnalyzedResume ? 'opacity-40' : activeTab === 'interviewPrep' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
        >
          Interview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3 py-1 rounded-md text-xs font-medium ${activeTab === 'profile' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-400'}`}
        >
          History
        </button>
      </div>
    </header>
  );
};
