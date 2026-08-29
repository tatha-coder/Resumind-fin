import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  AlertCircle,
  Briefcase,
  Building
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface CoverLetterModalProps {
  analysis: AnalysisResult;
  token: string;
}

const TONES = [
  { id: 'confident', label: 'Executive & Confident', desc: 'Direct, metrics-focused leadership tone' },
  { id: 'startup', label: 'High Energy & Startup', desc: 'Agile, mission-driven narrative' },
  { id: 'technical', label: 'Technical & Data-Driven', desc: 'Deep architecture and engineering focus' },
  { id: 'concise', label: 'Concise & High-Impact', desc: 'Crisp 3-paragraph executive format' },
];

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ analysis, token }) => {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [companyName, setCompanyName] = useState('Stripe');
  const [selectedTone, setSelectedTone] = useState('confident');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson('/api/resume/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          jobTitle,
          companyName,
          jobDescriptionText: `${jobDescriptionText}\n[Selected Tone: ${selectedTone}]`,
        }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Failed to generate cover letter.');

      setCoverLetter(res.data.coverLetter);
    } catch (err: any) {
      setError(err.message || 'Error generating cover letter.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cover_Letter_${companyName.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Form Card */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Targeted Cover Letter Drafter
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Drafts a personalized cover letter citing verifiable achievements from your audited resume ({analysis.pdfMeta?.filename}).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Job Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-medium text-[#0F172A] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Company / Organization
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Linear, Datadog"
                  className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-medium text-[#0F172A] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tone Archetype
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTone(t.id)}
                  className={`p-3 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedTone === t.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-[#F8FAFC] dark:bg-[#161616] border-slate-200/80 dark:border-slate-700 text-[#334155] dark:text-slate-300 hover:border-emerald-400'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{t.label}</p>
                  <p className={`text-[10px] mt-0.5 leading-snug ${selectedTone === t.id ? 'text-emerald-100' : 'text-[#64748B] dark:text-slate-400'}`}>
                    {t.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider mb-1">
              Role Requirements & Context (Optional)
            </label>
            <textarea
              rows={3}
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste specific qualifications or requirements to address in the narrative..."
              className="w-full p-3 bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-emerald-300 border-t-white rounded-full animate-spin" />
                  <span>Drafting Personalized Cover Letter...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate Targeted Cover Letter</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Result Display */}
      {coverLetter && (
        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-fade-in transition-colors shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
              Drafted Letter: {jobTitle} at {companyName}
            </h3>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#334155] dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={() => handleDownload('txt')}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save .TXT</span>
              </button>
            </div>
          </div>

          <div className="bg-[#F8FAFC] dark:bg-[#161616] p-5 rounded-xl border border-slate-200/80 dark:border-slate-700 font-sans text-xs sm:text-sm text-[#0F172A] dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {coverLetter}
          </div>
        </div>
      )}

    </div>
  );
};
