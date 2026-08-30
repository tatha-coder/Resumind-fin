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
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
            TC
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-[#1C1917]">Platform Architect</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
                Verified Creator
              </span>
            </div>
            <p className="text-xs text-[#57534E] font-medium">
              Architected by <strong className="text-[#1C1917]">Tathagata Chakraborty</strong>
            </p>
          </div>
        </div>
        <a
          href="mailto:tathagatachakraborty1234@gmail.com"
          className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-emerald-50 text-[#1C1917] border border-[#E8E4DC] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-700" />
          <span>tathagatachakraborty1234@gmail.com</span>
        </a>
      </div>

      {/* User Identity Summary */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 transition-colors shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-4">
            <img
              src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
              alt={user.name}
              className="w-14 h-14 rounded-xl bg-[#FAF7F2] border border-[#E8E4DC] p-0.5 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-[#1C1917]">{user.name}</h1>
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  <span>Encrypted Session</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-[#78716C] font-medium">
                <div className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Briefcase className="w-3.5 h-3.5 text-stone-400" />
                  <span className="text-[#1C1917] font-semibold">{user.targetRole || 'Software Professional'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-[#FAF7F2] hover:bg-emerald-50 border border-[#E8E4DC] text-[#1C1917] font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Edit Form */}
        {editing && (
          <form onSubmit={handleUpdateProfile} className="mt-5 pt-5 border-t border-[#E8E4DC] grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:border-emerald-600 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
                Target Role / Specialization
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs font-medium text-[#1C1917] focus:outline-none focus:border-emerald-600 font-sans"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {saveSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* User Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[#E8E4DC]">
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DC] text-center space-y-0.5">
            <p className="text-2xl font-extrabold font-mono text-[#1C1917]">{history.length}</p>
            <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Audits Completed</p>
          </div>
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DC] text-center space-y-0.5">
            <p className={`text-2xl font-extrabold font-mono ${avgScore >= 80 ? 'text-emerald-700' : 'text-[#1C1917]'}`}>
              {avgScore ? `${avgScore}%` : '—'}
            </p>
            <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Average Score</p>
          </div>
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DC] text-center space-y-0.5">
            <p className="text-2xl font-extrabold font-mono text-emerald-700">100%</p>
            <p className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">Data Privacy</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Saved Resume Audit Reports</span>
            </h2>
            <p className="text-xs text-[#78716C]">
              Only accessible to your authenticated account ({user.email}).
            </p>
          </div>
          <button
            onClick={fetchHistory}
            className="px-3.5 py-1.5 bg-white border border-[#E8E4DC] hover:bg-emerald-50 text-[#57534E] rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Vault</span>
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center bg-white border border-[#E8E4DC] rounded-2xl">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#78716C] font-medium">Fetching resume vault...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="p-10 text-center bg-white border border-[#E8E4DC] rounded-2xl space-y-2">
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-700">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#1C1917]">No resume audits saved yet</h3>
            <p className="text-xs text-[#78716C] max-w-sm mx-auto">
              Upload and analyze any PDF resume from the main audit tab. Once analyzed, reports are automatically stored here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {history.map((item) => (
              <div
                key={item.id}
                onClick={() => handleLoadResume(item.id)}
                className="group bg-white hover:bg-[#FAF7F2] border border-[#E8E4DC] hover:border-emerald-400 p-5 rounded-2xl cursor-pointer transition-all shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-xs text-[#1C1917] flex items-center space-x-1.5">
                      <span className="truncate max-w-[180px]">{item.filename}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                    <p className="text-[11px] text-[#78716C] font-medium">
                      {new Date(item.createdAt).toLocaleDateString()} • {Math.round(item.filesize / 1024)} KB • {item.pageCount} page(s)
                    </p>
                  </div>

                  <div className={`px-2.5 py-0.5 rounded-md text-xs font-bold shrink-0 border ${
                    item.overallScore >= 80 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : item.overallScore >= 65
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {item.overallScore}% ATS
                  </div>
                </div>

                <p className="text-xs text-[#57534E] line-clamp-2 mt-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E8E4DC]">
                  {item.summary}
                </p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#E8E4DC]">
                  <span className="text-xs text-emerald-700 font-bold group-hover:underline flex items-center space-x-1">
                    {loadingResumeId === item.id ? (
                      <span>Loading report...</span>
                    ) : (
                      <span>Open Full Analysis →</span>
                    )}
                  </span>

                  <button
                    onClick={(e) => handleDeleteResume(item.id, e)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
