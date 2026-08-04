import React from 'react';
import { FileText, Sparkles, User, LogOut, History, Briefcase, FileCode, MessageSquare, ShieldCheck, Sun, Moon } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setActiveTab('analyzer')}
        >
          <div className="w-9 h-9 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
            AI
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">ResuMind</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 rounded-md">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">AI Resume Analysis & ATS System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analyzer'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Resume Analysis</span>
          </button>

          <button
            onClick={() => setActiveTab('jobMatch')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'jobMatch'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
            }`}
            title={!hasAnalyzedResume ? 'Upload a resume first to enable Job Matching' : ''}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Job Tailor</span>
          </button>

          <button
            onClick={() => setActiveTab('coverLetter')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'coverLetter'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Cover Letter</span>
          </button>

          <button
            onClick={() => setActiveTab('interviewPrep')}
            disabled={!hasAnalyzedResume}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !hasAnalyzedResume
                ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500'
                : activeTab === 'interviewPrep'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Interview Prep</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-700/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>My Profile</span>
          </button>
        </nav>

        {/* User Account, Theme Changer & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs group"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 group-hover:-rotate-12 transition-transform" />
            )}
          </button>

          <div className="hidden lg:block">
            <SupabaseBadge />
          </div>

          {user ? (
            <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <img
                src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                alt={user.name}
                className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600"
              />
              <div 
                className="cursor-pointer text-left"
                onClick={() => setActiveTab('profile')}
              >
                <div className="flex items-center space-x-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">{user.name}</p>
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" title="Verified Profile Access" />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight max-w-[120px] truncate">{user.targetRole || user.email}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

