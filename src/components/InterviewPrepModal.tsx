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
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 transition-colors shadow-xs">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-700 shrink-0 flex items-center justify-center font-bold">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#1C1917]">
              Interview Preparation & STAR Response Strategy
            </h2>
            <p className="text-xs text-[#78716C]">
              Generates targeted behavioral and technical interview questions based directly on your audited experience ({analysis.pdfMeta?.filename}).
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
              Target Position / Role Title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Staff Software Engineer"
                className="w-full pl-10 pr-3 py-2 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs font-medium text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-1">
              Job Description or Key Focus Areas (Optional)
            </label>
            <textarea
              rows={2}
              value={jobDescriptionText}
              onChange={(e) => setJobDescriptionText(e.target.value)}
              placeholder="e.g. Large-scale distributed systems, architectural trade-offs, team mentorship..."
              className="w-full p-3 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-xs text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center space-x-2 font-medium">
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
            <h3 className="font-bold text-sm text-[#1C1917]">
              Tailored Interview Questions & Response Formulation ({questions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden transition-colors shadow-xs"
              >
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {q.type}
                      </span>
                      <span className="text-xs font-semibold text-[#78716C]">Question {idx + 1}</span>
                    </div>
                    <p className="text-sm font-bold text-[#1C1917] leading-snug">{q.question}</p>
                  </div>

                  {openIdx === idx ? (
                    <ChevronUp className="w-4 h-4 text-[#78716C] shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#78716C] shrink-0 mt-1" />
                  )}
                </button>

                {openIdx === idx && (
                  <div className="p-4 bg-[#FAF7F2] border-t border-[#E8E4DC] space-y-3.5">
                    <div className="text-xs text-[#44403C] font-medium bg-white p-3 rounded-xl border border-[#E8E4DC]">
                      <strong className="font-bold text-[#1C1917]">Interviewer Intent:</strong> {q.context}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider">
                          Key Talking Points (STAR Method):
                        </span>
                        <button
                          onClick={() => handleCopy(q.idealAnswerKeypoints.join('\n• '), `q_${idx}`)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 font-semibold cursor-pointer"
                        >
                          {copiedId === `q_${idx}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-emerald-700" />}
                          <span>Copy Strategy</span>
                        </button>
                      </div>

                      <ul className="space-y-2">
                        {q.idealAnswerKeypoints.map((kp, kIdx) => (
                          <li key={kIdx} className="flex items-start space-x-2.5 text-xs text-[#44403C] font-medium bg-white p-3 rounded-xl border border-[#E8E4DC]">
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
