import type { FC } from 'react';
import { 
  Scan, 
  ArrowRight, 
  Cpu, 
  UploadCloud, 
  FileSearch, 
  Layers, 
  Activity, 
  ShieldAlert, 
  Server, 
  CheckCircle2,
  Binary
} from 'lucide-react';
import { FingerprintSvg } from '../components/FingerprintSvg';

interface HowItWorksPageProps {
  onNavigate: (route: string) => void;
}

export const HowItWorksPage: FC<HowItWorksPageProps> = ({ onNavigate }) => {
  const steps = [
    {
      num: '01',
      evidenceTag: 'EVIDENCE 01',
      title: 'Image Ingestion & RAM Staging',
      actor: 'Client-Side',
      icon: UploadCloud,
      description:
        'Upload JPG, PNG, or WEBP images (up to 15MB). The media is staged directly in browser memory with client-side privacy preservation and zero persistent server disk storage.',
      highlights: ['Client RAM Staging', 'MIME Validation', 'Zero Disk Storage']
    },
    {
      num: '02',
      evidenceTag: 'EVIDENCE 02',
      title: 'Preprocessing & Provenance Audit',
      actor: 'FastAPI Backend',
      icon: Server,
      description:
        'The image is standardized to 3-channel RGB while Pillow decodes container EXIF, IPTC tags, camera technical parameters, and C2PA content credentials.',
      highlights: ['RGB Standardization', 'EXIF & IPTC Extraction', 'C2PA Audit']
    },
    {
      num: '03',
      evidenceTag: 'EVIDENCE 03',
      title: 'Neural ViT & 2D-FFT Multi-Spectral Scanning',
      actor: 'Smaug ViT + NumPy',
      icon: Cpu,
      description:
        'The 439M parameter fine-tuned Vision Transformer inspects generative patch artifacts while NumPy computes a 2D Fast Fourier Transform log-magnitude spectrum.',
      highlights: ['439M Parameter ViT', '2D-FFT Fourier Spectra', 'Patch Artifacts']
    },
    {
      num: '04',
      evidenceTag: 'EVIDENCE 04',
      title: 'Calibrated Probability & Decision Logic',
      actor: 'Decision Head',
      icon: Binary,
      description:
        'Softmax class distributions determine REAL vs FAKE classification using a 0.50 cutoff and a ±0.10 uncertainty band to prevent uncalibrated false positives.',
      highlights: ['Softmax Calibration', '0.50 Decision Cutoff', '±10% Uncertainty Buffer']
    },
    {
      num: '05',
      evidenceTag: 'EVIDENCE 05',
      title: 'Forensic Report & Audit Export',
      actor: 'Forensic UI',
      icon: FileSearch,
      description:
        'Review the final verdict, confidence metrics, radial Fourier energy rings, container metadata table, and export a signed PDF or JSON audit dossier.',
      highlights: ['REAL / FAKE Verdict', 'Frequency Energy Rings', 'PDF / JSON Export']
    }
  ];

  return (
    <div className="py-8 md:py-12 bg-transparent relative overflow-hidden">
      
      {/* Background Fingerprint Watermarks */}
      <div className="absolute top-20 right-10 pointer-events-none hidden lg:block opacity-10">
        <FingerprintSvg className="w-96 h-96" opacity={0.02} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        
        {/* Page Header — Brief, punchy and elegant */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>HOW IT WORKS // 5-STAGE PIPELINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight font-sans">
            Inside the Detection Process.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            TruthLens couples fine-tuned Vision Transformer inference with mathematical 2D-FFT Fourier frequency decomposition and container provenance verification.
          </p>
        </div>

        {/* Technical Process Flow Diagram with Investigation Labels */}
        <div className="rounded-xl bg-white border border-slate-200 p-5 sm:p-6 shadow-xs relative">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 mb-4 gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">
                PIPELINE ARCHITECTURE
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500 font-medium">
              5-PHASE VERIFICATION FLOW
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">01. INGEST</span>
              <div className="font-bold text-slate-950 text-xs mt-1">Media Input</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">RAM staging & MIME check</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">02. PROCESS</span>
              <div className="font-bold text-slate-950 text-xs mt-1">Pre-Processing</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">RGB normalization & EXIF</p>
            </div>
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200">
              <span className="text-[10px] text-blue-800 font-bold block uppercase">03. INFERENCE</span>
              <div className="font-bold text-slate-950 text-xs mt-1">Smaug ViT + FFT</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">439M ViT + Fourier spectra</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">04. CLASSIFY</span>
              <div className="font-bold text-slate-950 text-xs mt-1">Decision Logic</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">0.50 cutoff ±10% buffer</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-blue-700 font-bold block uppercase">05. REPORT</span>
              <div className="font-bold text-slate-950 text-xs mt-1">Forensic Report</div>
              <p className="text-[11px] text-slate-600 mt-1 leading-snug">Verdict, metrics & export</p>
            </div>
          </div>
        </div>

        {/* Detailed 5-Step Forensic Investigation Timeline — Brief, Punchy & Clean Cards */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 font-sans">
                Forensic Investigation Timeline
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-mono">
                Discrete evidence checkpoints along the verification pipeline.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              CASE DOSSIER: MULTI-SPECTRAL ENGINE
            </span>
          </div>

          <div className="space-y-3.5 relative">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-400 hover:shadow-sm transition-all shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {s.num}
                        </span>
                        <h3 className="text-base font-bold text-slate-950 font-sans">
                          {s.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center font-mono text-xs">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {s.evidenceTag}
                      </span>
                      <span className="text-slate-500 font-medium text-xs">
                        • {s.actor}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed my-2.5 font-normal">
                    {s.description}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs font-mono">
                    {s.highlights.map((item, hIdx) => (
                      <span key={hIdx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Neural Classifier Specifications Card */}
        <div className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-8 shadow-sm space-y-5 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-2">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-black text-slate-950 uppercase tracking-wider">
                FINE-TUNED SMAUG MODEL SPECIFICATIONS
              </span>
            </div>
            <span className="text-xs text-blue-800 bg-blue-100 px-3 py-1 rounded-md border border-blue-300 font-extrabold">
              abacusai/Smaug-AI-Image-Detector
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block font-bold">ARCHITECTURE</span>
              <span className="font-black text-slate-950 block mt-1 text-base sm:text-lg">Vision Transformer (ViT)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block font-bold">PARAMETERS</span>
              <span className="font-black text-slate-950 block mt-1 text-base sm:text-lg">439 Million Weights</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block font-bold">DECISION THRESHOLD</span>
              <span className="font-black text-slate-950 block mt-1 text-base sm:text-lg">0.50 (50%)</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 text-xs block font-bold">UNCERTAINTY BAND</span>
              <span className="font-black text-amber-700 block mt-1 text-base sm:text-lg">±0.10 (40%–60%)</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans font-medium">
            <strong className="text-blue-950 font-mono font-bold">Fine-Tuned Detection Objectives:</strong> Smaug-AI evaluates global semantic coherence and microscopic edge/pixel artifacts characteristic of diffusion engines (Midjourney, DALL-E 3, Stable Diffusion, Flux) and GAN face-swap frameworks.
          </div>
        </div>

        {/* Important Boundary: Model Prediction vs Ground Truth Certainty */}
        <div className="p-5 sm:p-6 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
            <span className="uppercase tracking-wider">
              CRITICAL DISTINCTION: STATISTICAL INFERENCE VS GROUND-TRUTH PROOF
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            Machine learning predictions are statistical approximations based on training distributions. A high AI score indicates visual artifacts characteristic of synthetic generation, not infallible legal proof. Heavily compressed, downscaled, or filtered authentic photos may produce noise anomalies; findings should always be corroborated with primary provenance.
          </p>
        </div>

        {/* CTA Bar — Blue box button with white text */}
        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('/analyze')}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-sm cursor-pointer font-sans"
          >
            <Scan className="w-4 h-4 text-white" />
            <span>Launch Image Analysis</span>
            <ArrowRight className="w-4 h-4 ml-0.5 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
