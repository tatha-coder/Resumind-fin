import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Mail, Briefcase, Calendar, FileText, Trash2, ExternalLink, RefreshCw, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { User as UserType, AnalysisResult } from '../types';
import { supabase } from '../lib/supabase';
import { safeFetchJson } from '../lib/api';

interface UserProfileProps {
  user: UserType;
  token: string;
  onUpdateUser: (updatedUser: UserType) => void;
  onSelectHistoryResume: (analysis: AnalysisResult) => void;
}

interface ResumeHistorySummary {
  id: string;
  createdAt: string;
  filename: string;
  filesize: number;
  pageCount: number;
  wordCount: number;
  overallScore: number;
  atsScore: number;
  summary: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  user,
  token,
  onUpdateUser,
  onSelectHistoryResume,
}) => {
  const [history, setHistory] = useState<ResumeHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [targetRole, setTargetRole] = useState(user.targetRole || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await safeFetchJson('/api/resume/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data) {
        setHistory(res.data.resumes || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user.id, token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Update Supabase user metadata
      await supabase.auth.updateUser({
        data: { full_name: name, target_role: targetRole },
      }).catch(() => {});

      // 2. Update backend Express profile if available
      const res = await safeFetchJson('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, targetRole }),
      });

      let updatedUser: UserType = {
        ...user,
        name,
        targetRole,
      };

      if (res.ok && res.data?.user) {
        updatedUser = res.data.user;
      }

      onUpdateUser(updatedUser);
      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  const handleLoadResume = async (id: string) => {
    setLoadingResumeId(id);
    try {
      const res = await safeFetchJson(`/api/resume/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok && res.data?.analysis) {
        onSelectHistoryResume(res.data.analysis);
      }
    } catch (err) {
      console.error('Failed to fetch full analysis:', err);
    } finally {
      setLoadingResumeId(null);
    }
  };

  const handleDeleteResume = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this resume report from your profile history?')) return;

    try {
      const res = await safeFetchJson(`/api/resume/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const avgScore = history.length > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.overallScore, 0) / history.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Developer Contact Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-850 border border-blue-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            TC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Developer & Creator Contact Info</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-md">
                Author
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Created by <strong>Tathagata Chakraborty</strong>
            </p>
          </div>
        </div>
        <a
          href="mailto:tathagatachakraborty1234@gmail.com"
          className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs transition-colors"
        >
          <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>tathagatachakraborty1234@gmail.com</span>
        </a>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden transition-colors duration-200">

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center space-x-5">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-blue-100 dark:border-blue-900 p-1 shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name}</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Isolated User Profile</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-blue-700 dark:text-blue-300 font-bold">{user.targetRole || 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {editing ? 'Cancel Editing' : 'Edit Target Role'}
          </button>

        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleUpdateProfile} className="mt-6 pt-6 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Role / Industry</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 font-medium"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile information saved successfully!</span>
          </div>
        )}

        {/* User Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-2xl font-black text-slate-900">{history.length}</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Resumes Analyzed</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className={`text-2xl font-black ${avgScore >= 80 ? 'text-emerald-600' : avgScore >= 65 ? 'text-amber-600' : 'text-slate-800'}`}>
              {avgScore ? `${avgScore}%` : 'N/A'}
            </p>
            <p className="text-xs font-bold text-slate-500 uppercase">Average ATS Score</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
            <p className="text-2xl font-black text-blue-600">100%</p>
            <p className="text-xs font-bold text-slate-500 uppercase">Data Isolation</p>
          </div>
        </div>

      </div>

      {/* User's Private Resume Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Confidential Resume History</span>
            </h2>
            <p className="text-xs text-slate-500">
              Only accessible when logged into <span className="text-slate-900 font-bold">{user.email}</span>.
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Fetching your private resume records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">No resumes analyzed yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload a PDF resume on the main analysis tab. Once analyzed, reports are automatically stored securely under your account.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadResume(item.id)}
                className="group bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-blue-300 p-5 rounded-2xl shadow-sm cursor-pointer transition-all relative overflow-hidden"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors flex items-center space-x-2">
                      <span className="truncate max-w-[200px]">{item.filename}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Uploaded {new Date(item.createdAt).toLocaleDateString()} • {Math.round(item.filesize / 1024)} KB • {item.pageCount} page(s)
                    </p>
                  </div>

                  <div className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 border ${
                    item.overallScore >= 80 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.overallScore >= 65
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.overallScore}% ATS
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-medium">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] text-blue-600 font-bold group-hover:underline flex items-center space-x-1">
                    {loadingResumeId === item.id ? (
                      <span>Loading report...</span>
                    ) : (
                      <span>View Full Analysis & Rewrites →</span>
                    )}
                  </span>

                  <button
                    onClick={(e) => handleDeleteResume(item.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete resume from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
