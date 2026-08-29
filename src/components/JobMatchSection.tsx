import React, { useState } from 'react';
import { 
  Target, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ArrowRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { AnalysisResult, JobMatchResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface JobMatchSectionProps {
  analysis: AnalysisResult;
  token: string;
}

const SAMPLE_JDS = [
  {
    title: 'Senior Frontend Engineer @ Stripe',
    text: `We are looking for a Senior Frontend Engineer to join Stripe's Dashboard Infrastructure team.
Requirements:
- 5+ years of experience with React, TypeScript, and modern state architecture
- Proven experience building distributed, highly resilient design systems
- Deep knowledge of web performance metrics, bundle optimization, and latency reduction
- Experience collaborating cross-functionally with product managers and backend teams
- Strong automated testing discipline (Jest, Playwright, Cypress)`
  },
  {
    title: 'Lead Product Manager @ Linear',
    text: `Linear is looking for a Lead Product Manager to drive developer tooling and issue tracking workflows.
Requirements:
- 6+ years in product management at a fast-growing B2B SaaS or developer tools company
- Demonstrated track record of launching high-retention features with quantifiable business metrics
- Deep empathy for technical users and engineering workflows
- Strong quantitative and analytical skills (SQL, Cohort retention analysis)
- Excellent written communication and specification writing skills`
  }
];

export const JobMatchSection: React.FC<JobMatchSectionProps> = ({ analysis, token }) => {
  const [jobTitle, setJobTitle] = useState('Senior Frontend Engineer');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JDS[0].text);
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      setError('Please paste a target job description to match against.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson('/api/resume/match-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          jobTitle,
          jobDescription,
        }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Failed to match job.');

      setMatchResult(res.data.jobMatch);
    } catch (err: any) {
      setError(err.message || 'Error matching job description.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      
      {/* Target JD Input Card */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0F172A] dark:text-white">
              Target Job Match & Keyword Benchmark
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Benchmark your uploaded resume against specific job requirements ({analysis.pdfMeta?.filename}).
            </p>
          </div>
        </div>

        <form onSubmit={handleMatch} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Role / Position Title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full pl-10 pr-3 py-2 bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-medium text-[#0F172A] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-[#0F172A] dark:text-slate-300 uppercase tracking-wider">
                Job Description Text & Requirements
              </label>
              
              {/* Sample JD loader buttons */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] text-[#64748B] hidden sm:inline">Load Sample:</span>
                {SAMPLE_JDS.map((jd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setJobTitle(jd.title);
                      setJobDescription(jd.text);
                    }}
                    className="text-[11px] font-semibold text-[#334155] dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white px-2.5 py-1 rounded-lg bg-[#F8FAFC] dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    {idx === 0 ? 'Stripe JD' : 'Linear JD'}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              required
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description requirements here..."
              className="w-full p-3 bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs text-[#0F172A] dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono leading-relaxed"
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
                  <span>Evaluating Job Requirements & Matching Keywords...</span>
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  <span>Analyze Job Match & Generate Bullets</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className="space-y-5 animate-fade-in">
          
          {/* Match Score Overview */}
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-[#64748B] uppercase">Match Result</span>
                  <span className="text-xs text-slate-400">•</span>
                  <h3 className="font-bold text-sm text-[#0F172A] dark:text-white">
                    {matchResult.jobTitle}
                  </h3>
                </div>
                <p className="text-xs text-[#334155] dark:text-slate-400 mt-1">
                  {matchResult.fitSummary}
                </p>
              </div>

              <div className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl border shrink-0 ${
                matchResult.matchScore >= 80 
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : matchResult.matchScore >= 60
                  ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  : 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}>
                <span className="text-2xl font-extrabold font-mono tracking-tight">{matchResult.matchScore}%</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-85 mt-0.5">JD Alignment</span>
              </div>
            </div>

            {/* Missing vs Matched Keywords Matrix */}
            <div className="grid md:grid-cols-2 gap-4">
              
              {/* Matched Keywords */}
              <div className="bg-[#F8FAFC] dark:bg-[#161616] p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Matching Keywords Found ({matchResult.matchingKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.matchingKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs font-medium shadow-2xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="bg-[#F8FAFC] dark:bg-[#161616] p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">Missing Required Keywords ({matchResult.missingKeywords.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchResult.missingKeywords.map((kw, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-md text-xs font-medium shadow-2xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Tailored Bullet Points */}
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors space-y-4 shadow-xs">
            <div>
              <h3 className="font-bold text-sm text-[#0F172A] dark:text-white flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Job-Tailored Bullets with Integrated Keywords</span>
              </h3>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
                Copy these high-impact bullets directly into your resume to close identified keyword gaps.
              </p>
            </div>

            <div className="space-y-3">
              {matchResult.tailoredBullets.map((bullet, idx) => (
                <div key={idx} className="bg-[#F8FAFC] dark:bg-[#161616] p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-[#0F172A] dark:text-slate-100 font-semibold leading-relaxed">
                      {bullet.bullet}
                    </p>
                    <button
                      onClick={() => handleCopy(bullet.bullet, `tb_${idx}`)}
                      className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#334155] dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedId === `tb_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-600" />}
                      <span>{copiedId === `tb_${idx}` ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-2 text-[11px] text-[#64748B] dark:text-slate-400">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">Keywords Weaved:</span>
                    <span>{bullet.targetKeywordsIncluded.join(', ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
