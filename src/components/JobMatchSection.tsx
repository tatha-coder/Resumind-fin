import React, { useState } from 'react';
import { Target, Briefcase, Building, Sparkles, CheckCircle2, XCircle, AlertCircle, Copy, Check, ArrowRight } from 'lucide-react';
import { AnalysisResult, JobMatchResult } from '../types';
import { safeFetchJson } from '../lib/api';

interface JobMatchSectionProps {
  analysis: AnalysisResult;
  token: string;
}

export const JobMatchSection: React.FC<JobMatchSectionProps> = ({ analysis, token }) => {
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer');
  const [companyName, setCompanyName] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAnalyzeMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescriptionText.trim()) {
      setError('Please paste the job description text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson('/api/resume/analyze-jd-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          jobTitle,
          companyName,
          jobDescriptionText,
        }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Failed to analyze job match.');

      setMatchResult(res.data.matchResult);
    } catch (err: any) {
      setError(err.message || 'Error running job description match analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const loadSampleJd = () => {
    setJobTitle('Senior Frontend Engineer');
    setCompanyName('TechCorp Cloud');
    setJobDescriptionText(`We are looking for a Senior Frontend Engineer to join our core Web Applications team.
Key Responsibilities:
- Architect and build high-performance React and TypeScript web applications.
- Optimize web app performance, state management, and API integration.
- Work closely with UX/UI designers and Backend developers to deliver clean user interfaces.
Requirements:
- 4+ years of professional experience with React, TypeScript, and modern CSS (Tailwind).
- Deep knowledge of REST APIs, GraphQL, and client-side performance profiling.
- Experience with CI/CD pipelines, Docker, and Automated Unit Testing (Jest/Playwright).
- Excellent communication and cross-functional leadership abilities.`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0 flex items-center justify-center font-bold">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Job Description Matcher & Tailor</h2>
            <p className="text-xs text-slate-500">
              Benchmark your parsed resume ({analysis.pdfMeta.filename}) against any target job opening to find missing keywords and tailor bullet points.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAnalyzeMatch} className="mt-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Target Job Title
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Company Name (Optional)
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Stripe, Microsoft"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                Paste Job Description
              </label>
              <button
                type="button"
                onClick={loadSampleJd}
                className="text-xs text-blue-600 hover:text-blue-700 underline font-semibold"
              >
                Load Sample Tech Job Description
              </button>
            </div>
            <textarea
              rows={6}
              required
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste the full job posting text here (responsibilities, requirements, technical stack)..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white leading-relaxed font-mono"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Matching & Tailoring with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Job Match & Tailor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Match Results Display */}
      {matchResult && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 animate-fade-in">
          
          {/* Top Score Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200 gap-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Target Role Match Analysis
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                {matchResult.jobTitle} {matchResult.companyName ? `at ${matchResult.companyName}` : ''}
              </h3>
            </div>

            <div className="flex items-center space-x-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-right">
                <p className="text-2xl font-black text-blue-600">{matchResult.matchScore}%</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold">JD Match Score</p>
              </div>
            </div>
          </div>

          {/* Keywords Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Keywords Found in Resume</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-100 text-green-800 border border-green-200 rounded-lg text-xs font-semibold">
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center space-x-1.5">
                <XCircle className="w-4 h-4" />
                <span>Missing Essential Keywords</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingKeywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold">
                    + Add "{kw}"
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tailored Summary */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Tailored Professional Summary (Optimized for this JD)</span>
              </h4>
              <button
                onClick={() => handleCopy(matchResult.tailoredSummary, 'tailoredSummary')}
                className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
              >
                {copiedId === 'tailoredSummary' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="text-xs">Copy Summary</span>
              </button>
            </div>
            <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-4 rounded-xl border border-slate-200 font-medium">
              {matchResult.tailoredSummary}
            </p>
          </div>

          {/* Tailored Bullets */}
          {matchResult.tailoredBullets && matchResult.tailoredBullets.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Tailored Bullet Point Optimizations
              </h4>

              {matchResult.tailoredBullets.map((bullet, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Original Bullet:</span>
                    <p className="text-xs text-slate-500 line-through mt-0.5">{bullet.original}</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-blue-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-blue-600" />
                        <span>Target Keyword Infused Bullet ({bullet.targetKeyword})</span>
                      </span>
                      <button
                        onClick={() => handleCopy(bullet.tailored, `tb_${idx}`)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors font-semibold"
                      >
                        {copiedId === `tb_${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-xs text-slate-900 font-semibold">{bullet.tailored}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
