import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCheck, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Layout, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  UploadCloud, 
  Copy, 
  FileText,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { AnalysisResult } from '../types';
import { SAMPLE_RESUMES } from '../lib/sampleResumes';

interface AtsReviewSectionProps {
  analysis: AnalysisResult | null;
  onNavigateToUpload: () => void;
  onLoadSample: (sampleAnalysis: AnalysisResult) => void;
}

export const AtsReviewSection: React.FC<AtsReviewSectionProps> = ({
  analysis,
  onNavigateToUpload,
  onLoadSample,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // If no resume is analyzed yet, provide a sleek empty state that lets the user load samples or upload
  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Empty State Card */}
        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center transition-colors shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileCheck className="w-7 h-7" />
          </div>

          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3 border border-emerald-200/60 dark:border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ATS Engine Benchmark</span>
          </span>

          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
            ATS Review & Algorithm Audit
          </h2>
          <p className="text-sm text-[#64748B] dark:text-slate-400 max-w-lg mx-auto mt-2 mb-8 leading-relaxed">
            Upload your resume or pick a benchmark profile to inspect your full ATS score, keyword compatibility, structure integrity, formatting safety, and targeted improvements.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onNavigateToUpload}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Your PDF Resume</span>
            </button>
            <button
              onClick={() => onLoadSample(SAMPLE_RESUMES[0].mockAnalysis)}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#0F172A] dark:text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-2 cursor-pointer border border-slate-200/80 dark:border-slate-700"
            >
              <span>Load Sample Resume</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Circular ATS Meter</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Precision compatibility percentage calibrated against modern enterprise ATS filters.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 flex items-center justify-center mb-3">
              <Layout className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Format & Structure</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Verification of header hierarchy, single-column parsing, font safety, and table barriers.
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-amber-400 flex items-center justify-center mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Targeted Improvements</h3>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Pinpointed strengths, critical keyword gaps, and actionable bullet enhancements.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate circular meter parameters
  const score = analysis.atsScore || analysis.overallScore || 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine status color and badge
  const getScoreStatus = (val: number) => {
    if (val >= 85) return { color: '#059669', label: 'Strong ATS Pass', desc: 'Optimal for automated screening' };
    if (val >= 70) return { color: '#0D9488', label: 'Good Compatibility', desc: 'Minor optimization suggested' };
    if (val >= 55) return { color: '#D97706', label: 'Moderate Risk', desc: 'Keywords and format need revision' };
    return { color: '#DC2626', label: 'High Rejection Risk', desc: 'Critical structural barriers detected' };
  };

  const status = getScoreStatus(score);

  // Group checks
  const passedChecks = analysis.atsChecks.filter(c => c.status === 'pass');
  const warningChecks = analysis.atsChecks.filter(c => c.status === 'warning');
  const failChecks = analysis.atsChecks.filter(c => c.status === 'fail');

  // Format checks from atsChecks
  const formatChecks = analysis.atsChecks.filter(c => 
    c.category.toLowerCase().includes('format') || 
    c.category.toLowerCase().includes('layout') || 
    c.category.toLowerCase().includes('font') ||
    c.category.toLowerCase().includes('table') ||
    c.category.toLowerCase().includes('page')
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* 1. SECTION 1: ATS SCORE WITH LARGE CIRCULAR PROGRESS INDICATOR */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 transition-colors shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Score Breakdown Info */}
          <div className="space-y-3 text-center lg:text-left flex-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              <FileCheck className="w-3.5 h-3.5" />
              <span>ATS Review & Benchmark</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white tracking-tight">
              Applicant Tracking System (ATS) Score
            </h2>

            <p className="text-sm text-[#334155] dark:text-slate-300 leading-relaxed max-w-xl">
              This score measures how effectively automated parsers (Workday, Greenhouse, Lever, Taleo) can extract your experience, read your bullet points, and index relevant job skills.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <div className="flex items-center space-x-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Format Compatibility: <strong className="text-[#0F172A] dark:text-white font-semibold">{analysis.formattingScore}%</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span>Keyword Density: <strong className="text-[#0F172A] dark:text-white font-semibold">{analysis.keywordScore}%</strong></span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-medium text-[#64748B] dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span>Content Quantification: <strong className="text-[#0F172A] dark:text-white font-semibold">{analysis.impactScore}%</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Large Circular Progress Gauge */}
          <div className="relative flex flex-col items-center justify-center shrink-0 p-4">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background track circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-100 dark:text-slate-800"
                />
                {/* Progress bar circle */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={status.color}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Center Numerical Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-4xl font-extrabold text-[#0F172A] dark:text-white tracking-tight">
                  {score}
                </span>
                <span className="text-[11px] font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-wider">
                  Out of 100
                </span>
              </div>
            </div>

            <div className="mt-2 text-center">
              <span 
                className="inline-block px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                style={{ backgroundColor: status.color }}
              >
                {status.label}
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                {status.desc}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. SECTION 2: KEYWORD OPTIMIZATION */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                Keyword Optimization
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Evaluates targeted skill frequency, technical taxonomy, and domain terminology parsed from your resume.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#64748B] dark:text-slate-400">Score:</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
              {analysis.keywordScore}% Keyword Density
            </span>
          </div>
        </div>

        {/* Technical & Domain Skills Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Technical Skills */}
          <div className="bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                Technical Skills ({analysis.detectedSkills?.technical?.length || 0})
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.detectedSkills?.technical?.length ? (
                analysis.detectedSkills.technical.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white dark:bg-[#202020] border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-slate-200 shadow-2xs"
                  >
                    {tech}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#64748B] dark:text-slate-400 italic">No specific technical keywords detected.</span>
              )}
            </div>
          </div>

          {/* Tools & Frameworks */}
          <div className="bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                Tools & Frameworks ({analysis.detectedSkills?.toolsAndFrameworks?.length || 0})
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.detectedSkills?.toolsAndFrameworks?.length ? (
                analysis.detectedSkills.toolsAndFrameworks.map((tool, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white dark:bg-[#202020] border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-slate-200 shadow-2xs"
                  >
                    {tool}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#64748B] dark:text-slate-400 italic">No frameworks recognized.</span>
              )}
            </div>
          </div>

          {/* Core Competencies & Soft Skills */}
          <div className="bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                Leadership & Soft Skills ({analysis.detectedSkills?.soft?.length || 0})
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706]" />
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {analysis.detectedSkills?.soft?.length ? (
                analysis.detectedSkills.soft.map((soft, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-xs font-medium bg-white dark:bg-[#202020] border border-slate-200 dark:border-slate-700 text-[#0F172A] dark:text-slate-200 shadow-2xs"
                  >
                    {soft}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#64748B] dark:text-slate-400 italic">No soft skills parsed.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECTION 3: FORMATTING & PARSING SAFETY */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center font-bold">
                <Layout className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                Formatting & Layout Compliance
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Validates typography, tables, single-column reading flow, and standard header formatting.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#64748B] dark:text-slate-400">Score:</span>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-300">
              {analysis.formattingScore}% Clean Format
            </span>
          </div>
        </div>

        {/* Formatting Checks Checklist */}
        <div className="grid sm:grid-cols-2 gap-3.5">
          {(formatChecks.length > 0 ? formatChecks : analysis.atsChecks.slice(0, 4)).map((check, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border transition-colors ${
                check.status === 'pass'
                  ? 'bg-[#F8FAFC] dark:bg-[#161616] border-slate-200/80 dark:border-slate-800'
                  : check.status === 'warning'
                  ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  : 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
              }`}
            >
              <div className="flex items-start space-x-3">
                {check.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                ) : check.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {check.category}
                    </span>
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                      check.status === 'pass'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        : check.status === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300'
                    }`}>
                      {check.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] dark:text-slate-300 leading-relaxed">
                    {check.detail}
                  </p>
                  {check.recommendation && (
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium">
                      Fix: {check.recommendation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SECTION 4: SECTION STRUCTURE */}
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-white flex items-center justify-center font-bold">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
                Section Structure & Document Architecture
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
              Verifies whether standard sections (Summary, Experience, Education, Skills) are properly recognized.
            </p>
          </div>
        </div>

        {/* Section List */}
        <div className="space-y-3">
          {analysis.sections.map((sec, idx) => {
            const isGood = sec.score >= 80;
            const isWarning = sec.score >= 60 && sec.score < 80;
            return (
              <div 
                key={idx}
                className="bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-white">
                      {sec.sectionName}
                    </span>
                    <span className={`px-2 py-0.2 rounded text-[10px] font-semibold uppercase ${
                      isGood 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                        : isWarning 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {sec.status.replace('_', ' ')}
                    </span>
                  </div>
                  {sec.feedback && sec.feedback[0] && (
                    <p className="text-xs text-[#64748B] dark:text-slate-400">
                      {sec.feedback[0]}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${isGood ? 'bg-[#16A34A]' : isWarning ? 'bg-[#D97706]' : 'bg-rose-500'}`}
                      style={{ width: `${sec.score}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold font-mono text-[#0F172A] dark:text-white w-9 text-right">
                    {sec.score}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5 & 6. SECTION 5: WHAT'S WORKING & SECTION 6: WHAT COULD IMPROVE */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* WHAT'S WORKING */}
        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                What's Working
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Key strengths and passed ATS parameters
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {analysis.keyStrengths.map((str, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/70 dark:border-slate-800 text-xs">
                <Check className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span className="text-[#334155] dark:text-slate-200 font-medium leading-relaxed">
                  {str}
                </span>
              </div>
            ))}

            {passedChecks.slice(0, 2).map((chk, idx) => (
              <div key={`p-${idx}`} className="flex items-start space-x-2.5 p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-xs">
                <CheckCircle className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#0F172A] dark:text-white font-semibold">{chk.category}:</strong>{' '}
                  <span className="text-[#334155] dark:text-slate-300">{chk.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WHAT COULD IMPROVE */}
        <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 transition-colors shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-[#D97706] dark:text-amber-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">
                What Could Improve
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                Critical gaps and high-priority fixes
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {analysis.criticalGaps.map((gap, idx) => (
              <div key={idx} className="flex items-start space-x-2.5 p-3 rounded-lg bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <span className="text-[#334155] dark:text-slate-200 font-medium leading-relaxed">
                  {gap}
                </span>
              </div>
            ))}

            {analysis.actionableNextSteps.slice(0, 3).map((step, idx) => (
              <div key={`step-${idx}`} className="flex items-start space-x-2.5 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#161616] border border-slate-200/70 dark:border-slate-800 text-xs">
                <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[#334155] dark:text-slate-200 font-medium leading-relaxed">
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
