import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Briefcase, 
  Calendar, 
  FileText, 
  Trash2, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2
} from 'lucide-react';
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
      await supabase.auth.updateUser({
        data: { full_name: name, target_role: targetRole },
      }).catch(() => {});

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
    if (!confirm('Are you sure you want to delete this audit report from your history?')) return;

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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* Creator Attribution & Contact Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0">
            TC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Architect</h3>
              <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded">
                Verified Creator
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Architected by <strong className="text-slate-900 dark:text-white">Tathagata Chakraborty</strong>
            </p>
          </div>
        </div>
        <a
          href="mailto:tathagatachakraborty1234@gmail.com"
          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span>tathagatachakraborty1234@gmail.com</span>
        </a>
      </div>

      {/* User Identity Summary */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-4">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h1>
                <span className="inline-flex items-center space-x-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Encrypted Session</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span className="text-slate-900 dark:text-slate-100 font-semibold">{user.targetRole || 'Software Professional'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleUpdateProfile} className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-600 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Role / Specialization
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-slate-600 font-sans"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* User Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-[#161f33] p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
            <p className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white">{history.length}</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Audits Completed</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#161f33] p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
            <p className={`text-2xl font-extrabold font-mono ${avgScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : avgScore >= 65 ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'}`}>
              {avgScore ? `${avgScore}%` : '—'}
            </p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Average Score</p>
          </div>
          <div className="bg-slate-50 dark:bg-[#161f33] p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 text-center space-y-0.5">
            <p className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Data Privacy</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <span>Saved Resume Audit Reports</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Only accessible to your authenticated account ({user.email}).
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-3 py-1.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#161f33] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Vault</span>
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="w-6 h-6 border-2 border-slate-800 dark:border-slate-200 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fetching resume vault...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-700 dark:text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No resume audits saved yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Upload and analyze any PDF resume from the main audit tab. Once analyzed, reports are automatically stored here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-3.5">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadResume(item.id)}
                className="group bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#161f33] border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <span className="truncate max-w-[180px]">{item.filename}</span>
                      <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()} • {Math.round(item.filesize / 1024)} KB • {item.pageCount} page(s)
                    </p>
                  </div>

                  <div className={`px-2 py-0.5 rounded text-xs font-bold shrink-0 border ${
                    item.overallScore >= 80 
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      : item.overallScore >= 65
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                      : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                  }`}>
                    {item.overallScore}% ATS
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-2.5 bg-slate-50 dark:bg-[#161f33] p-2 rounded border border-slate-200 dark:border-slate-700">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-900 dark:text-slate-100 font-semibold group-hover:underline flex items-center space-x-1">
                    {loadingResumeId === item.id ? (
                      <span>Loading report...</span>
                    ) : (
                      <span>Open Full Analysis →</span>
                    )}
                  </span>

                  <button
                    onClick={(e) => handleDeleteResume(item.id, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
