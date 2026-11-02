import { useState } from 'react';
import type { FC } from 'react';
import { 
  BookOpen, 
  Scan, 
  ArrowRight, 
  Cpu, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  FileText,
  Sliders,
  Scale
} from 'lucide-react';
import { FingerprintSvg } from '../components/FingerprintSvg';

interface EvidenceGuidePageProps {
  onNavigate: (route: string) => void;
}

export const EvidenceGuidePage: FC<EvidenceGuidePageProps> = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'ai-gen' | 'metadata' | 'confidence' | 'classification' | 'limitations'>('all');

  return (
    <div className="py-8 md:py-12 bg-transparent relative overflow-hidden">
      
      {/* Background Fingerprint Watermark */}
      <div className="absolute top-1/4 -right-20 pointer-events-none hidden lg:block opacity-10">
        <FingerprintSvg className="w-[450px] h-[450px]" opacity={0.02} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-100 text-blue-900 border border-blue-300 font-extrabold shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>FORENSIC KNOWLEDGE CENTER // EVIDENCE BOARD</span>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-md bg-white text-slate-800 border border-slate-300 font-bold shadow-2xs">
              CASE DOSSIER: TL-KB-01
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 tracking-tight font-sans">
            Understand the Evidence.
          </h1>
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
            A comprehensive reference for interpreting image authenticity results, Fourier frequency domain spectra, container metadata, and probabilistic model outputs.
          </p>
        </div>

        {/* Section Navigation Tabs with Evidence Numbering */}
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto pb-2 border-b border-slate-200 font-mono text-sm">
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'ai-gen', label: 'EVIDENCE 01: AI Images' },
            { id: 'metadata', label: 'EVIDENCE 02: Metadata' },
            { id: 'confidence', label: 'EVIDENCE 03: Confidence' },
            { id: 'classification', label: 'EVIDENCE 04: Real vs Fake' },
            { id: 'limitations', label: 'EVIDENCE 05: Limitations' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer font-bold ${
                activeSection === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-white text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION A: AI-GENERATED IMAGES */}
        {/* ------------------------------------------------------------- */}
        {(activeSection === 'all' || activeSection === 'ai-gen') && (
          <section className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-9 space-y-6 relative shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-extrabold block">
                    EVIDENCE 01 // SYNTHETIC MEDIA INVESTIGATION
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans mt-0.5">
                    AI-Generated Images & Generative Synthesis
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 font-bold px-3 py-1 rounded-md bg-slate-100 border border-slate-300 hidden sm:inline">
                TOPIC: 2D-FFT SPECTRA
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-base text-slate-700 leading-relaxed font-normal">
              <div className="space-y-3">
                <h3 className="font-black text-slate-950 font-sans text-xl">
                  What Synthetic Images Are
                </h3>
                <p>
                  A real photograph is an analog optical capture: photons reflect off physical objects, pass through glass lenses, and strike a CMOS or CCD silicon sensor, registering physical photon shot noise and natural chromatic optical properties.
                </p>
                <p>
                  In contrast, synthetic or AI-generated images are synthesized computationally from mathematical distributions. Generative systems (Diffusion architectures like Stable Diffusion, Midjourney, and Flux, or Generative Adversarial Networks) construct pixel matrices step-by-step from random noise vectors conditioned on text prompts or latent representations.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-black text-slate-950 font-sans text-xl">
                  How Generative Models Leave Fingerprints
                </h3>
                <p>
                  To upscale low-resolution latent vectors to high-definition outputs, neural models utilize mathematical operations such as transposed convolutions (deconvolutions) and attention blocks. These mathematical operations often introduce subtle, repeating periodic grids across the pixel array.
                </p>
                <p>
                  While these periodic patterns may be smoothed out to appear invisible to human eyes, transforming the image into the <strong className="text-slate-950 font-bold">2D Fourier (FFT) frequency domain</strong> reveals sharp mathematical cross-hatch spikes or concentric halos that natural optical sensors do not produce.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-blue-700 block font-black text-sm">Transposed Convolutions</span>
                <span className="text-slate-600 text-xs font-medium">Produces periodic Fourier spikes</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-blue-700 block font-black text-sm">Statistical Synthesis</span>
                <span className="text-slate-600 text-xs font-medium">Asymmetric corneal reflections</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-blue-700 block font-black text-sm">Boundary Seam Blending</span>
                <span className="text-slate-600 text-xs font-medium">Gradient frequency mismatch</span>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION B: IMAGE METADATA */}
        {/* ------------------------------------------------------------- */}
        {(activeSection === 'all' || activeSection === 'metadata') && (
          <section className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-9 space-y-6 relative shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-extrabold block">
                    EVIDENCE 02 // CONTAINER PROVENANCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans mt-0.5">
                    Image Metadata & Technical Container Properties
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 font-bold px-3 py-1 rounded-md bg-slate-100 border border-slate-300 hidden sm:inline">
                TOPIC: EXIF & IPTC
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Every digital image is packaged in a container format that includes both visual pixel values and structured metadata headers. TruthLens extracts and analyzes these properties as auxiliary forensic clues:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs sm:text-sm">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-blue-700 font-black block text-sm">Resolution & Pixels</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-normal">
                  Width and height dictate pixel count. Low-resolution images (&lt;250,000 pixels) often lack sufficient high-frequency density to reliably detect subtle generative artifacts.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-blue-700 font-black block text-sm">File Format & Color Mode</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-normal">
                  JPEG introduces 8×8 block DCT quantization. PNG is lossless and retains fine Fourier harmonics. RGB color channels indicate standard 3-channel visual reproduction.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-blue-700 font-black block text-sm">Aspect Ratio</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-normal">
                  Native digital cameras typically capture in 3:2 or 4:3 ratios. AI generators frequently default to square 1:1 (1024×1024) or widescreen 16:9 crops.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-2 text-sm">
              <div className="font-bold text-slate-950 font-mono flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <span>EXIF (Exchangeable Image File Format) & Missing Indicators</span>
              </div>
              <p className="text-slate-700 leading-relaxed font-sans font-medium">
                Camera hardware embeds technical tags: camera make, model, lens parameters, ISO speed, shutter time, and GPS coordinates. While the presence of EXIF tags can provide camera provenance, missing EXIF is not definitive proof of AI generation: modern messaging platforms (WhatsApp, Telegram) and social networks automatically strip all EXIF tags for user privacy.
              </p>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION C: DETECTION CONFIDENCE */}
        {/* ------------------------------------------------------------- */}
        {(activeSection === 'all' || activeSection === 'confidence') && (
          <section className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-9 space-y-6 relative shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-extrabold block">
                    EVIDENCE 03 // STATISTICAL CONFIDENCE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans mt-0.5">
                    Detection Confidence & Probability Calibration
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 font-bold px-3 py-1 rounded-md bg-slate-100 border border-slate-300 hidden sm:inline">
                TOPIC: SOFTMAX CALIBRATION
              </span>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              <p>
                When TruthLens displays a confidence score (e.g., <strong className="text-slate-950 font-bold">94.2%</strong>), it represents the <strong className="text-slate-950 font-bold">activation strength</strong> of the fine-tuned Vision Transformer's classification head after softmax normalization.
              </p>

              <div className="p-5 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>CONFIDENCE ≠ GUARANTEE OF REAL-WORLD AUTHENTICITY</span>
                </div>
                <p className="font-sans text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
                  A high confidence score means the mathematical features extracted from the image strongly correspond to patterns seen in synthetic media training sets. It does <strong className="font-black">never</strong> mean there is a 94.2% guarantee of ground-truth deception. Uncalibrated neural networks can exhibit high confidence even on out-of-distribution real images with unusual lighting or compression.
                </p>
              </div>

              <p>
                TruthLens explicitly communicates both the <strong className="text-slate-950 font-bold">AI Score</strong> and <strong className="text-slate-950 font-bold">Non-AI Score</strong> so users can evaluate the relative margin of classification rather than relying on a blind single number.
              </p>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION D: REAL VS FAKE CLASSIFICATION */}
        {/* ------------------------------------------------------------- */}
        {(activeSection === 'all' || activeSection === 'classification') && (
          <section className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-9 space-y-6 relative shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-extrabold block">
                    EVIDENCE 04 // DECISION LOGIC
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans mt-0.5">
                    Interpreting REAL vs FAKE Predictions
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 font-bold px-3 py-1 rounded-md bg-slate-100 border border-slate-300 hidden sm:inline">
                CUTOFF: 0.50 (±0.10)
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              TruthLens adopts an honest, calibrated classification schema using a 0.50 threshold with an uncertain band buffer:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs sm:text-sm">
              {/* REAL */}
              <div className="p-5 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 space-y-2">
                <span className="text-emerald-900 font-black block text-sm">
                  REAL / NO SIGNS DETECTED (&lt; 40%)
                </span>
                <p className="text-slate-800 font-sans text-sm leading-relaxed font-medium">
                  The model did not find synthetic patch activations or periodic frequency anomalies exceeding threshold. Does not guarantee media is unedited; traditional edits or shallowfakes may appear clean.
                </p>
              </div>

              {/* INCONCLUSIVE */}
              <div className="p-5 rounded-xl bg-amber-50/70 border-2 border-amber-300 space-y-2">
                <span className="text-amber-900 font-black block text-sm">
                  INCONCLUSIVE (40% – 60%)
                </span>
                <p className="text-slate-800 font-sans text-sm leading-relaxed font-medium">
                  The prediction falls within the uncertainty buffer around the 0.50 cutoff. The model cannot reliably distinguish this image from photography. Human corroboration is required.
                </p>
              </div>

              {/* FAKE */}
              <div className="p-5 rounded-xl bg-rose-50/70 border-2 border-rose-300 space-y-2">
                <span className="text-rose-900 font-black block text-sm">
                  FAKE / SYNTHETIC DETECTED (&gt; 60%)
                </span>
                <p className="text-slate-800 font-sans text-sm leading-relaxed font-medium">
                  Model patch activations and high-frequency Fourier signatures strongly align with generative diffusion or GAN synthesis patterns.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SECTION E: LIMITATIONS */}
        {/* ------------------------------------------------------------- */}
        {(activeSection === 'all' || activeSection === 'limitations') && (
          <section className="rounded-2xl bg-white border-2 border-slate-200 p-7 sm:p-9 space-y-6 relative shadow-sm hover:border-blue-400 transition-all">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 shadow-2xs">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-800 font-extrabold block">
                    EVIDENCE 05 // BOUNDARY DISCLOSURE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 font-sans mt-0.5">
                    Forensic Limitations & Adversarial Degradation
                  </h2>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-600 font-bold px-3 py-1 rounded-md bg-slate-100 border border-slate-300 hidden sm:inline">
                CAVEATS & SCOPE
              </span>
            </div>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
              Automated deepfake detection is inherently probabilistic and operates in an adversarial environment. Key factors that reduce detection reliability include:
            </p>

            <div className="space-y-4 font-mono text-sm">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-950 font-black block text-sm">1. Aggressive Compression & Quantization</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-medium">
                  Platforms like WhatsApp, Instagram, and X apply lossy JPEG quantization. This strips out high-frequency noise, which can mask real synthetic artifacts or produce false blur flags.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-950 font-black block text-sm">2. Screenshots & Screen Captures</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-medium">
                  Taking a screenshot of an image re-samples all pixels onto the operating system display grid, replacing native camera sensor noise with display raster artifacts.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-slate-950 font-black block text-sm">3. Traditional Edits vs Full Generation</span>
                <p className="text-slate-700 font-sans text-sm leading-relaxed font-medium">
                  TruthLens estimates whether an image is <strong className="text-slate-950 font-bold">fully AI-generated</strong>. It cannot determine if a real photograph was cropped, color-graded, or edited with traditional retouching tools.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA — Blue box button with white text */}
        <div className="text-center pt-6">
          <button
            onClick={() => onNavigate('/analyze')}
            className="inline-flex items-center justify-center gap-3 px-9 py-4 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/30 cursor-pointer font-sans"
          >
            <Scan className="w-5 h-5 text-white" />
            <span>Put It Into Practice — Analyze an Image</span>
            <ArrowRight className="w-5 h-5 ml-0.5 text-white" />
          </button>
        </div>

      </div>
    </div>
  );
};
