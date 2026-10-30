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
  Sparkles, 
  Download,
  Info,
  Cpu,
  ShieldCheck
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


  const getStatusBadge = () => {
    const activeModelName = result.aiClassification?.modelName?.toUpperCase() || 'AI FORENSIC CLASSIFIER';

    if (result.aiClassification && result.aiClassification.status === 'success') {
      const pred = result.aiClassification.predictedClass;
      if (pred === 'FAKE') {
        return {
          label: 'LIKELY FULLY AI-GENERATED',
          badgeText: activeModelName,
          icon: AlertTriangle,
          textColor: 'text-red-300',
          bgColor: 'bg-red-950/70',
          borderColor: 'border-red-500/50',
          glowColor: 'shadow-red-500/20'
        };
      }
      if (pred === 'INCONCLUSIVE') {
        const fakeProb = result.aiClassification.scores?.FAKE !== undefined
          ? (result.aiClassification.scores.FAKE * 100).toFixed(1)
          : (result.confidenceScore != null ? result.confidenceScore.toFixed(1) : '50.0');
        return {
          label: 'INCONCLUSIVE',
          badgeText: `INCONCLUSIVE (AI probability: ${fakeProb}%)`,
          icon: HelpCircle,
          textColor: 'text-amber-300',
          bgColor: 'bg-amber-950/70',
          borderColor: 'border-amber-500/50',
          glowColor: 'shadow-amber-500/20'
        };
      }
      return {
        label: 'NO SIGNS OF FULL AI GENERATION',
        badgeText: activeModelName,
        icon: CheckCircle2,
        textColor: 'text-emerald-300',
        bgColor: 'bg-emerald-950/70',
        borderColor: 'border-emerald-500/50',
        glowColor: 'shadow-emerald-500/20'
      };
    }

    if (result.aiClassification && result.aiClassification.status !== 'success') {
      return {
        label: 'AI MODEL UNAVAILABLE — SIGNAL FORENSICS ONLY',
        badgeText: 'GENUINE SIGNAL PROCESSING',
        icon: HelpCircle,
        textColor: 'text-amber-300',
        bgColor: 'bg-amber-950/70',
        borderColor: 'border-amber-500/50',
        glowColor: 'shadow-amber-500/20'
      };
    }

    if (result.resultCategory === 'potentially_manipulated') {
      return {
        label: 'LIKELY FULLY AI-GENERATED',
        badgeText: activeModelName,
        icon: AlertTriangle,
        textColor: 'text-red-300',
        bgColor: 'bg-red-950/70',
        borderColor: 'border-red-500/50',
        glowColor: 'shadow-red-500/20'
      };
    }

    if (result.resultCategory === 'no_strong_signs') {
      return {
        label: 'NO SIGNS OF FULL AI GENERATION',
        badgeText: activeModelName,
        icon: CheckCircle2,
        textColor: 'text-emerald-300',
        bgColor: 'bg-emerald-950/70',
        borderColor: 'border-emerald-500/50',
        glowColor: 'shadow-emerald-500/20'
      };
    }

    if (result.resultCategory === 'inconclusive') {
      const fakeProb = result.aiClassification?.scores?.FAKE !== undefined
        ? (result.aiClassification.scores.FAKE * 100).toFixed(1)
        : (result.confidenceScore != null ? result.confidenceScore.toFixed(1) : '50.0');
      return {
        label: 'INCONCLUSIVE',
        badgeText: `INCONCLUSIVE (AI probability: ${fakeProb}%)`,
        icon: HelpCircle,
        textColor: 'text-amber-300',
        bgColor: 'bg-amber-950/70',
        borderColor: 'border-amber-500/50',
        glowColor: 'shadow-amber-500/20'
      };
    }

    return {
      label: 'IMAGE FORENSICS — SIGNAL PROCESSING ACTIVE',
      badgeText: 'GENUINE SIGNAL PROCESSING',
      icon: Activity,
      textColor: 'text-cyan-300',
      bgColor: 'bg-cyan-950/40',
      borderColor: 'border-cyan-500/50',
      glowColor: 'shadow-cyan-500/10'
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload Studio</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/40 transition-all cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Generate Audit Report (PDF/Print)</span>
          </button>

          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 transition-all cursor-pointer shadow-md shadow-cyan-500/10"
          >
            <span>Analyze Another File</span>
          </button>
        </div>
      </div>

      {/* AI Provenance Clue Alert Banner */}
      {result.provenance?.aiSourceDeclared && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg shadow-amber-950/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold font-mono uppercase text-amber-300 text-xs tracking-wider">
              AI Metadata Provenance Marker Detected
            </div>
            <p className="leading-relaxed">
              This file's metadata says it was created or edited with AI (
              <strong className="text-white">
                {result.provenance.declaredSourceType || result.provenance.toolStrings.join(', ') || 'Metadata Marker'}
              </strong>
              ). The classifier verdict below only measures full AI generation.
            </p>
          </div>
        </div>
      )}

      {/* Main Verdict Card */}
      <div className={`p-6 sm:p-8 rounded-2xl ${status.bgColor} border ${status.borderColor} relative overflow-hidden shadow-2xl ${status.glowColor}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${status.textColor} bg-black/40 border border-current`}>
                <StatusIcon className="w-4 h-4" />
                {status.badgeText}
              </span>
              <span className="text-xs font-mono text-slate-400 bg-black/30 px-2.5 py-1 rounded border border-slate-700">
                REF: {result.id}
              </span>
              <span className="text-xs font-mono px-2 py-1 rounded border flex items-center gap-1 text-cyan-300 bg-cyan-950/60 border-cyan-800/40">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {result.aiClassification?.status === 'success' 
                  ? `${result.aiClassification.modelName} & 2D-FFT` 
                  : 'Real 2D-FFT & Metadata'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {status.label}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {result.aiClassification && result.aiClassification.status === 'success' ? (
                result.aiClassification.predictedClass === 'INCONCLUSIVE' ? (
                  <span>
                    The model cannot reliably distinguish this image from non-AI photography. Additional manual verification is required. Evaluated by <strong>{result.aiClassification.modelName}</strong> ({result.aiClassification.modelId}) on CPU alongside 2D-FFT frequency analysis.
                  </span>
                ) : (
                  <span>
                    The image was processed through the pretrained <strong>{result.aiClassification.modelName}</strong> ({result.aiClassification.modelId}) on CPU, alongside mathematical <strong>2D Fast Fourier Transform (FFT) log-magnitude spectrum</strong> and EXIF provenance extraction.
                  </span>
                )
              ) : (
                <span>
                  The image was processed through Python/NumPy to calculate its actual <strong>2D Fast Fourier Transform (FFT) log-magnitude spectrum</strong> and extract embedded EXIF headers. The neural classifier is currently unavailable ({result.aiClassification?.errorMessage || 'not initialized'}).
                </span>
              )}
            </p>
          </div>

          {/* Confidence Score Pill */}
          <div className="shrink-0 p-5 rounded-2xl bg-black/50 border border-slate-800 min-w-[220px] text-center">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              AI Model Classification
            </div>
            {result.aiClassification && result.aiClassification.status === 'success' ? (
              <div>
                <div className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight flex items-center justify-center gap-1.5">
                  <span className={
                    result.aiClassification.predictedClass === 'FAKE'
                      ? 'text-red-400'
                      : result.aiClassification.predictedClass === 'INCONCLUSIVE'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }>
                    {result.aiClassification.predictedClass === 'FAKE'
                      ? 'Likely fully AI-generated'
                      : result.aiClassification.predictedClass === 'REAL'
                      ? 'No signs of full AI generation'
                      : 'Inconclusive'}
                  </span>
                  <span className="text-base text-slate-300 font-mono">
                    ({result.aiClassification.confidenceScore?.toFixed(1)}%)
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[210px] mx-auto leading-tight font-mono">
                  AI: {(result.aiClassification.scores?.FAKE ? result.aiClassification.scores.FAKE * 100 : 0).toFixed(1)}% | Non-AI: {(result.aiClassification.scores?.REAL ? result.aiClassification.scores.REAL * 100 : 0).toFixed(1)}%
                </div>
              </div>
            ) : (result.confidenceScore != null) ? (
              <div>
                <div className="text-3xl font-extrabold text-white font-heading tracking-tight">
                  {result.confidenceScore.toFixed(1)}%
                </div>
                <div className="text-[10px] text-slate-400 mt-1 max-w-[170px] mx-auto leading-tight">
                  Forensic Signal Activation
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xl font-bold text-amber-400 font-heading">
                  WITHHELD
                </div>
                <div className="text-[10px] text-amber-300/80 mt-1 max-w-[170px] mx-auto leading-tight">
                  {result.aiClassification?.errorMessage ? 'AI classifier offline.' : 'Model not connected.'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Scope Notice */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            This tool estimates whether an image is fully AI-generated. It cannot tell whether a real photo was edited, retouched, upscaled or AI-enhanced. Absence of detection is not proof the image is untouched.
          </p>
        </div>
      </div>

      {/* Pretrained Neural AI Model Card */}
      {result.aiClassification && (
        <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Pretrained Neural Classifier (CPU)
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  {result.aiClassification.modelName}
                </h3>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-black/50 text-cyan-300 border border-slate-700">
                {result.aiClassification.modelId}
              </span>
              <span className={`text-[11px] font-mono px-2.5 py-1 rounded font-semibold uppercase ${
                result.aiClassification.status === 'success'
                  ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
              }`}>
                STATUS: {result.aiClassification.status}
              </span>
            </div>
          </div>

          {result.aiClassification.status === 'success' ? (
            <div className="space-y-5">
              {/* Score bar & breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-5 space-y-2">
                  <div className="text-xs text-slate-400 font-mono">Predicted Classification:</div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xl sm:text-2xl font-extrabold font-mono px-3 py-1 rounded-xl border ${
                      result.aiClassification.predictedClass === 'FAKE'
                        ? 'text-red-300 bg-red-950/60 border-red-500/40'
                        : result.aiClassification.predictedClass === 'INCONCLUSIVE'
                        ? 'text-amber-300 bg-amber-950/60 border-amber-500/40'
                        : 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40'
                    }`}>
                      {result.aiClassification.predictedClass === 'FAKE'
                        ? 'Likely fully AI-generated'
                        : result.aiClassification.predictedClass === 'REAL'
                        ? 'No signs of full AI generation'
                        : 'Inconclusive'}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {result.aiClassification.predictedLabelDescription || ''}
                    </span>
                  </div>
                  {result.aiClassification.inferenceTimeMs !== null && (
                    <div className="text-[11px] font-mono text-slate-400">
                      Inference latency: <span className="text-cyan-400">{result.aiClassification.inferenceTimeMs} ms</span> on CPU
                    </div>
                  )}
                </div>

                <div className="md:col-span-7 space-y-3 bg-black/40 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-red-400 font-semibold">
                      Likely AI-Generated: {result.aiClassification.scores?.FAKE !== undefined ? (result.aiClassification.scores.FAKE * 100).toFixed(2) : 0}%
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      No signs of AI: {result.aiClassification.scores?.REAL !== undefined ? (result.aiClassification.scores.REAL * 100).toFixed(2) : 0}%
                    </span>
                  </div>

                  {/* Dual Progress Bar */}
                  <div className="w-full h-3 rounded-full overflow-hidden bg-slate-800 flex">
                    <div
                      className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-500"
                      style={{ width: `${(result.aiClassification.scores?.FAKE || 0) * 100}%` }}
                      title={`Fake Score: ${((result.aiClassification.scores?.FAKE || 0) * 100).toFixed(2)}%`}
                    />
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
                      style={{ width: `${(result.aiClassification.scores?.REAL || 0) * 100}%` }}
                      title={`Real Score: ${((result.aiClassification.scores?.REAL || 0) * 100).toFixed(2)}%`}
                    />
                  </div>

                  {/* Decision Cutoff & Uncertain Band */}
                  <div className="text-[11px] font-mono text-slate-400 flex flex-wrap justify-between pt-1 border-t border-slate-800/80 gap-2">
                    <span>
                      Decision Cutoff: <strong className="text-slate-200">{((result.aiClassification.decisionThreshold ?? 0.50) * 100).toFixed(0)}%</strong>
                    </span>
                    <span>
                      Inconclusive Band: <strong className="text-amber-400">±{((result.aiClassification.uncertainBand ?? 0.10) * 100).toFixed(0)}%</strong> ({(((result.aiClassification.decisionThreshold ?? 0.50) - (result.aiClassification.uncertainBand ?? 0.10)) * 100).toFixed(0)}%–{(((result.aiClassification.decisionThreshold ?? 0.50) + (result.aiClassification.uncertainBand ?? 0.10)) * 100).toFixed(0)}%)
                    </span>
                  </div>

                  {/* Raw Logits */}
                  {result.aiClassification.rawLogits && (
                    <div className="text-[10px] font-mono text-slate-500 flex justify-between pt-0.5">
                      <span>Raw Model Logit (Fake): {result.aiClassification.rawLogits.FAKE}</span>
                      <span>Raw Model Logit (Real): {result.aiClassification.rawLogits.REAL}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Explanations, Calibration notice & Scope */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="font-semibold text-amber-300 font-mono text-[11px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Uncalibrated Probability Notice</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {result.aiClassification.calibrationStatement}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1.5">
                  <div className="font-semibold text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>Full AI vs Editing Scope</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {result.aiClassification.scopeLimitation}
                  </p>
                </div>
              </div>

              {/* Fixed Scope Notice */}
              <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  This tool estimates whether an image is fully AI-generated. It cannot tell whether a real photo was edited, retouched, upscaled or AI-enhanced. Absence of detection is not proof the image is untouched.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-300 text-xs space-y-3">
              <div className="font-bold font-mono text-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>AI Inference Engine Offline / Unavailable</span>
                </div>
                <button
                  onClick={onNewAnalysis}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Retry Analysis
                </button>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {result.aiClassification.errorMessage || 'Could not load model weights or neural backend is initializing.'}
              </p>
              <div className="text-[11px] text-amber-400/90 font-mono">
                TruthLens maintains integrity: no synthetic or mock scores were fabricated. Deterministic 2D-FFT and metadata inspection remain active below.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Provenance Clues Panel */}
      {result.provenance && (
        <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                result.provenance.aiSourceDeclared
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Provenance Clues & Content Credentials
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white font-heading">
                  Metadata & Container Verification
                </h3>
              </div>
            </div>

            <span className={`text-[11px] font-mono px-2.5 py-1 rounded font-semibold uppercase ${
              result.provenance.aiSourceDeclared
                ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {result.provenance.aiSourceDeclared ? 'AI Source Declared' : 'No AI Source Declared'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase block">IPTC Source Type</span>
              <span className={`font-semibold block ${result.provenance.declaredSourceType ? 'text-amber-300' : 'text-slate-300'}`}>
                {result.provenance.declaredSourceType || 'None declared'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase block">Tool Markers</span>
              <span className="font-semibold text-slate-200 block truncate" title={result.provenance.toolStrings.join(', ')}>
                {result.provenance.toolStrings.length > 0 ? result.provenance.toolStrings.join(', ') : 'None detected'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase block">Content Credentials (C2PA)</span>
              <span className={`font-semibold block ${result.provenance.c2paPresent ? 'text-cyan-300' : 'text-slate-400'}`}>
                {result.provenance.c2paPresent 
                  ? (result.provenance.c2paVerified ? 'C2PA Manifest Verified' : 'C2PA Marker Present (Unverified)') 
                  : 'No C2PA manifest found'}
              </span>
            </div>
          </div>

          {result.provenance.notes.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 space-y-1 text-xs">
              <span className="text-slate-400 font-mono text-[11px] block font-semibold">Provenance Observations:</span>
              <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                {result.provenance.notes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-[10px] text-slate-500 font-mono pt-1">
            * Note: Provenance clues inspect container tags only. They do not alter the classifier score and cannot detect edits from raw pixels.
          </div>
        </div>
      )}

      {/* Grid: Media Inspector & Forensic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Media Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
            
            {/* Visualizer Header with Layer Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                  Forensic Media Inspector
                </span>
              </div>

              {/* Layer switchers */}
              <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveOverlay('standard')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeOverlay === 'standard'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original Image
                </button>
                <button
                  onClick={() => setActiveOverlay('fft')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeOverlay === 'fft'
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Computed 2D-FFT
                </button>
                <button
                  onClick={() => setActiveOverlay('split')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                    activeOverlay === 'split'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Visualizer Display */}
            <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden my-4 flex items-center justify-center border border-slate-800">
              {activeOverlay === 'standard' && (
                <img
                  src={result.mediaUrl}
                  alt={result.fileName}
                  className="w-full h-full object-contain"
                />
              )}

              {activeOverlay === 'fft' && (
                <div className="relative w-full h-full flex items-center justify-center bg-[#070A13]">
                  {result.frequencyAnalysis ? (
                    <img
                      src={result.frequencyAnalysis.fftVisualizationBase64}
                      alt="Actual Computed 2D-FFT Magnitude Spectrum"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-xs text-slate-500 font-mono">
                      FFT visualization not available for this record.
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                    REAL 2D-FFT MAGNITUDE SPECTRUM (NumPy)
                  </div>
                </div>
              )}

              {activeOverlay === 'split' && (
                <div className="grid grid-cols-2 w-full h-full divide-x divide-slate-800">
                  <div className="relative h-full flex items-center justify-center bg-black p-2">
                    <img
                      src={result.mediaUrl}
                      alt={result.fileName}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-slate-300">
                      Spatial Domain
                    </div>
                  </div>
                  <div className="relative h-full flex items-center justify-center bg-[#070A13] p-2">
                    {result.frequencyAnalysis && (
                      <img
                        src={result.frequencyAnalysis.fftVisualizationBase64}
                        alt="2D-FFT Spectrum"
                        className="w-full h-full object-contain"
                      />
                    )}
                    <div className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-cyan-300">
                      Frequency Domain (FFT)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Scientific Explanation of the FFT */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="font-semibold text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>About this Frequency Spectrum</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                The image above was generated by taking the 2D Discrete Fourier Transform of your image's pixel matrix. The bright central star represents the zero-frequency DC component (average illumination), while the radiating spokes show periodic frequency harmonics across angles.
              </p>
              <div className="text-[10px] font-mono text-amber-300/80 bg-amber-950/20 p-2 rounded border border-amber-900/30">
                Note: Frequency distribution is an exploratory forensic metric. It does NOT alone determine whether an image is AI-generated.
              </div>
            </div>

            {/* Radial Energy Distribution */}
            {result.frequencyAnalysis && (
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="text-xs font-mono font-bold uppercase text-white mb-3 flex items-center justify-between">
                  <span>Radial Spectral Energy Bands</span>
                  <span className="text-[11px] text-slate-400 font-normal">Calculated across 512×512 radius</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Low Frequency (Core)</div>
                    <div className="text-xl font-bold text-cyan-300 font-heading mt-1">
                      {result.frequencyAnalysis.energyDistribution.lowFrequencyPct}%
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Broad shapes & contrast</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Mid Frequency</div>
                    <div className="text-xl font-bold text-violet-300 font-heading mt-1">
                      {result.frequencyAnalysis.energyDistribution.midFrequencyPct}%
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Edges & boundaries</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">High Frequency (Outer)</div>
                    <div className="text-xl font-bold text-emerald-300 font-heading mt-1">
                      {result.frequencyAnalysis.energyDistribution.highFrequencyPct}%
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">Micro-texture & noise</div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Evidence & Metadata Panels (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Metadata Breakdown Panel */}
          {result.metadataAnalysis && (
            <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Image Metadata Inspection</span>
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {result.metadataAnalysis.format}
                </span>
              </div>

              {/* Dimensions grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Resolution</span>
                  <span className="font-bold text-white font-mono">
                    {result.metadataAnalysis.dimensions.width} × {result.metadataAnalysis.dimensions.height}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Aspect Ratio</span>
                  <span className="font-bold text-white font-mono">
                    {result.metadataAnalysis.dimensions.aspectRatio || (result.metadataAnalysis.dimensions as any).aspect_ratio || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Color Mode</span>
                  <span className="font-bold text-white font-mono">
                    {result.metadataAnalysis.colorMode}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono uppercase">Total Pixels</span>
                  <span className="font-bold text-white font-mono">
                    {(result.metadataAnalysis.dimensions.totalPixels ?? (result.metadataAnalysis.dimensions as any).total_pixels ?? (result.metadataAnalysis.dimensions.width * result.metadataAnalysis.dimensions.height))?.toLocaleString() ?? 'N/A'}
                  </span>
                </div>
              </div>

              {/* EXIF Fields Table */}
              <div className="pt-2">
                <div className="text-xs font-mono font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  Available EXIF Fields ({Object.keys(result.metadataAnalysis.exifData || {}).length})
                </div>

                {Object.keys(result.metadataAnalysis.exifData || {}).length > 0 ? (
                  <div className="border border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-800 text-xs">
                    {Object.entries(result.metadataAnalysis.exifData || {}).map(([key, val]) => (
                      <div key={key} className="p-2 bg-slate-950/40 flex items-center justify-between font-mono">
                        <span className="text-slate-400">{key}:</span>
                        <span className="text-white truncate max-w-[180px]">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                    No EXIF headers were found in this file container.
                  </div>
                )}
              </div>

              {/* Missing Metadata Notice */}
              {(result.metadataAnalysis.missingMetadata || []).length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300/90 space-y-1.5">
                  <div className="font-semibold text-amber-300 font-mono text-[11px]">
                    Missing Provenance Indicators:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                    {(result.metadataAnalysis.missingMetadata || []).map((missing, idx) => (
                      <li key={idx}>{missing}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Evidence Checklist */}
          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Forensic Signals</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {result.evidence.length} Heuristics
              </span>
            </div>

            <div className="space-y-3">
              {result.evidence.map((item) => {
                const isSelected = selectedEvidence?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEvidence(item)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-white">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                        item.severity === 'high'
                          ? 'bg-red-950/80 text-red-300 border border-red-500/40'
                          : item.severity === 'medium'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          : item.severity === 'clean'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {item.severity}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      {item.summary}
                    </p>

                    {isSelected && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-300 bg-black/30 p-2.5 rounded-lg space-y-1.5">
                        <div className="font-semibold text-cyan-300">Technical Context:</div>
                        <p className="leading-relaxed">{item.details}</p>
                        {item.visualCue && (
                          <div className="text-[10px] text-slate-400 italic">
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

          {/* Critical Limitations */}
          <div className="glass-card rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-3 flex items-center gap-2 text-amber-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Forensic Limitations</span>
            </h3>
            <ul className="space-y-2">
              {result.limitations.map((lim, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-400 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5"></span>
                  <span>{lim}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
