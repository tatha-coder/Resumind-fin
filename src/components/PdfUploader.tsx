import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Briefcase, 
  Shield, 
  ArrowRight
} from 'lucide-react';
import { PdfMetadata, AnalysisResult } from '../types';
import { SAMPLE_RESUMES, SampleResumePreset } from '../lib/sampleResumes';

interface PdfUploaderProps {
  onUploadAndAnalyze: (pdfBase64: string, filename: string, targetRole: string) => Promise<void>;
  onLoadSampleAnalysis?: (sample: AnalysisResult) => void;
  loading: boolean;
  analyzedPdfMeta: PdfMetadata | null;
  targetRole: string;
  setTargetRole: (role: string) => void;
  onReset: () => void;
}

const ROLE_PRESETS = [
  'Senior Full Stack Engineer',
  'Lead Product Manager',
  'AI / ML Engineer',
  'DevOps & Cloud Architect',
  'Data Scientist',
  'Engineering Manager',
];

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  onUploadAndAnalyze,
  onLoadSampleAnalysis,
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
      setError('Invalid file format. Please upload a standard PDF resume (.pdf).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a compressed PDF.');
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
        setError(err.message || 'Failed to parse and analyze PDF.');
      }
    };
    reader.onerror = () => {
      setError('Failed to read PDF file from disk.');
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

  const handleLoadSample = (sample: SampleResumePreset) => {
    setTargetRole(sample.role);
    if (onLoadSampleAnalysis) {
      onLoadSampleAnalysis(sample.mockAnalysis);
    }
  };

  return (
    <div className="w-full space-y-5 animate-fade-in">
      
      {/* 1. Target Role & Quick Preset Selectors */}
      <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 sm:p-6 transition-colors shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5">
          <label className="block text-xs font-bold text-[#1C1917] uppercase tracking-wider">
            Target Role & Benchmark Title
          </label>
          <p className="text-[11px] text-[#78716C]">
            ATS parsing systems evaluate keyword density against this role title
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Briefcase className="w-4 h-4 text-[#78716C]" />
          </div>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Full Stack Engineer, Product Manager, Data Scientist..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E8E4DC] rounded-xl text-sm font-medium text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
          />
        </div>

        {/* Role Presets */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-[#78716C] mr-1">
            Role presets:
          </span>
          {ROLE_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setTargetRole(preset)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                targetRole === preset
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#EAE5DA] border border-[#E8E4DC]'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 2. PDF Upload Dropzone or Analyzed State */}
      {!analyzedPdfMeta ? (
        <div className="space-y-4">
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 sm:p-7 transition-colors text-center shadow-xs">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 transition-all cursor-pointer ${
                dragActive
                  ? 'border-emerald-600 bg-emerald-50/70'
                  : 'border-stone-300 hover:border-emerald-600 bg-[#FAF7F2]/80 hover:bg-emerald-50/40'
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
                <div className="space-y-3 py-4">
                  <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-[#1C1917]">
                      Auditing {selectedFileName || 'PDF Resume'}...
                    </h3>
                    <p className="text-xs text-[#78716C] mt-1">
                      Parsing document structure, keyword frequency, and format compliance
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-emerald-100/80 text-emerald-700 rounded-xl flex items-center justify-center mx-auto shadow-2xs">
                    <UploadCloud className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#1C1917]">
                      Drag & drop your PDF resume here
                    </h3>
                    <p className="text-xs text-[#78716C] mt-1">
                      or <span className="text-emerald-700 font-semibold underline">select file</span> from your computer
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-[#F5F2EB] rounded-md text-[11px] text-[#44403C] border border-[#E8E4DC] font-medium">
                      <FileText className="w-3 h-3 text-[#78716C]" />
                      <span>PDF up to 10MB</span>
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-50 rounded-md text-[11px] text-emerald-800 border border-emerald-200/90 font-medium">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>Private & Encrypted</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center justify-center space-x-2 font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* 3. Sample Resumes Card (Zero-Friction Testing) */}
          <div className="bg-white border border-[#E8E4DC] rounded-2xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider">
                Sample Resumes for Instant Testing
              </h4>
              <span className="text-[11px] text-emerald-700 font-semibold">
                1-Click Inspection
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {SAMPLE_RESUMES.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample)}
                  className="bg-[#FAF7F2] hover:bg-emerald-50/60 border border-[#E8E4DC] rounded-xl p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-[#1C1917]">
                        {sample.candidateName}
                      </span>
                      <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100/90 text-emerald-800 rounded border border-emerald-200/80">
                        {sample.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#78716C] line-clamp-1">
                      {sample.summary}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 px-2.5 py-1 bg-white group-hover:bg-emerald-600 group-hover:text-white text-[#44403C] text-xs font-semibold rounded-lg transition-colors border border-[#E8E4DC] shadow-2xs">
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Loaded PDF Metadata Card */
        <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5 space-y-4 transition-colors shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[#E8E4DC]">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-200/90 rounded-xl text-emerald-700">
                <FileCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-sm text-[#1C1917]">{analyzedPdfMeta.filename}</h3>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    Parsed
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {(analyzedPdfMeta.filesize / 1024).toFixed(1)} KB • {analyzedPdfMeta.pageCount} Page(s) • ~{analyzedPdfMeta.wordCount} Words • Target: <strong className="text-[#1C1917]">{targetRole}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExtractedText(!showExtractedText)}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE5DA] text-[#44403C] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border border-[#E8E4DC]"
              >
                {showExtractedText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                <span>{showExtractedText ? 'Hide Text' : 'View Text'}</span>
              </button>

              <button
                onClick={onReset}
                className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#EAE5DA] text-[#44403C] border border-[#E8E4DC] rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Upload New</span>
              </button>
            </div>
          </div>

          {/* Extracted Text Viewer */}
          {showExtractedText && (
            <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E4DC] max-h-56 overflow-y-auto font-mono text-xs text-[#44403C] space-y-2">
              <div className="flex items-center justify-between border-b border-[#E8E4DC] pb-1.5">
                <p className="text-[10px] text-[#78716C] uppercase font-bold tracking-wider">
                  Raw Parsed Text Stream:
                </p>
                <span className="text-[10px] text-[#78716C]">
                  {analyzedPdfMeta.wordCount} words
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs text-[#44403C] leading-relaxed">
                {analyzedPdfMeta.extractedText || 'No plain text extracted, PDF processed natively.'}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
