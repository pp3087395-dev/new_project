import { useState } from 'react';
import type { FC } from 'react';
import { 
  Scan, 
  ArrowRight, 
  HelpCircle, 
  Cpu, 
  UploadCloud, 
  FileSearch, 
  Lock,
  Activity,
  Layers,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { FingerprintSvg } from '../components/FingerprintSvg';

interface HomePageProps {
  onNavigate: (route: string) => void;
  onSelectSample?: (sampleId: string) => void;
}

export const HomePage: FC<HomePageProps> = ({ onNavigate, onSelectSample: _onSelectSample }) => {
  const [activeHeroLayer, setActiveHeroLayer] = useState<'standard' | 'frequency' | 'gradient'>('standard');

  return (
    <div className="flex flex-col">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. CODER ARMY / MEDISCAN-INSPIRED BALANCED SPLIT HERO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-6 pb-8 md:pt-10 md:pb-12 overflow-hidden border-b border-slate-200 bg-gradient-to-b from-white via-slate-50 to-slate-100/60">
        
        {/* Subtle Background Fingerprint Watermark */}
        <div className="absolute top-1/2 -left-20 -translate-y-1/2 pointer-events-none hidden lg:block">
          <FingerprintSvg className="w-96 h-96" opacity={0.04} />
        </div>
        <div className="absolute top-1/3 right-10 pointer-events-none hidden lg:block">
          <FingerprintSvg className="w-80 h-80" opacity={0.04} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT SIDE — 55% WIDTH (7 cols of 12) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* High-Contrast Eyebrow & Investigation Case Label */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-100 text-blue-900 border border-blue-300 font-extrabold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="uppercase tracking-wider">
                    DIGITAL FORENSICS PLATFORM
                  </span>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-md bg-white text-slate-800 border border-slate-300 font-bold shadow-2xs hidden sm:inline">
                  CASE FILE: TL-001 // SYSTEM: TRUTHLENS
                </span>
              </div>

              {/* Main Headline (High-Contrast Black and Blue text) */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-950 font-sans leading-[1.06]">
                See Beyond the <br className="hidden sm:inline" />
                <span className="text-blue-600">Image.</span>
              </h1>

              {/* Supporting Text — Deep and readable */}
              <p className="text-lg sm:text-xl text-slate-800 font-normal leading-relaxed max-w-xl">
                Not everything you see is real. TruthLens brings AI-powered image detection and digital forensics together to help investigate the authenticity of visual media.
              </p>

              {/* Action Buttons — Solid blue boxes with white text & deep contrast */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <button
                  onClick={() => onNavigate('/analyze')}
                  className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 font-sans"
                >
                  <Scan className="w-5 h-5 text-white" />
                  <span>Analyze an Image →</span>
                </button>

                <button
                  onClick={() => onNavigate('/how-it-works')}
                  className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-700 hover:bg-blue-800 transition-all shadow-md shadow-blue-700/25 cursor-pointer active:scale-95 font-sans"
                >
                  <HelpCircle className="w-5 h-5 text-white" />
                  <span>Explore How It Works</span>
                </button>
              </div>

              {/* Supporting Line Below CTA Buttons — Clean Static High-Contrast Text */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-sm sm:text-base uppercase tracking-wider font-extrabold text-blue-700">
                  Investigate. Analyze. Verify.
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm text-slate-600 font-semibold hidden sm:inline">
                  AI-powered image authenticity analysis.
                </span>
              </div>

              {/* Forensic Architecture Telemetry Strip — 3 Elevated White Stat Cards */}
              <div className="pt-4 border-t border-slate-200/90 grid grid-cols-3 gap-3.5 max-w-xl">
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                  <span className="text-slate-950 block font-black text-base sm:text-lg mb-0.5">Smaug-AI ViT</span>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">439M Parameters</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                  <span className="text-slate-950 block font-black text-base sm:text-lg mb-0.5">2D-FFT Spectra</span>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">Fourier Frequencies</span>
                </div>
                <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
                  <span className="text-slate-950 block font-black text-base sm:text-lg mb-0.5">Zero Retention</span>
                  <span className="text-slate-700 text-xs sm:text-sm font-semibold">In-Memory RAM Only</span>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE — 45% WIDTH (5 cols of 12) */}
            {/* Streamlined, High-End Forensic Inspection Viewer */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[530px] rounded-2xl bg-[#0B101B] border border-slate-800 shadow-2xl shadow-cyan-950/20 overflow-hidden relative">
                
                {/* Viewport Top Header Bar — Spacious & Uncongested */}
                <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0B101B] border-b border-slate-800/90 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse"></span>
                    <span className="text-slate-100 font-bold tracking-wider text-xs">
                      FORENSIC VIEWER
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-medium px-2 py-0.5 rounded border border-cyan-500/40 bg-cyan-950/40">
                      LIVE SCAN
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Activity className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>FPS: 60 <span className="text-slate-600 mx-1">|</span> 512×512 FFT</span>
                  </div>
                </div>

                {/* Main Inspection Viewport — Clean, Orderly & Uncluttered */}
                <div className="relative aspect-[4/3] w-full bg-[#050811] overflow-hidden flex items-center justify-center">
                  
                  {/* Sample Photographic Portrait */}
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80"
                    alt="Forensic Inspection Sample Portrait"
                    className={`w-full h-full object-cover transition-all duration-300 ${
                      activeHeroLayer === 'frequency'
                        ? 'filter invert contrast-200 hue-rotate-180 brightness-75'
                        : activeHeroLayer === 'gradient'
                        ? 'filter contrast-150 grayscale saturate-200'
                        : 'filter contrast-[1.05] brightness-95'
                    }`}
                  />

                  {/* Simulated Frequency Layer Overlays */}
                  {activeHeroLayer === 'frequency' && (
                    <div className="absolute inset-0 bg-cyan-950/30 mix-blend-color-dodge pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border border-cyan-400/50 rounded-full animate-ping opacity-30"></div>
                    </div>
                  )}

                  {/* Simulated Gradient Layer Overlays */}
                  {activeHeroLayer === 'gradient' && (
                    <div className="absolute inset-0 bg-rose-950/25 mix-blend-difference pointer-events-none" />
                  )}

                  {/* Continuous Cyan Scanning Laser Beam */}
                  <div className="animate-forensic-scan-cyan pointer-events-none z-10" />

                  {/* Orderly Top HUD Badges (Discreetly at Corners) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                    <span className="px-2.5 py-1 rounded-md bg-[#0b1322]/85 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                      ROI #01 • FACE DETECTED
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-[#0b1322]/85 border border-amber-500/40 text-amber-300 font-mono text-[10px] sm:text-[11px] font-semibold tracking-wide backdrop-blur-md shadow-md">
                      CONFIDENCE: 84% SYNTHETIC
                    </span>
                  </div>

                  {/* Orderly Bottom Telemetry Pills */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 gap-2">
                    <div className="bg-[#1b0d14]/90 border border-rose-500/60 text-rose-300 text-[10px] sm:text-[11px] font-mono font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>Spectral Checkerboard Detected</span>
                    </div>
                    <div className="bg-[#071b26]/90 border border-cyan-500/60 text-cyan-300 text-[10px] sm:text-[11px] font-mono font-medium px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                      <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Gaze Coherence: 89%</span>
                    </div>
                  </div>

                </div>

                {/* Viewport Control Bar — Clean Layer Selector */}
                <div className="px-4 sm:px-5 py-3 bg-[#0B101B] border-t border-slate-800/90 flex items-center justify-between gap-3 font-mono text-xs">
                  
                  {/* Layer Selectors */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 font-mono">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Layer:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveHeroLayer('standard')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium font-sans transition-colors cursor-pointer ${
                          activeHeroLayer === 'standard'
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        Original
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHeroLayer('frequency')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium font-sans transition-colors cursor-pointer ${
                          activeHeroLayer === 'frequency'
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        2D-FFT Spectra
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHeroLayer('gradient')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium font-sans transition-colors cursor-pointer ${
                          activeHeroLayer === 'gradient'
                            ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/50 shadow-xs'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        Boundary Gradient
                      </button>
                    </div>
                  </div>

                  {/* Clean Status Telemetry (Replacing Cluttered Buttons) */}
                  <div className="hidden sm:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span>REAL-TIME ANALYSIS</span>
                  </div>

                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. HOMEPAGE — BELOW THE HERO: "Trust What You Can Verify" */}
      {/* ------------------------------------------------------------- */}
      <section className="py-12 md:py-16 border-b border-slate-200 bg-white/70 relative">
        
        {/* Fingerprint Ambient Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-15">
          <FingerprintSvg className="w-[500px] h-[500px]" opacity={0.03} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-blue-700 font-extrabold mb-2 block">
              METHODICAL INVESTIGATION
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight font-sans mb-3">
              Trust What You Can Verify.
            </h2>
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              We reject opaque black-box verdicts. TruthLens decomposes visual media into verifiable Fourier frequencies, spatial patch activations, and EXIF container provenance.
            </p>
          </div>

          {/* Three Concise Steps in Elevated High-Contrast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Step 01 */}
            <div className="rounded-2xl p-7 bg-white border-2 border-slate-200 hover:border-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-600/30 font-mono">
                      01
                    </span>
                    <span className="text-xs font-mono uppercase text-blue-800 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-bold">
                      EVIDENCE 01
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2.5 font-sans">
                  Upload
                </h3>
                <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  Submit an image for analysis. Media is ingested in-memory with client-side privacy preservation and zero persistent server disk retention.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-800">
                <span>FORMAT: JPG, PNG, WEBP</span>
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-bold">MAX 15MB</span>
              </div>
            </div>

            {/* Step 02 */}
            <div className="rounded-2xl p-7 bg-white border-2 border-slate-200 hover:border-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-600/30 font-mono">
                      02
                    </span>
                    <span className="text-xs font-mono uppercase text-blue-800 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-bold">
                      EVIDENCE 02
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2.5 font-sans">
                  Analyze
                </h3>
                <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  The fine-tuned AI detection model examines the image alongside mathematical 2D Fast Fourier Transform frequency spectra and EXIF tags.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-800">
                <span>ENGINE: SMAUG-AI ViT</span>
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-bold">2D-FFT NUMPY</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="rounded-2xl p-7 bg-white border-2 border-slate-200 hover:border-blue-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 relative flex flex-col justify-between shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-600/30 font-mono">
                      03
                    </span>
                    <span className="text-xs font-mono uppercase text-blue-800 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 font-bold">
                      EVIDENCE 03
                    </span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-600">
                    <FileSearch className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2.5 font-sans">
                  Inspect
                </h3>
                <p className="text-base text-slate-700 leading-relaxed mb-6 font-normal">
                  Review the prediction, confidence information and available metadata in a structured, exportable digital forensics report.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-slate-800">
                <span>VERDICT: REAL / FAKE</span>
                <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200 font-bold">PDF / JSON EXPORT</span>
              </div>
            </div>

          </div>

          {/* Elevated Final CTA Card */}
          <div className="mt-14 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200 text-center shadow-sm max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3 font-sans">
              Ready to verify digital media authenticity?
            </h3>
            <p className="text-base text-slate-700 mb-7 max-w-xl mx-auto leading-relaxed">
              Submit your first image to initiate multi-spectral Fourier frequency analysis and deep Vision Transformer verification.
            </p>
            <button
              onClick={() => onNavigate('/analyze')}
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-xl text-base sm:text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95 font-sans"
            >
              <Scan className="w-5 h-5 text-white" />
              <span>Start Your Analysis Now</span>
              <ArrowRight className="w-5 h-5 ml-0.5 text-white" />
            </button>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-mono text-slate-700 font-semibold">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Zero Registration Required • In-Memory RAM Processing</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
