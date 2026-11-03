import { useState } from 'react';
import type { FC } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Layers, 
  ArrowLeft, 
  ShieldAlert, 
  Activity, 
  Download,
  Info,
  Cpu,
  ShieldCheck,
  Copy,
  Check,
  FileText,
  RotateCcw
} from 'lucide-react';
import type { AnalysisResult, EvidenceItem } from '../types';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onNewAnalysis: () => void;
  onOpenReport: () => void;
}

export const ResultsDashboard: FC<ResultsDashboardProps> = ({
  result,
  onNewAnalysis,
  onOpenReport
}) => {
  const [activeOverlay, setActiveOverlay] = useState<'standard' | 'fft' | 'split'>('standard');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(
    result.evidence.length > 0 ? result.evidence[0] : null
  );
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const summaryText = [
      `TRUTHLENS FORENSIC EXAMINATION REPORT`,
      `Audit Reference: ${result.id}`,
      `File: ${result.fileName} (${result.fileSizeFormatted})`,
      `Verdict: ${status.label}`,
      result.aiClassification?.confidenceScore != null ? `Model Confidence: ${result.aiClassification.confidenceScore.toFixed(1)}%` : '',
      `SHA-256 Hash: ${result.sha256Hash}`,
      `Analyzed At: ${result.analyzedAt}`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getStatusBadge = () => {
    const activeModelName = result.aiClassification?.modelName?.toUpperCase() || 'AI FORENSIC CLASSIFIER';

    if (result.aiClassification && result.aiClassification.status === 'success') {
      const pred = result.aiClassification.predictedClass;
      if (pred === 'FAKE') {
        return {
          label: 'FAKE // AI-GENERATED MEDIA',
          shortLabel: 'FAKE',
          badgeText: activeModelName,
          icon: AlertTriangle,
          textColor: 'text-rose-700',
          bgColor: 'bg-rose-50/90',
          borderColor: 'border-rose-300',
          indicatorColor: 'bg-rose-600'
        };
      }
      if (pred === 'INCONCLUSIVE') {
        const fakeProb = result.aiClassification.scores?.FAKE !== undefined
          ? (result.aiClassification.scores.FAKE * 100).toFixed(1)
          : (result.confidenceScore != null ? result.confidenceScore.toFixed(1) : '50.0');
        return {
          label: 'INCONCLUSIVE // UNCERTAIN STATE',
          shortLabel: 'INCONCLUSIVE',
          badgeText: `INCONCLUSIVE (AI prob: ${fakeProb}%)`,
          icon: HelpCircle,
          textColor: 'text-amber-800',
          bgColor: 'bg-amber-50/90',
          borderColor: 'border-amber-300',
          indicatorColor: 'bg-amber-500'
        };
      }
      return {
        label: 'REAL // NO SIGNS OF FULL AI GENERATION',
        shortLabel: 'REAL',
        badgeText: activeModelName,
        icon: CheckCircle2,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-300',
        indicatorColor: 'bg-emerald-600'
      };
    }

    if (result.aiClassification && result.aiClassification.status !== 'success') {
      return {
        label: 'AI CLASSIFIER OFFLINE — SIGNAL FORENSICS ONLY',
        shortLabel: 'SIGNAL ONLY',
        badgeText: 'GENUINE SIGNAL FORENSICS',
        icon: HelpCircle,
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-300',
        indicatorColor: 'bg-amber-500'
      };
    }

    if (result.resultCategory === 'potentially_manipulated') {
      return {
        label: 'FAKE // LIKELY FULLY AI-GENERATED',
        shortLabel: 'FAKE',
        badgeText: activeModelName,
        icon: AlertTriangle,
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-50/90',
        borderColor: 'border-rose-300',
        indicatorColor: 'bg-rose-600'
      };
    }

    if (result.resultCategory === 'no_strong_signs') {
      return {
        label: 'REAL // NO SIGNS OF FULL AI GENERATION',
        shortLabel: 'REAL',
        badgeText: activeModelName,
        icon: CheckCircle2,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-300',
        indicatorColor: 'bg-emerald-600'
      };
    }

    if (result.resultCategory === 'inconclusive') {
      return {
        label: 'INCONCLUSIVE // UNCERTAIN STATE',
        shortLabel: 'INCONCLUSIVE',
        badgeText: 'INCONCLUSIVE ANALYSIS',
        icon: HelpCircle,
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-300',
        indicatorColor: 'bg-amber-500'
      };
    }

    return {
      label: 'IMAGE FORENSICS // SIGNAL PROCESSING ACTIVE',
      shortLabel: 'SIGNAL FORENSICS',
      badgeText: 'DETERMINISTIC 2D-FFT',
      icon: Activity,
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50/90',
      borderColor: 'border-blue-300',
      indicatorColor: 'bg-blue-600'
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Breadcrumb & Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 text-xs font-mono font-bold text-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO UPLOAD CONSOLE</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Copy Summary Action */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold text-slate-800 bg-white hover:text-blue-600 border border-slate-300 hover:border-blue-400 transition-colors cursor-pointer shadow-2xs"
            title="Copy audit findings to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED' : 'COPY SUMMARY'}</span>
          </button>

          {/* Download PDF Audit Report */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-mono font-bold text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-500 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>DOWNLOAD AUDIT REPORT</span>
          </button>

          {/* Analyze Another File */}
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span>Analyze Another File</span>
          </button>
        </div>
      </div>

      {/* AI Provenance Clue Alert Banner (if EXIF/IPTC declares AI tool) */}
      {result.provenance?.aiSourceDeclared && (
        <div className="p-3.5 rounded-lg bg-[#171C19] border border-[#D9AB68]/50 text-[#D9AB68] text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold font-mono uppercase text-[11px] tracking-wider">
              AI Metadata Provenance Marker Detected in Media Container
            </div>
            <p className="text-[#A0AAA1] leading-relaxed text-xs">
              Embedded metadata declares AI generation or editing (
              <strong className="text-[#F0F2ED]">
                {result.provenance.declaredSourceType || result.provenance.toolStrings.join(', ') || 'Metadata Marker'}
              </strong>
              ). The neural classifier verdict below independently measures full synthetic generative synthesis.
            </p>
          </div>
        </div>
      )}

      {/* Section 1: Primary Forensic Examination Report Header */}
      <div className={`p-7 sm:p-8 rounded-2xl ${status.bgColor} border-2 ${status.borderColor} relative shadow-sm`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-extrabold uppercase tracking-wider ${status.textColor} bg-white border ${status.borderColor} shadow-2xs`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {status.shortLabel}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1 rounded-md border border-slate-300 shadow-2xs">
                AUDIT ID: {result.id}
              </span>
              <span className="text-xs font-mono font-bold text-blue-700 bg-white px-3 py-1 rounded-md border border-blue-200 shadow-2xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                {result.aiClassification?.status === 'success' 
                  ? result.aiClassification.modelName 
                  : 'Deterministic 2D-FFT & Metadata'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-950 font-sans tracking-tight">
              {status.label}
            </h1>

            <p className="text-sm sm:text-base text-slate-700 max-w-2xl leading-relaxed font-normal">
              {result.aiClassification && result.aiClassification.status === 'success' ? (
                result.aiClassification.predictedClass === 'INCONCLUSIVE' ? (
                  <span>
                    The model cannot reliably separate this image from camera photography. Additional manual verification is advised. Evaluated via <strong>{result.aiClassification.modelName}</strong> ({result.aiClassification.modelId}) alongside radial 2D-FFT frequency domain analysis.
                  </span>
                ) : (
                  <span>
                    Image inspected via fine-tuned <strong>{result.aiClassification.modelName}</strong> ({result.aiClassification.modelId}) on CPU, alongside mathematical <strong>2D Fast Fourier Transform (FFT) log-magnitude spectrum</strong> and EXIF provenance extraction.
                  </span>
                )
              ) : (
                <span>
                  Processed through NumPy to calculate authentic <strong>2D Fast Fourier Transform (FFT) log-magnitude spectrum</strong> and extract camera EXIF tags. The neural classifier is currently offline ({result.aiClassification?.errorMessage || 'not loaded'}).
                </span>
              )}
            </p>
          </div>

          {/* Model Activation & Confidence Score Metric Box */}
          <div className="shrink-0 p-6 rounded-2xl bg-white border-2 border-slate-200 min-w-[260px] text-center shadow-xs">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-1.5 font-extrabold">
              MODEL CLASSIFICATION ACTIVATION
            </div>

            {result.aiClassification && result.aiClassification.status === 'success' ? (
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight flex items-center justify-center gap-2">
                  <span className={status.textColor}>
                    {result.aiClassification.predictedClass}
                  </span>
                  <span className="text-base text-slate-600 font-bold font-mono">
                    ({result.aiClassification.confidenceScore?.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-xs text-slate-700 mt-2 font-mono font-bold">
                  FAKE: {(result.aiClassification.scores?.FAKE ? result.aiClassification.scores.FAKE * 100 : 0).toFixed(1)}% | REAL: {(result.aiClassification.scores?.REAL ? result.aiClassification.scores.REAL * 100 : 0).toFixed(1)}%
                </div>
              </div>
            ) : (result.confidenceScore != null) ? (
              <div>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-950">
                  {result.confidenceScore.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono font-bold">
                  Forensic Signal Activation
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-black text-amber-700 font-mono">
                  WITHHELD
                </div>
                <div className="text-xs text-slate-600 mt-1 font-mono font-medium">
                  {result.aiClassification?.errorMessage ? 'AI classifier offline.' : 'Model not connected.'}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Forensic Scope Reminder Notice */}
        <div className="mt-5 pt-3.5 border-t border-slate-200 text-xs text-slate-600 flex items-start gap-2 font-mono font-medium">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Scope Boundary: This system estimates whether an image is fully AI-generated. It cannot determine whether an authentic photograph was edited, retouched, or color-graded. Absence of detection is not proof the image is untouched.
          </p>
        </div>
      </div>

      {/* Section 2: Technical Image Properties Strip */}
      {result.metadataAnalysis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-mono">
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs uppercase block font-bold">RESOLUTION</span>
            <span className="font-black text-slate-950 text-base mt-1 block">
              {result.metadataAnalysis.dimensions.width} × {result.metadataAnalysis.dimensions.height}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs uppercase block font-bold">FILE SIZE</span>
            <span className="font-black text-slate-950 text-base mt-1 block">
              {result.fileSizeFormatted}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs uppercase block font-bold">FORMAT / COLOR</span>
            <span className="font-black text-slate-950 text-base mt-1 block">
              {result.metadataAnalysis.format} ({result.metadataAnalysis.colorMode})
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-2xs">
            <span className="text-slate-500 text-xs uppercase block font-bold">ASPECT RATIO</span>
            <span className="font-black text-slate-950 text-base mt-1 block">
              {result.metadataAnalysis.dimensions.aspectRatio || `${result.metadataAnalysis.dimensions.width}:${result.metadataAnalysis.dimensions.height}`}
            </span>
          </div>
        </div>
      )}

      {/* Section 3: Vision Transformer Classifier Technical Breakdown */}
      {result.aiClassification && (
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-600 shadow-2xs">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                  NEURAL CLASSIFIER INFERENCE
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-950 font-sans">
                  {result.aiClassification.modelName}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-md bg-slate-100 text-blue-700 font-bold border border-slate-200">
                {result.aiClassification.modelId}
              </span>
              <span className={`px-3 py-1 rounded-md font-extrabold uppercase border ${
                result.aiClassification.status === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                STATUS: {result.aiClassification.status}
              </span>
            </div>
          </div>

          {result.aiClassification.status === 'success' ? (
            <div className="space-y-4">
              
              {/* Dual Probability Bar */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3 font-mono">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-rose-700">
                    Likely AI-Generated: {result.aiClassification.scores?.FAKE !== undefined ? (result.aiClassification.scores.FAKE * 100).toFixed(2) : 0}%
                  </span>
                  <span className="text-emerald-700">
                    No Signs of AI: {result.aiClassification.scores?.REAL !== undefined ? (result.aiClassification.scores.REAL * 100).toFixed(2) : 0}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full overflow-hidden bg-slate-200 flex border border-slate-300">
                  <div
                    className="bg-rose-600 h-full transition-all duration-500"
                    style={{ width: `${(result.aiClassification.scores?.FAKE || 0) * 100}%` }}
                    title={`Fake Score: ${((result.aiClassification.scores?.FAKE || 0) * 100).toFixed(2)}%`}
                  />
                  <div
                    className="bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${(result.aiClassification.scores?.REAL || 0) * 100}%` }}
                    title={`Real Score: ${((result.aiClassification.scores?.REAL || 0) * 100).toFixed(2)}%`}
                  />
                </div>

                <div className="text-xs text-slate-700 flex flex-wrap justify-between pt-2 border-t border-slate-200 gap-2 font-medium">
                  <span>
                    Decision Cutoff: <strong className="text-slate-950 font-bold">{((result.aiClassification.decisionThreshold ?? 0.50) * 100).toFixed(0)}%</strong>
                  </span>
                  <span>
                    Inconclusive Window: <strong className="text-amber-800 font-bold">±{((result.aiClassification.uncertainBand ?? 0.10) * 100).toFixed(0)}%</strong> ({(((result.aiClassification.decisionThreshold ?? 0.50) - (result.aiClassification.uncertainBand ?? 0.10)) * 100).toFixed(0)}%–{(((result.aiClassification.decisionThreshold ?? 0.50) + (result.aiClassification.uncertainBand ?? 0.10)) * 100).toFixed(0)}%)
                  </span>
                  {result.aiClassification.inferenceTimeMs !== null && (
                    <span>
                      Latency: <strong className="text-blue-700 font-bold">{result.aiClassification.inferenceTimeMs} ms</strong> on CPU
                    </span>
                  )}
                </div>
              </div>

              {/* Calibration Statement & Scope Limitation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="font-bold text-amber-900 font-mono text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 shrink-0 text-amber-700" />
                    <span>Uncalibrated Probability Notice</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans font-medium text-xs sm:text-sm">
                    {result.aiClassification.calibrationStatement}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <div className="font-bold text-blue-950 font-mono text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>Full AI vs Editing Scope</span>
                  </div>
                  <p className="text-slate-800 leading-relaxed font-sans font-medium text-xs sm:text-sm">
                    {result.aiClassification.scopeLimitation}
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs sm:text-sm space-y-2">
              <div className="font-bold font-mono text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-700" />
                  <span>AI Inference Engine Offline</span>
                </div>
                <button
                  onClick={onNewAnalysis}
                  className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 border border-amber-400 text-amber-950 text-xs font-mono font-bold cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed font-medium">
                {result.aiClassification.errorMessage || 'Could not load neural model weights. Deterministic 2D-FFT frequency inspection and EXIF extraction remain fully active below.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Section 4: Grid of Media Inspector (7 cols) & Forensic Evidence / Metadata (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Multi-View Media Inspector */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            
            {/* Visualizer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-black text-slate-950 font-mono uppercase tracking-wider">
                  Forensic Media Inspector
                </span>
              </div>

              {/* Overlay Layer Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold">
                <button
                  onClick={() => setActiveOverlay('standard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeOverlay === 'standard'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Spatial Image
                </button>
                <button
                  onClick={() => setActiveOverlay('fft')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeOverlay === 'fft'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  2D-FFT Spectrum
                </button>
                <button
                  onClick={() => setActiveOverlay('split')}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    activeOverlay === 'split'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:text-blue-600'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Media Display Viewport (Dark Chamber for Diagnostic Imaging) */}
            <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden my-4 flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Corner Reticles */}
              <div className="reticle-corner-blue-tl" />
              <div className="reticle-corner-blue-tr" />
              <div className="reticle-corner-blue-bl" />
              <div className="reticle-corner-blue-br" />

              {activeOverlay === 'standard' && (
                <img
                  src={result.mediaUrl}
                  alt={result.fileName}
                  className="w-full h-full object-contain"
                />
              )}

              {activeOverlay === 'fft' && (
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  {result.frequencyAnalysis ? (
                    <img
                      src={result.frequencyAnalysis.fftVisualizationBase64}
                      alt="Actual Computed 2D-FFT Magnitude Spectrum"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-400 font-mono">
                      FFT visualization not available for this record.
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 bg-slate-900/90 px-3 py-1 rounded-md border border-slate-700 text-xs font-mono text-sky-400 font-bold shadow-sm">
                    NUMPY 2D-FFT LOG-MAGNITUDE SPECTRUM
                  </div>
                </div>
              )}

              {activeOverlay === 'split' && (
                <div className="grid grid-cols-2 w-full h-full divide-x divide-slate-800">
                  <div className="relative h-full flex items-center justify-center bg-slate-950 p-2">
                    <img
                      src={result.mediaUrl}
                      alt={result.fileName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-mono text-slate-200">
                      Spatial Domain
                    </div>
                  </div>
                  <div className="relative h-full flex items-center justify-center bg-slate-950 p-2">
                    {result.frequencyAnalysis && (
                      <img
                        src={result.frequencyAnalysis.fftVisualizationBase64}
                        alt="2D-FFT Spectrum"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute bottom-2 left-2 bg-slate-900/90 px-2 py-0.5 rounded text-[10px] font-mono text-sky-400 font-bold">
                      Frequency Domain (FFT)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Radial Spectral Energy Distribution */}
            {result.frequencyAnalysis && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-xs font-mono font-black uppercase text-slate-950 mb-3 flex items-center justify-between">
                  <span>Radial Spectral Energy Bands</span>
                  <span className="text-xs text-slate-500 font-medium">Calculated across 512×512 radius</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">LOW FREQ (CORE)</div>
                    <div className="text-xl font-black text-blue-700 mt-0.5">
                      {result.frequencyAnalysis.energyDistribution.lowFrequencyPct}%
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Illumination & shapes</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">MID FREQ (EDGES)</div>
                    <div className="text-xl font-black text-slate-950 mt-0.5">
                      {result.frequencyAnalysis.energyDistribution.midFrequencyPct}%
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Boundaries & transitions</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase font-bold">HIGH FREQ (TEXTURE)</div>
                    <div className="text-xl font-black text-emerald-700 mt-0.5">
                      {result.frequencyAnalysis.energyDistribution.highFrequencyPct}%
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5 font-medium">Micro-grain & noise</div>
                  </div>
                </div>
              </div>
            )}

            {/* FFT Scientific Explanation */}
            <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1">
              <div className="font-bold text-blue-950 font-mono flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-600" />
                <span>About this Frequency Spectrum</span>
              </div>
              <p className="leading-relaxed font-sans font-medium text-xs">
                Generated via 2D Discrete Fourier Transform. The center represents baseline DC luminance, while radial dispersion measures edge harmonics and sensor noise. Frequency distribution serves as an exploratory metric and does not independently prove manipulation.
              </p>
            </div>

          </div>

          {/* Provenance Clues & Content Credentials Panel */}
          {result.provenance && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-4 font-mono shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-black text-slate-950 uppercase">
                    Container Provenance & C2PA Credentials
                  </span>
                </div>
                <span className={`text-xs px-3 py-1 rounded-md uppercase font-bold border ${
                  result.provenance.aiSourceDeclared
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {result.provenance.aiSourceDeclared ? 'AI Source Declared' : 'No Declarations'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">IPTC SOURCE TYPE</span>
                  <span className={`font-black text-xs block truncate ${result.provenance.declaredSourceType ? 'text-amber-800' : 'text-slate-700'}`}>
                    {result.provenance.declaredSourceType || 'None declared'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">TOOL MARKERS</span>
                  <span className="font-black text-xs text-slate-950 block truncate" title={result.provenance.toolStrings.join(', ')}>
                    {result.provenance.toolStrings.length > 0 ? result.provenance.toolStrings.join(', ') : 'None detected'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">C2PA CREDENTIALS</span>
                  <span className={`font-black text-xs block ${result.provenance.c2paPresent ? 'text-blue-700' : 'text-slate-500'}`}>
                    {result.provenance.c2paPresent 
                      ? (result.provenance.c2paVerified ? 'Manifest Verified' : 'Marker Present') 
                      : 'Not Present'}
                  </span>
                </div>
              </div>

              {result.provenance.notes.length > 0 && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-1.5 font-medium">
                  <span className="text-blue-950 text-xs block font-bold">Provenance Observations:</span>
                  <ul className="list-disc list-inside space-y-1">
                    {result.provenance.notes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Metadata Inspection & Forensic Signals */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Metadata Breakdown Panel */}
          {result.metadataAnalysis && (
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-4 font-mono shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span>Metadata Inspection</span>
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {result.metadataAnalysis.format} // {result.metadataAnalysis.colorMode}
                </span>
              </div>

              {/* Total Pixels */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 text-xs uppercase font-bold">TOTAL PIXEL COUNT</span>
                <span className="font-black text-slate-950 text-sm">
                  {(result.metadataAnalysis.dimensions.totalPixels ?? (result.metadataAnalysis.dimensions.width * result.metadataAnalysis.dimensions.height)).toLocaleString()} px
                </span>
              </div>

              {/* EXIF Fields Table */}
              <div className="pt-1">
                <div className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex justify-between">
                  <span>Embedded EXIF Tags</span>
                  <span className="text-blue-700 font-extrabold">{Object.keys(result.metadataAnalysis.exifData || {}).length} tags</span>
                </div>

                {Object.keys(result.metadataAnalysis.exifData || {}).length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200 text-xs max-h-48 overflow-y-auto">
                    {Object.entries(result.metadataAnalysis.exifData || {}).map(([key, val]) => (
                      <div key={key} className="p-2.5 bg-slate-50 flex items-center justify-between">
                        <span className="text-slate-600 text-xs font-semibold">{key}:</span>
                        <span className="text-slate-950 text-xs font-bold truncate max-w-[180px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
                    No EXIF camera headers were detected in this image container.
                  </div>
                )}
              </div>

              {/* Missing Provenance Indicators */}
              {(result.metadataAnalysis.missingMetadata || []).length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-300 text-xs text-amber-900 space-y-1">
                  <div className="font-bold text-xs uppercase">
                    Missing Provenance Indicators:
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-slate-800 font-medium">
                    {(result.metadataAnalysis.missingMetadata || []).map((missing, idx) => (
                      <li key={idx}>{missing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Forensic Heuristic Signals Checklist */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 space-y-4 font-mono shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span>Forensic Signals</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {result.evidence.length} Heuristics Evaluated
              </span>
            </div>

            <div className="space-y-2.5">
              {result.evidence.map((item) => {
                const isSelected = selectedEvidence?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvidence(item)}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-sm'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="text-xs font-black text-slate-950">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-extrabold shrink-0 border ${
                        item.severity === 'high'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : item.severity === 'medium'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : item.severity === 'clean'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                      {item.summary}
                    </p>

                    {isSelected && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200 text-xs text-slate-900 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-black text-blue-700 text-xs">Technical Context:</div>
                        <p className="leading-relaxed text-slate-700 font-sans font-normal">{item.details}</p>
                        {item.visualCue && (
                          <div className="text-xs text-slate-500 italic">
                            Marker: {item.visualCue}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Forensic Limitations */}
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/60 p-6 space-y-3 font-mono shadow-sm">
            <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>Forensic Limitations</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-800 font-medium">
              {result.limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0 mt-1.5"></span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* Bottom Actions Bar */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <div className="text-slate-500 font-semibold">
          SHA-256 HASH: <span className="text-slate-900 font-bold">{result.sha256Hash}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-blue-400 text-slate-900 font-bold transition-colors cursor-pointer shadow-2xs font-mono"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>View Full Examination Report</span>
          </button>
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm active:scale-95 transition-all shadow-md cursor-pointer font-sans"
          >
            <span>Analyze Another Image</span>
          </button>
        </div>
      </div>

    </div>
  );
};
