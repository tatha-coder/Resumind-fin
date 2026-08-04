import React, { useState } from 'react';
import { MessageSquare, Sparkles, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { AnalysisResult, InterviewQuestion } from '../types';
import { safeFetchJson } from '../lib/api';

interface InterviewPrepModalProps {
  analysis: AnalysisResult;
  token: string;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ analysis, token }) => {
  const [jobTitle, setJobTitle] = useState('Senior Software Engineer');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(0);

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
      setError(err.message || 'Error generating interview prep.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 shrink-0 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Interview Prep & Question Generator</h2>
            <p className="text-xs text-slate-500">
              Generates high-probability interview questions targeting specific achievements in your parsed resume ({analysis.pdfMeta.filename}).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Target Job Role</label>
            <input
              type="text"
              required
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Job Description Context (Optional)
            </label>
            <textarea
              rows={2}
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="Paste key responsibilities to target interview questions even closer..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white font-mono"
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
                  <span>Generating Tailored Q&A...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
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
          <h3 className="font-bold text-sm text-slate-900 flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Targeted Interview Questions & Winning Strategy</span>
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-blue-300 transition-colors">
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                        {q.type}
                      </span>
                      <span className="text-xs font-bold text-slate-900">Question {idx + 1}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{q.question}</p>
                  </div>

                  {openIdx === idx ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
                  )}
                </button>

                {openIdx === idx && (
                  <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
                    <p className="text-xs text-blue-800 font-medium bg-blue-50 p-3 rounded-xl border border-blue-200">
                      🎯 Context: {q.context}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                        Ideal Answer Strategy Keypoints (STAR Method):
                      </span>
                      <ul className="space-y-2">
                        {q.idealAnswerKeypoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start space-x-2 text-xs text-slate-700 font-medium">
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
