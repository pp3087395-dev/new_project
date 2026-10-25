import type { FC } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Sparkles,
  Lock,
  Activity
} from 'lucide-react';
import type { AnalysisResult } from '../types';

interface ReportModalProps {
  result: AnalysisResult;
  onClose: () => void;
}

export const ReportModal: FC<ReportModalProps> = ({ result, onClose }) => {
  const isGenuine = result.mode === 'genuine_signal_processing';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `truthlens_audit_${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getResultBadge = () => {
    if (isGenuine) {
      if (result.aiClassification && result.aiClassification.status === 'success') {
        if (result.aiClassification.predictedClass === 'FAKE') {
          return {
            title: 'AI-GENERATED MEDIA PATTERNS DETECTED',
            class: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-500/40'
          };
        }
        return {
          title: 'NO STRONG AI GENERATION SIGNS DETECTED',
          class: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40'
        };
      }

      if (result.aiClassification && result.aiClassification.status !== 'success') {
        return {
          title: 'SIGNAL FORENSICS ONLY (AI MODEL UNAVAILABLE)',
          class: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40'
        };
      }

      return {
        title: 'GENUINE IMAGE FORENSICS ACTIVE',
        class: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-500/40'
      };
    }

    switch (result.resultCategory) {
      case 'potentially_manipulated':
        return {
          title: 'DEMO: POTENTIALLY MANIPULATED',
          class: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/80 dark:text-red-300 dark:border-red-500/40'
        };
      case 'no_strong_signs':
        return {
          title: 'DEMO: NO STRONG SIGNS DETECTED',
          class: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-500/40'
        };
      case 'inconclusive':
      default:
        return {
          title: 'DEMO: INCONCLUSIVE ANALYSIS',
          class: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-500/40'
        };
    }
  };

  const badge = getResultBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Forensic Audit Report Document
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              isGenuine ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800/40' : 'text-violet-400 bg-violet-950/60 border-violet-800/40'
            }`}>
              {isGenuine ? (result.aiClassification?.status === 'success' ? 'ONNX ViT & FORENSICS' : 'GENUINE FORENSICS') : 'DEMO MODE'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              title="Download JSON record"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-cyan-600 hover:bg-cyan-500 shadow transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 print:p-0 space-y-8 print:text-black">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold font-heading text-white print:text-black">
                  Truth<span className="text-cyan-400 print:text-cyan-700">Lens</span>
                </span>
                <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                  | Media Authenticity & Signal Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Automated 2D Fast Fourier Transform, Metadata Forensics & ViT Neural Classification Protocol
              </p>
            </div>

            <div className="text-right font-mono text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <div>AUDIT REF: <span className="font-bold text-white print:text-black">{result.id}</span></div>
              <div>DATE: {result.analyzedAt}</div>
              <div>MODE: <span className="text-cyan-400 print:text-cyan-700 uppercase font-semibold">{result.mode}</span></div>
            </div>
          </div>

          {/* Watermark Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
            isGenuine 
              ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-300 print:bg-slate-100 print:border-slate-300 print:text-slate-800'
              : 'bg-violet-950/40 border-violet-500/30 text-violet-300 print:bg-slate-100 print:border-slate-300 print:text-slate-800'
          }`}>
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 print:hidden" />
            <div className="leading-relaxed">
              <strong>AUDIT STATUS:</strong> {isGenuine 
                ? (result.aiClassification?.status === 'success'
                  ? `Genuine forensics active: Pretrained Vision Transformer (${result.aiClassification.modelName}) neural classification, 2D Fast Fourier Transform, and EXIF extraction.`
                  : 'Genuine signal processing active. 2D Fast Fourier Transform and EXIF metadata extracted. Pretrained neural classifier is currently offline/unavailable.')
                : 'This audit report was compiled using TruthLens Phase 1 simulated heuristics.'}
            </div>
          </div>

          {/* Target Media Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Target File</span>
              <span className="font-bold text-white print:text-black font-mono truncate block mt-0.5">
                {result.fileName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Media Format</span>
              <span className="font-bold text-white print:text-black uppercase font-mono block mt-0.5">
                {result.metadataAnalysis ? `${result.metadataAnalysis.format} (${result.metadataAnalysis.colorMode})` : result.fileType}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Resolution</span>
              <span className="font-bold text-white print:text-black font-mono block mt-0.5">
                {result.metadataAnalysis 
                  ? `${result.metadataAnalysis.dimensions.width}×${result.metadataAnalysis.dimensions.height}` 
                  : result.fileSizeFormatted}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase font-mono text-[10px]">Cryptographic SHA-256</span>
              <span className="font-bold text-cyan-400 print:text-cyan-800 font-mono text-[10px] truncate block mt-0.5" title={result.sha256Hash}>
                {result.sha256Hash ? `${result.sha256Hash.slice(0, 18)}...` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Executive Verdict Section */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/40 print:bg-white print:border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider mb-1">
                  Primary Classification State
                </span>
                <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold font-mono border ${badge.class}`}>
                  {badge.title}
                </div>
              </div>

              {result.confidenceScore != null ? (
                <div className="sm:text-right">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">
                    Calculated Confidence
                  </span>
                  <span className="text-3xl font-extrabold text-white print:text-black font-heading">
                    {result.confidenceScore.toFixed(1)}%
                  </span>
                  {result.aiClassification?.scores && (
                    <div className="text-[10px] font-mono text-slate-400 print:text-slate-600 mt-0.5">
                      Fake: {(result.aiClassification.scores.FAKE * 100).toFixed(1)}% | Real: {(result.aiClassification.scores.REAL * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="sm:text-right text-xs font-mono text-amber-400 print:text-amber-700">
                  CONFIDENCE WITHHELD (Awaiting Neural Model)
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 print:text-slate-700 leading-relaxed pt-2 border-t border-slate-800/80 print:border-slate-200">
              {result.summary}
            </p>
          </div>

          {/* AI Neural Classifier Section */}
          {result.aiClassification && (
            <div className="p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/40 print:bg-white space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="font-mono text-xs font-bold text-white print:text-black uppercase">
                  Pretrained AI Classifier: {result.aiClassification.modelName}
                </div>
                <div className="text-[11px] font-mono text-cyan-400 print:text-cyan-800">
                  {result.aiClassification.modelId}
                </div>
              </div>

              {result.aiClassification.status === 'success' ? (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] p-2.5 rounded-lg bg-black/40 print:bg-slate-100">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Predicted Class</span>
                      <span className="font-bold text-white print:text-black">{result.aiClassification.predictedClass}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Confidence</span>
                      <span className="font-bold text-white print:text-black">{result.aiClassification.confidenceScore}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Fake Score</span>
                      <span className="font-bold text-red-400 print:text-red-700">{(result.aiClassification.scores?.FAKE ? result.aiClassification.scores.FAKE * 100 : 0).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase">Real Score</span>
                      <span className="font-bold text-emerald-400 print:text-emerald-700">{(result.aiClassification.scores?.REAL ? result.aiClassification.scores.REAL * 100 : 0).toFixed(2)}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600 italic">
                    Note: {result.aiClassification.calibrationStatement} {result.aiClassification.scopeLimitation}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-amber-400 print:text-amber-700 font-mono">
                  Classifier status: {result.aiClassification.status} ({result.aiClassification.errorMessage || 'Unavailable'})
                </div>
              )}
            </div>
          )}

          {/* 2D-FFT Visual Evidence (if computed) */}
          {result.frequencyAnalysis && (
            <div>
              <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider font-mono mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Computed 2D Fast Fourier Transform Magnitude Spectrum</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-4 rounded-xl border border-slate-800 print:border-slate-300 bg-slate-950/50 print:bg-white">
                <div className="aspect-square max-h-48 rounded-lg overflow-hidden bg-black flex items-center justify-center border border-slate-800 print:border-slate-300">
                  <img
                    src={result.frequencyAnalysis.fftVisualizationBase64}
                    alt="2D-FFT Spectrum"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2 text-xs text-slate-300 print:text-slate-700">
                  <div className="font-semibold text-white print:text-black">
                    Radial Spectral Energy Distribution:
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div>• Low Frequency: {result.frequencyAnalysis.energyDistribution.lowFrequencyPct}%</div>
                    <div>• Mid Frequency: {result.frequencyAnalysis.energyDistribution.midFrequencyPct}%</div>
                    <div>• High Frequency: {result.frequencyAnalysis.energyDistribution.highFrequencyPct}%</div>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600 leading-relaxed pt-1">
                    {result.frequencyAnalysis.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Forensic Evidence Signals */}
          <div>
            <h3 className="text-xs font-bold text-white print:text-black uppercase tracking-wider font-mono mb-3">
              Forensic Evidence Signals
            </h3>

            <div className="border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-800 print:divide-slate-200 text-xs">
              {result.evidence.map((ev) => (
                <div key={ev.id} className="p-3.5 bg-slate-900/30 print:bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-bold text-white print:text-black">{ev.title}</div>
                    <div className="text-[11px] text-slate-400 print:text-slate-600">{ev.summary}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-500">Metric: {ev.score}/100</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300 print:bg-slate-200 print:text-black">
                      {ev.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Disclaimers & Ethics */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-2 text-[11px] text-slate-400 print:text-slate-600 leading-relaxed">
            <div className="font-bold text-white print:text-black font-mono uppercase text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
              <span>Standard Verification Disclaimer & Limitations</span>
            </div>
            <ul className="list-disc pl-4 space-y-1">
              {result.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Sign-off Footer */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
            <div>
              GENERATED BY TRUTHLENS AUDIT ENGINE • {result.modelInfo.name} ({result.modelInfo.version})
            </div>
            <div>
              CONFIDENTIAL & RESEARCH ORIENTED • PAGE 1 OF 1
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
