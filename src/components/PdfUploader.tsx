import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, FileCheck, Eye, EyeOff, Sparkles, RefreshCw } from 'lucide-react';
import { PdfMetadata } from '../types';

interface PdfUploaderProps {
  onUploadAndAnalyze: (pdfBase64: string, filename: string, targetRole: string) => Promise<void>;
  loading: boolean;
  analyzedPdfMeta: PdfMetadata | null;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onReset: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onUploadAndAnalyze,
  loading,
  analyzedPdfMeta,
  targetRole,
  setTargetRole,
  onReset,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Invalid file type. Please upload a PDF file (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller PDF.');
      return;
    }

    setSelectedFileName(file.name);

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      try {
        await onUploadAndAnalyze(base64String, file.name, targetRole);
      } catch (err: any) {
        setError(err.message || 'Failed to upload and analyze PDF.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read PDF file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Target Role Selector Input */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors duration-200">
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          1. Target Role or Job Title for Analysis
        </label>
        <div className="relative">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g., Senior Full Stack Engineer, Product Manager, Data Scientist"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-850 transition-colors font-medium"
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          Gemini AI will benchmark your resume's ATS score, keywords, and metrics specifically against this target role.
        </p>
      </div>

      {/* PDF Upload Dropzone or Analyzed State */}
      {!analyzedPdfMeta ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs text-center transition-colors duration-200">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !loading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 transition-all cursor-pointer ${
              dragActive
                ? 'border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleChange}
              className="hidden"
            />

            {loading ? (
              <div className="space-y-4 py-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 animate-pulse">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyzing {selectedFileName || 'PDF Resume'}...</h3>
                  <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1">Reading PDF structure & executing Gemini AI ATS scoring</p>
                </div>
                
                {/* Dynamic Step Progress */}
                <div className="max-w-xs mx-auto bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 dark:bg-blue-500 h-full w-3/4 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Drag and drop your PDF resume here
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    or <span className="text-blue-600 dark:text-blue-400 font-bold underline">browse files</span> from your computer
                  </p>
                </div>

                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[11px] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Supports PDF up to 10MB (Exact Text & Layout Extraction)</span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center space-x-2 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        /* Loaded PDF Metadata Card */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 transition-colors duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3.5">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{analyzedPdfMeta.filename}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800">
                    Parsed Successfully
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {(analyzedPdfMeta.filesize / 1024).toFixed(1)} KB • {analyzedPdfMeta.pageCount} Page(s) • ~{analyzedPdfMeta.wordCount} Words
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {showExtractedText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showExtractedText ? 'Hide PDF Text' : 'View Extracted Text'}</span>
              </button>

              <button
                onClick={onReset}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload New PDF</span>
              </button>
            </div>
          </div>

          {/* Extracted Text Viewer */}
          {showExtractedText && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 max-h-48 overflow-y-auto font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <p className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-bold tracking-wider">
                Parsed PDF Text Output (Server Extracted):
              </p>
              <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {analyzedPdfMeta.extractedText || 'No plain text extracted, PDF processed natively via Gemini inline data.'}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
