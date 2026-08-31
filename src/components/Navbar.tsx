import React from 'react';
import { 
  FileCheck, 
  User, 
  LogOut, 
  History, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Sparkles,
  Info,
  Layers,
  Home,
  BrainCircuit
} from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  activeTab: 'home' | 'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile';
  setActiveTab: (tab: 'home' | 'analyzer' | 'jobMatch' | 'coverLetter' | 'interviewPrep' | 'profile') => void;
  onOpenAuthModal: () => void;
  onOpenAboutModal: () => void;
  onLogout: () => void;
  hasAnalyzedResume: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenAuthModal,
  onOpenAboutModal,
  onLogout,
  hasAnalyzedResume,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#1C1917]/95 backdrop-blur-md border-b border-stone-800 text-stone-200 transition-colors shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Identity */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
          onClick={() => setActiveTab('home')}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/20 transition-all">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-['Carl_Brown','Cormorant_Garamond','Playfair_Display',Georgia,serif] font-bold text-lg tracking-wide text-white">
                Resu<span className="text-[#10B981]">Mind</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-normal hidden sm:block">
              Resume Diagnostics & ATS Review
            </p>
          </div>
        </div>

        {/* Primary Navigation Bar */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-xl">
          
          {/* 1. Home (Dedicated description, overview & value props) */}
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
            }`}
            title="Overview & Platform Guide"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* 2. Unified Audit, Score & ATS Review */}
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'analyzer'
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
            }`}
            title="Comprehensive Resume Audit, Score & ATS Review in one window"
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Audit & ATS Review</span>
          </button>

          {/* 3. Job Match */}
          <button
            onClick={() => setActiveTab('jobMatch')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-stone-600'
                : activeTab === 'jobMatch'
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60 cursor-pointer'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50 cursor-pointer'
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
                ? 'opacity-40 cursor-not-allowed text-stone-600'
                : activeTab === 'coverLetter'
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60 cursor-pointer'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50 cursor-pointer'
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
                ? 'opacity-40 cursor-not-allowed text-stone-600'
                : activeTab === 'interviewPrep'
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60 cursor-pointer'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50 cursor-pointer'
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
                ? 'bg-stone-800/90 text-emerald-400 shadow-2xs border border-stone-700/60'
                : 'text-stone-300 hover:text-white hover:bg-stone-800/50'
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
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-300 border border-stone-700 text-xs font-semibold transition-colors cursor-pointer"
            title="What is ResuMind?"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">About</span>
          </button>

          {/* User Session Profile Badge or Sign In */}
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center space-x-2 pl-2 pr-3 py-1 bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors cursor-pointer"
              >
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-5 h-5 rounded-full bg-stone-700"
                />
                <span className="text-xs font-semibold text-stone-200 max-w-[100px] truncate">
                  {user.name}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-between border-t border-stone-800 py-2 px-3 bg-[#151311] overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'home' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'analyzer' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          Audit & ATS
        </button>
        <button
          onClick={() => setActiveTab('jobMatch')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40 text-stone-600' : activeTab === 'jobMatch' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          Job Match
        </button>
        <button
          onClick={() => setActiveTab('coverLetter')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40 text-stone-600' : activeTab === 'coverLetter' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          Cover Letter
        </button>
        <button
          onClick={() => setActiveTab('interviewPrep')}
          disabled={!hasAnalyzedResume}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${!hasAnalyzedResume ? 'opacity-40 text-stone-600' : activeTab === 'interviewPrep' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          Interview
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 ${activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-stone-400 hover:text-stone-200'}`}
        >
          History
        </button>
      </div>
    </header>
  );
};
