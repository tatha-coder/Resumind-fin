import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Target, ArrowRight, Layers, FileCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSample?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onSelectSample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="relative w-full max-w-xl bg-white border border-[#E8E4DC] rounded-2xl shadow-xl overflow-hidden transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="relative bg-gradient-to-b from-emerald-50/70 to-transparent p-6 pb-4 border-b border-[#E8E4DC]">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              RM
            </div>
            <div>
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                <Sparkles className="w-3 h-3" />
                <span>Career Diagnostic Platform</span>
              </span>
              <h2 className="text-xl font-bold text-[#1C1917] tracking-tight mt-1">
                What is ResuMind?
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          <p className="text-sm sm:text-base text-[#57534E] leading-relaxed font-normal">
            ResuMind is your smart resume companion that analyzes your resume, identifies strengths and weaknesses, checks ATS compatibility, and gives you practical recommendations to make your resume stronger.
          </p>

          {/* 3 Requested Feature Cards */}
          <div className="grid sm:grid-cols-3 gap-3.5">
            {/* Card 1: ATS Analysis */}
            <div className="bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1C1917]">
                ATS Analysis
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Understand your ATS compatibility and bypass screening algorithms.
              </p>
            </div>

            {/* Card 2: Resume Insights */}
            <div className="bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1C1917]">
                Resume Insights
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Discover strengths, structural gaps, and missing domain keywords.
              </p>
            </div>

            {/* Card 3: Actionable Recommendations */}
            <div className="bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl p-4 space-y-2 hover:border-emerald-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#D97706] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-[#1C1917]">
                Actionable Recommendations
              </h3>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Get practical ways and bullet rewrites to make your resume stronger.
              </p>
            </div>
          </div>

          {/* Privacy & Confidentiality note */}
          <div className="p-3.5 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl flex items-center justify-between text-xs text-[#78716C]">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>100% Client-Isolated & Secure Data Processing</span>
            </div>
            <span className="text-[#1C1917] font-semibold">Tathagata Chakraborty</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F2EDE4] text-[#57534E] text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-[#E8E4DC]"
            >
              Close
            </button>
            {onSelectSample && (
              <button
                onClick={() => {
                  onClose();
                  onSelectSample();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <span>Try Sample Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
