import type { FC } from 'react';
import { 
  Scan, 
  HelpCircle, 
  Cpu, 
  Lock, 
  ArrowRight,
  Activity
} from 'lucide-react';
import { LiveScannerDemo } from './LiveScannerDemo';

interface HeroProps {
  onStartAnalysis: () => void;
  onLearnMore: () => void;
  onSelectSample: (sampleId: string) => void;
}

export const Hero: FC<HeroProps> = ({ 
  onStartAnalysis, 
  onLearnMore,
  onSelectSample 
}) => {
  return (
    <section className="relative pt-12 pb-16 md:pt-18 md:pb-24 overflow-hidden forensic-grid border-b border-[#303A33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Intelligence Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono bg-[#1D2420] border border-[#303A33] text-[#A0AAA1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#80B9A5] animate-pulse"></span>
            <span className="text-[#80B9A5] font-semibold">TRUTHLENS OS</span>
            <span className="text-[#707B72]">•</span>
            <span>Digital Media Forensics & Integrity Verification</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#F0F2ED] mb-5 font-sans leading-tight">
            See Beyond the <span className="text-[#80B9A5]">Image.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A0AAA1] font-normal leading-relaxed max-w-2xl mx-auto mb-8">
            Investigate digital authenticity with AI-powered image forensics. Unpack spatial generative artifacts, 2D Fast Fourier Transform frequency spectra, and camera metadata provenance.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-[#101311] bg-[#80B9A5] hover:bg-[#92c7b5] transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Scan className="w-4 h-4" />
              <span>Analyze an Image</span>
              <ArrowRight className="w-4 h-4 ml-0.5 opacity-80" />
            </button>

            <button
              onClick={onLearnMore}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-medium text-[#F0F2ED] bg-[#1D2420] hover:bg-[#242D27] border border-[#303A33] hover:border-[#435248] transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-[#80B9A5]" />
              <span>How It Works</span>
            </button>
          </div>

          {/* Forensic System Capabilities */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#707B72] font-mono">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#70B68A]" />
              <span className="text-[#A0AAA1]">In-Memory Processing Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#80B9A5]" />
              <span className="text-[#A0AAA1]">2D-FFT Fourier Spectra</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#D9AB68]" />
              <span className="text-[#A0AAA1]">Fine-Tuned Smaug ViT</span>
            </div>
          </div>
        </div>

        {/* Interactive Forensic Inspection Viewport */}
        <div className="mt-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto mb-2 px-1 text-[11px] font-mono text-[#707B72]">
            <span className="flex items-center gap-1.5">
              <Scan className="w-3 h-3 text-[#80B9A5]" />
              <span>INTERACTIVE FORENSIC RETICLE VIEWPORT</span>
            </span>
            <span className="hidden sm:inline">RESOLUTION: 1024×1024 // 2D-FFT MATRIX</span>
          </div>

          <LiveScannerDemo onSelectSample={onSelectSample} />
        </div>

        {/* Quick Platform Workflow Explainer */}
        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-[#303A33]">
          <div className="p-4 rounded-md bg-[#171C19] border border-[#303A33]">
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-[#80B9A5]">
              <span className="w-4 h-4 rounded-full bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[10px]">1</span>
              <span>IN-MEMORY INGESTION</span>
            </div>
            <p className="text-xs text-[#A0AAA1] leading-relaxed">
              Images are decoded client-side with privacy preservation. No permanent storage or public database archiving.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#171C19] border border-[#303A33]">
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-[#80B9A5]">
              <span className="w-4 h-4 rounded-full bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[10px]">2</span>
              <span>MULTI-SPECTRAL ANALYSIS</span>
            </div>
            <p className="text-xs text-[#A0AAA1] leading-relaxed">
              Evaluates 2D-FFT frequency spectra for checkerboard periodicities alongside Vision Transformer spatial artifact detection.
            </p>
          </div>

          <div className="p-4 rounded-md bg-[#171C19] border border-[#303A33]">
            <div className="flex items-center gap-2 mb-1.5 font-mono text-xs text-[#80B9A5]">
              <span className="w-4 h-4 rounded-full bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[10px]">3</span>
              <span>AUDITABLE FINDINGS</span>
            </div>
            <p className="text-xs text-[#A0AAA1] leading-relaxed">
              Produces a transparent forensic examination report with calibrated uncertainty states, SHA-256 fingerprint, and EXIF extraction.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
