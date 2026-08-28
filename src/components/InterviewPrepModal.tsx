import React, { useState } from 'react';
import { 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase,
  Copy,
  Check,
  TrendingUp
} from 'lucide-react';
import { AnalysisResult, InterviewQuestion } from '../types';
import { safeFetchJson } from '../lib/api';

interface InterviewPrepModalProps {
  analysis: AnalysisResult;
  token: string;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ analysis, token }) => {
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await safeFetchJson('/api/resume/generate-interview-prep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          jobTitle,
          jobDescriptionText,
        }),
      });

      if (!res.ok || !res.data) throw new Error(res.error || 'Failed to generate interview prep.');

      setQuestions(res.data.questions || []);
    } catch (err: any) {
      setError(err.message || 'Error generating interview questions.');
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
      
      {/* Form Card */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 transition-colors">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shrink-0 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Interview Preparation & STAR Response Strategy
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generates targeted behavioral and technical interview questions based directly on your audited experience ({analysis.pdfMeta?.filename}).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Position / Role Title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Staff Software Engineer"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Job Description or Key Focus Areas (Optional)
            </label>
            <textarea
              rows={2}
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="e.g. Large-scale distributed systems, architectural trade-offs, team mentorship..."
              className="w-full p-3 bg-slate-50 dark:bg-[#161f33] border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-slate-600 font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                  <span>Synthesizing Interview Questions & STAR Guide...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span>Generate Interview Questions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Generated Questions List */}
      {questions.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Tailored Interview Questions & Response Formulation ({questions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#161f33]/60 transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {q.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Question {idx + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{q.question}</p>
                  </div>

                  {openIdx === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                  )}
                </button>

                {openIdx === idx && (
                  <div className="p-4 bg-slate-50 dark:bg-[#161f33] border-t border-slate-200 dark:border-slate-800 space-y-3.5">
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-[#111827] p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                      <strong className="font-bold text-slate-900 dark:text-white">Interviewer Intent:</strong> {q.context}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                          Key Talking Points (STAR Method):
                        </span>
                        <button
                          onClick={() => handleCopy(q.idealAnswerKeypoints.join('\n• '), `q_${idx}`)}
                          className="text-[10px] text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center space-x-1 font-semibold cursor-pointer"
                        >
                          {copiedId === `q_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>Copy Strategy</span>
                        </button>
                      </div>

                      <ul className="space-y-2">
                        {q.idealAnswerKeypoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start space-x-2 text-xs text-slate-700 dark:text-slate-300 font-medium bg-white dark:bg-[#111827] p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{kp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
