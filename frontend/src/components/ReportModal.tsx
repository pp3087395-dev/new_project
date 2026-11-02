import type { FC } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Lock,
  Activity,
  AlertTriangle
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
            title: 'FAKE // AI-GENERATED MEDIA',
            class: 'bg-[#E47777]/15 text-[#E47777] border-[#E47777]/40 print:bg-red-50 print:text-red-900 print:border-red-400'
          };
        }
        if (result.aiClassification.predictedClass === 'INCONCLUSIVE') {
          return {
            title: 'INCONCLUSIVE // UNCERTAIN STATE',
            class: 'bg-[#D9AB68]/15 text-[#D9AB68] border-[#D9AB68]/40 print:bg-amber-50 print:text-amber-900 print:border-amber-400'
          };
        }
        return {
          title: 'REAL // NO SIGNS OF FULL AI GENERATION',
          class: 'bg-[#70B68A]/15 text-[#70B68A] border-[#70B68A]/40 print:bg-emerald-50 print:text-emerald-900 print:border-emerald-400'
        };
      }

      if (result.aiClassification && result.aiClassification.status !== 'success') {
        return {
          title: 'SIGNAL FORENSICS ONLY (AI CLASSIFIER OFFLINE)',
          class: 'bg-[#D9AB68]/15 text-[#D9AB68] border-[#D9AB68]/40 print:bg-amber-50 print:text-amber-900 print:border-amber-400'
        };
      }

      return {
        title: 'GENUINE SIGNAL PROCESSING ACTIVE',
        class: 'bg-[#80B9A5]/15 text-[#80B9A5] border-[#80B9A5]/40 print:bg-slate-100 print:text-slate-900 print:border-slate-400'
      };
    }

    switch (result.resultCategory) {
      case 'potentially_manipulated':
        return {
          title: 'DEMO: LIKELY FULLY AI-GENERATED',
          class: 'bg-[#E47777]/15 text-[#E47777] border-[#E47777]/40 print:bg-red-50 print:text-red-900 print:border-red-400'
        };
      case 'no_strong_signs':
        return {
          title: 'DEMO: NO SIGNS OF FULL AI GENERATION',
          class: 'bg-[#70B68A]/15 text-[#70B68A] border-[#70B68A]/40 print:bg-emerald-50 print:text-emerald-900 print:border-emerald-400'
        };
      case 'inconclusive':
      default:
        return {
          title: 'DEMO: INCONCLUSIVE ANALYSIS',
          class: 'bg-[#D9AB68]/15 text-[#D9AB68] border-[#D9AB68]/40 print:bg-amber-50 print:text-amber-900 print:border-amber-400'
        };
    }
  };

  const badge = getResultBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101311]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl bg-[#171C19] border border-[#303A33] rounded-lg shadow-2xl overflow-hidden my-6 print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Top Action Bar (hidden when printing) */}
        <div className="no-print px-5 py-3.5 bg-[#1D2420] border-b border-[#303A33] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#80B9A5]" />
            <span className="text-xs font-mono font-bold text-[#F0F2ED] uppercase tracking-wider">
              Forensic Examination Document
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#101311] text-[#80B9A5] border border-[#303A33]">
              REF: {result.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadJSON}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#A0AAA1] bg-[#171C19] hover:text-[#F0F2ED] border border-[#303A33] transition-colors cursor-pointer"
              title="Download raw JSON data"
            >
              <Download className="w-3.5 h-3.5 text-[#80B9A5]" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#101311] bg-[#80B9A5] hover:bg-[#93c7b6] transition-colors cursor-pointer font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded text-[#707B72] hover:text-[#F0F2ED] transition-colors cursor-pointer"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-6 sm:p-10 print:p-0 space-y-6 print:text-black font-sans">
          
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-[#303A33] print:border-slate-300 gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-[#F0F2ED] print:text-black">
                  Truth<span className="text-[#80B9A5] print:text-teal-800">Lens</span>
                </span>
                <span className="text-xs font-mono text-[#707B72] print:text-slate-600">
                  | Digital Media Forensics & Integrity Protocol
                </span>
              </div>
              <p className="text-xs text-[#A0AAA1] print:text-slate-600 font-mono">
                Multimodal 2D Fast Fourier Transform, Metadata Forensics & ViT Inference Examination
              </p>
            </div>

            <div className="text-right font-mono text-xs text-[#707B72] print:text-slate-600 space-y-0.5">
              <div>AUDIT REF: <span className="font-bold text-[#F0F2ED] print:text-black">{result.id}</span></div>
              <div>DATE: {result.analyzedAt}</div>
              <div>MODE: <span className="text-[#80B9A5] print:text-teal-800 uppercase font-semibold">{result.mode}</span></div>
            </div>
          </div>

          {/* Target Media Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded bg-[#101311] border border-[#303A33] print:bg-slate-50 print:border-slate-300 text-xs font-mono">
            <div>
              <span className="text-[#707B72] block uppercase text-[10px]">Target File</span>
              <span className="font-bold text-[#F0F2ED] print:text-black truncate block mt-0.5">
                {result.fileName}
              </span>
            </div>
            <div>
              <span className="text-[#707B72] block uppercase text-[10px]">Format / Mode</span>
              <span className="font-bold text-[#F0F2ED] print:text-black uppercase block mt-0.5">
                {result.metadataAnalysis ? `${result.metadataAnalysis.format} (${result.metadataAnalysis.colorMode})` : result.fileType}
              </span>
            </div>
            <div>
              <span className="text-[#707B72] block uppercase text-[10px]">Resolution</span>
              <span className="font-bold text-[#F0F2ED] print:text-black block mt-0.5">
                {result.metadataAnalysis 
                  ? `${result.metadataAnalysis.dimensions.width}×${result.metadataAnalysis.dimensions.height}` 
                  : result.fileSizeFormatted}
              </span>
            </div>
            <div>
              <span className="text-[#707B72] block uppercase text-[10px]">SHA-256 Fingerprint</span>
              <span className="font-bold text-[#80B9A5] print:text-teal-800 text-[10px] truncate block mt-0.5" title={result.sha256Hash}>
                {result.sha256Hash ? `${result.sha256Hash.slice(0, 18)}...` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Provenance Clue Alert (if AI source declared in EXIF) */}
          {result.provenance?.aiSourceDeclared && (
            <div className="p-3.5 rounded border border-[#D9AB68]/50 bg-[#1D2420] print:bg-amber-50 print:border-amber-400 text-[#D9AB68] print:text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold uppercase font-mono text-[11px]">
                  AI Metadata Provenance Marker Detected
                </div>
                <p className="text-[#A0AAA1] print:text-slate-700 mt-0.5 leading-relaxed">
                  Metadata indicates media was created or edited with AI ({result.provenance.declaredSourceType || result.provenance.toolStrings.join(', ')}). The classifier verdict below independently assesses full synthetic generation.
                </p>
              </div>
            </div>
          )}

          {/* Primary Executive Verdict Section */}
          <div className="p-5 rounded-lg border border-[#303A33] bg-[#101311] print:bg-white print:border-slate-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono text-[#707B72] block uppercase tracking-wider mb-1">
                  Primary Classification Result
                </span>
                <div className={`inline-block px-3 py-1 rounded text-xs font-bold font-mono border ${badge.class}`}>
                  {badge.title}
                </div>
              </div>

              {result.confidenceScore != null ? (
                <div className="sm:text-right font-mono">
                  <span className="text-[10px] text-[#707B72] block uppercase tracking-wider">
                    Model Confidence Activation
                  </span>
                  <span className="text-2xl sm:text-3xl font-bold text-[#F0F2ED] print:text-black">
                    {result.confidenceScore.toFixed(1)}%
                  </span>
                  {result.aiClassification?.scores && (
                    <div className="text-[10px] text-[#A0AAA1] print:text-slate-600 mt-0.5">
                      Fake: {(result.aiClassification.scores.FAKE * 100).toFixed(1)}% | Non-AI: {(result.aiClassification.scores.REAL * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ) : (
                <div className="sm:text-right text-xs font-mono text-[#D9AB68] print:text-amber-800">
                  CONFIDENCE WITHHELD (Awaiting Model Online)
                </div>
              )}
            </div>

            <p className="text-xs text-[#A0AAA1] print:text-slate-700 leading-relaxed pt-2 border-t border-[#303A33] print:border-slate-200">
              {result.summary}
            </p>

            {/* Scope Boundary Notice */}
            <div className="p-2.5 rounded bg-[#171C19] print:bg-slate-100 border border-[#303A33] print:border-slate-200 text-[10px] font-mono text-[#707B72] print:text-slate-600 leading-relaxed">
              <strong>Scope Notice:</strong> Estimates whether an image is fully AI-generated. Cannot verify whether a real photograph was edited, retouched, or color-graded. Absence of detection is not proof the image is untouched.
            </div>
          </div>

          {/* AI Neural Classifier Section */}
          {result.aiClassification && (
            <div className="p-4 rounded-lg border border-[#303A33] print:border-slate-300 bg-[#101311] print:bg-white space-y-2.5 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#303A33] print:border-slate-200">
                <div className="font-bold text-[#F0F2ED] print:text-black uppercase">
                  Pretrained AI Classifier: {result.aiClassification.modelName}
                </div>
                <div className="text-[11px] text-[#80B9A5] print:text-teal-800">
                  {result.aiClassification.modelId}
                </div>
              </div>

              {result.aiClassification.status === 'success' ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded bg-[#171C19] print:bg-slate-100">
                    <div>
                      <span className="text-[#707B72] block text-[9px] uppercase">Predicted Class</span>
                      <span className={`font-bold ${
                        result.aiClassification.predictedClass === 'FAKE'
                          ? 'text-[#E47777] print:text-red-700'
                          : result.aiClassification.predictedClass === 'INCONCLUSIVE'
                          ? 'text-[#D9AB68] print:text-amber-700'
                          : 'text-[#70B68A] print:text-emerald-700'
                      }`}>
                        {result.aiClassification.predictedClass}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#707B72] block text-[9px] uppercase">Confidence</span>
                      <span className="font-bold text-[#F0F2ED] print:text-black">{result.aiClassification.confidenceScore}%</span>
                    </div>
                    <div>
                      <span className="text-[#707B72] block text-[9px] uppercase">Fake Score</span>
                      <span className="font-bold text-[#E47777] print:text-red-700">{(result.aiClassification.scores?.FAKE ? result.aiClassification.scores.FAKE * 100 : 0).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-[#707B72] block text-[9px] uppercase">Non-AI Score</span>
                      <span className="font-bold text-[#70B68A] print:text-emerald-700">{(result.aiClassification.scores?.REAL ? result.aiClassification.scores.REAL * 100 : 0).toFixed(2)}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#707B72] print:text-slate-600">
                    Note: {result.aiClassification.calibrationStatement} {result.aiClassification.scopeLimitation}
                  </p>
                </div>
              ) : (
                <div className="text-xs text-[#D9AB68] print:text-amber-800">
                  Classifier status: {result.aiClassification.status} ({result.aiClassification.errorMessage || 'Unavailable'})
                </div>
              )}
            </div>
          )}

          {/* 2D-FFT Visual Evidence */}
          {result.frequencyAnalysis && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-[#F0F2ED] print:text-black uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#80B9A5]" />
                <span>2D Fast Fourier Transform Magnitude Spectrum</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center p-3.5 rounded-lg border border-[#303A33] print:border-slate-300 bg-[#101311] print:bg-white text-xs">
                <div className="aspect-square max-h-40 rounded overflow-hidden bg-black flex items-center justify-center border border-[#303A33] print:border-slate-300">
                  <img
                    src={result.frequencyAnalysis.fftVisualizationBase64}
                    alt="2D-FFT Spectrum"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="space-y-2 text-[#A0AAA1] print:text-slate-700 font-mono">
                  <div className="font-semibold text-[#F0F2ED] print:text-black text-xs">
                    Radial Spectral Energy Distribution:
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>• Low Frequency (Core): {result.frequencyAnalysis.energyDistribution.lowFrequencyPct}%</div>
                    <div>• Mid Frequency (Edges): {result.frequencyAnalysis.energyDistribution.midFrequencyPct}%</div>
                    <div>• High Frequency (Grain): {result.frequencyAnalysis.energyDistribution.highFrequencyPct}%</div>
                  </div>
                  <p className="text-[10px] text-[#707B72] print:text-slate-600 leading-relaxed font-sans pt-1">
                    {result.frequencyAnalysis.disclaimer}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Forensic Evidence Signals */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#F0F2ED] print:text-black uppercase tracking-wider font-mono">
              Evaluated Forensic Signals ({result.evidence.length})
            </h3>

            <div className="border border-[#303A33] print:border-slate-300 rounded overflow-hidden divide-y divide-[#303A33] print:divide-slate-200 text-xs">
              {result.evidence.map((ev) => (
                <div key={ev.id} className="p-3 bg-[#101311] print:bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#F0F2ED] print:text-black font-mono text-[11px]">{ev.title}</div>
                    <div className="text-[11px] text-[#A0AAA1] print:text-slate-600">{ev.summary}</div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 font-mono">
                    <span className="text-[10px] text-[#707B72]">Metric: {ev.score}/100</span>
                    <span className="px-2 py-0.5 rounded text-[9px] uppercase font-semibold bg-[#1D2420] text-[#A0AAA1] print:bg-slate-200 print:text-black">
                      {ev.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Limitations & Ethics */}
          <div className="p-3.5 rounded bg-[#101311] border border-[#303A33] print:border-slate-300 print:bg-slate-50 space-y-1.5 text-[11px] text-[#707B72] print:text-slate-600 leading-relaxed font-mono">
            <div className="font-bold text-[#F0F2ED] print:text-black uppercase text-xs flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#80B9A5]" />
              <span>Standard Forensic Limitations & Disclaimer</span>
            </div>
            <ul className="list-disc pl-4 space-y-0.5 text-[#A0AAA1] print:text-slate-700">
              {result.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          {/* Sign-off Document Footer */}
          <div className="pt-4 border-t border-[#303A33] print:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] font-mono text-[#707B72]">
            <div>
              TRUTHLENS FORENSIC INTELLIGENCE // {result.modelInfo.name} ({result.modelInfo.version})
            </div>
            <div>
              SHA-256: {result.sha256Hash} • CONFIDENTIAL EXAMINATION REPORT
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
