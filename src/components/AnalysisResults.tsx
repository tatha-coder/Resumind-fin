import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Copy, 
  Check, 
  Zap, 
  Layers, 
  Target, 
  FileText,
  TrendingUp,
  Cpu,
  ChevronRight
} from 'lucide-react';
import { AnalysisResult } from '../types';

interface AnalysisResultsProps {
  analysis: AnalysisResult;
  onOpenJobMatch: () => void;
  onOpenCoverLetter: () => void;
  onOpenInterviewPrep: () => void;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  analysis,
  onOpenJobMatch,
  onOpenCoverLetter,
  onOpenInterviewPrep,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'atsChecks' | 'sections' | 'skills' | 'actionPlan'>('overview');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-700', bg: 'bg-green-100', border: 'border-green-200', stroke: '#2563EB' };
    if (score >= 65) return { text: 'text-amber-700', bg: 'bg-amber-100', border: 'border-amber-200', stroke: '#d97706' };
    return { text: 'text-rose-700', bg: 'bg-rose-100', border: 'border-rose-200', stroke: '#e11d48' };
  };

  const overallTheme = getScoreColor(analysis.overallScore);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner: Score Gauge & Key Sub-Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Gauge Circle Score */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="#E2E8F0"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke={overallTheme.stroke}
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * analysis.overallScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-900">
                  {analysis.overallScore}
                  <span className="text-xl text-blue-600">/100</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                  ATS Score
                </span>
              </div>
            </div>

            <div className={`mt-4 px-3 py-1 rounded-full text-xs font-bold border ${overallTheme.bg} ${overallTheme.text} ${overallTheme.border}`}>
              {analysis.overallScore >= 80 ? 'Excellent - High ATS Pass Rate' : analysis.overallScore >= 65 ? 'Good - Ready for Polish' : 'Needs Work - Critical Gaps'}
            </div>
          </div>

          {/* Sub-Score Breakdown Cards */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <span>AI Semantic Diagnostics</span>
                  <Sparkles className="w-4 h-4 text-blue-600" />
                </h2>
                <span className="text-xs bg-slate-100 border border-slate-200 px-2 py-1 rounded font-mono font-semibold text-slate-600">
                  v4.2-LATEST
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                {analysis.summary}
              </p>
            </div>

            {/* 4 Core Sub-Scores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Parsability</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900">{analysis.atsScore}%</span>
                  <span className="text-[10px] text-blue-600 font-bold">ATS Read</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-full" style={{ width: `${analysis.atsScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Content Quality</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900">{analysis.contentScore}%</span>
                  <span className="text-[10px] text-indigo-600 font-bold">Structure</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-600 h-full" style={{ width: `${analysis.contentScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Impact & Metrics</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900">{analysis.impactScore}%</span>
                  <span className="text-[10px] text-amber-600 font-bold">Quantified</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-500 h-full" style={{ width: `${analysis.impactScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 uppercase font-bold">Keyword Match</p>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-lg font-black text-slate-900">{analysis.keywordScore}%</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Role Match</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${analysis.keywordScore}%` }} />
                </div>
              </div>

            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={onOpenJobMatch}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center space-x-1.5 transition-colors"
              >
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>Tailor to Job Description</span>
              </button>

              <button
                onClick={onOpenCoverLetter}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Generate Cover Letter</span>
              </button>

              <button
                onClick={onOpenInterviewPrep}
                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center space-x-1.5 transition-colors shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                <span>Generate Interview Prep Q&A</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto space-x-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Strengths & Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('atsChecks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'atsChecks'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>ATS Compliance ({analysis.atsChecks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'sections'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Section Review & Rewrites</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'skills'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Extracted Skills Cloud</span>
        </button>

        <button
          onClick={() => setActiveTab('actionPlan')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'actionPlan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Action Plan</span>
        </button>
      </div>

      {/* Tab Content 1: Overview (Strengths & Gaps) */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Key Strengths & Highlights</h3>
            </div>
            <ul className="space-y-3">
              {analysis.keyStrengths.map((strength, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center font-bold shrink-0 text-[10px]">
                    0{idx + 1}
                  </span>
                  <span className="mt-0.5">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Critical Gaps */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-rose-700">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-bold text-sm text-slate-900">Critical Gaps & ATS Binders</h3>
            </div>
            <ul className="space-y-3">
              {analysis.criticalGaps.map((gap, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="w-6 h-6 bg-rose-100 text-rose-700 rounded-lg flex items-center justify-center font-bold shrink-0 text-[10px]">
                    0{idx + 1}
                  </span>
                  <span className="mt-0.5">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab Content 2: ATS Compliance Checks */}
      {activeTab === 'atsChecks' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 mb-2">ATS Technical Compliance Matrix</h3>
          <div className="divide-y divide-slate-100">
            {analysis.atsChecks.map((check, idx) => (
              <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-slate-900">{check.category}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      check.status === 'pass'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : check.status === 'warning'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{check.detail}</p>
                  {check.recommendation && (
                    <p className="text-[11px] text-blue-700 font-semibold mt-1">
                      💡 Fix: {check.recommendation}
                    </p>
                  )}
                </div>

                <div>
                  {check.status === 'pass' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {check.status === 'fail' && <XCircle className="w-5 h-5 text-rose-600" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Section Review & Smart Bullet Rewriter */}
      {activeTab === 'sections' && (
        <div className="space-y-6">
          {analysis.sections.map((section, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                  <span>{section.sectionName}</span>
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  section.score >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  Score: {section.score}%
                </span>
              </div>

              {/* Feedback Points */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Observations:</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {section.feedback.map((f, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Recommendations:</span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {section.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Smart Bullet Rewrites */}
              {section.rewrites && section.rewrites.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>AI Quantified Bullet Rewrites</span>
                  </h4>

                  {section.rewrites.map((rewrite, rIdx) => (
                    <div key={rIdx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-rose-600 uppercase">Original Bullet:</span>
                        <p className="text-xs text-slate-500 line-through">{rewrite.original}</p>
                      </div>

                      <div className="space-y-1 bg-white p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Suggested High-Impact Rewrite:</span>
                          <button
                            onClick={() => handleCopy(rewrite.suggested, `rewrite_${idx}_${rIdx}`)}
                            className="p-1 hover:bg-slate-100 text-blue-600 rounded text-xs flex items-center space-x-1 transition-colors font-semibold"
                          >
                            {copiedIndex === `rewrite_${idx}_${rIdx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span className="text-[10px]">Copy</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-900 font-semibold">{rewrite.suggested}</p>
                      </div>

                      <p className="text-[11px] text-slate-600 italic">
                        💡 Why: {rewrite.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Tab Content 4: Skills Cloud */}
      {activeTab === 'skills' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-slate-900">Extracted Skills & Competencies</h3>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold text-blue-700 mb-2">Technical & Engineering Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills.technical.map((sk, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-indigo-700 mb-2">Tools, Frameworks & Infrastructure</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills.toolsAndFrameworks.map((sk, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-semibold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-emerald-700 mb-2">Leadership & Soft Skills</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.detectedSkills.soft.map((sk, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold">
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 5: Action Plan */}
      {activeTab === 'actionPlan' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Prioritized Score Boost Plan</span>
          </h3>

          <div className="space-y-3">
            {analysis.actionableNextSteps.map((step, i) => (
              <div key={i} className="flex items-start space-x-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  0{i + 1}
                </span>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
