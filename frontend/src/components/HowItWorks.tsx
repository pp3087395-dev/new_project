import type { FC } from 'react';
import { 
  UploadCloud, 
  Cpu, 
  FileCheck, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

interface HowItWorksProps {
  onStartAnalysis: () => void;
}

export const HowItWorks: FC<HowItWorksProps> = ({ onStartAnalysis }) => {
  const steps = [
    {
      step: '01',
      title: 'Safe Client-Side Ingestion',
      icon: UploadCloud,
      description:
        'Upload an image (JPG, PNG, WEBP). Media is staged in browser memory and validated for dimensions and container integrity without persistent public storage.',
      details: [
        'Client-side privacy preservation',
        'Strict MIME type & 15MB size bounds',
        'Direct RAM processing — zero retention'
      ]
    },
    {
      step: '02',
      title: 'Multi-Spectral AI Forensics',
      icon: Cpu,
      description:
        'The media passes through fine-tuned Smaug-AI Vision Transformers on CPU alongside deterministic 2D-FFT frequency spectrum analysis and EXIF metadata extraction.',
      details: [
        'Transposed convolution periodic grid scan',
        'Log-magnitude 2D Fourier spectrum',
        'Camera metadata & IPTC provenance checks'
      ]
    },
    {
      step: '03',
      title: 'Structured Findings & Limitations',
      icon: FileCheck,
      description:
        'Review transparent forensic findings. Rather than an uncalibrated black-box claim, review specific evidence signals, decision thresholds, and investigative limitations.',
      details: [
        'Three-way verdict: Real, Fake, or Inconclusive',
        'Multi-view media inspector (Original vs FFT)',
        'Printable PDF forensic audit documentation'
      ]
    }
  ];

  return (
    <section id="how-it-works-section" className="py-20 bg-[#171C19] border-t border-[#303A33] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#80B9A5] font-semibold mb-2 block">
            INVESTIGATIVE METHODOLOGY
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F0F2ED] tracking-tight mb-4 font-sans">
            How TruthLens Investigates Media
          </h2>
          <p className="text-[#A0AAA1] text-sm sm:text-base leading-relaxed">
            Authenticity verification demands scientific rigor. Here is how our analysis pipeline decomposes and evaluates every submitted file.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-lg p-6 border border-[#303A33] bg-[#1D2420] flex flex-col justify-between"
              >
                <div>
                  {/* Step Number & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xl font-mono font-bold text-[#80B9A5] bg-[#101311] px-2.5 py-1 rounded border border-[#303A33]">
                      STEP {item.step}
                    </span>
                    <div className="w-9 h-9 rounded-md bg-[#242D27] border border-[#303A33] flex items-center justify-center text-[#80B9A5]">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-[#F0F2ED] mb-2 font-sans">
                    {item.title}
                  </h3>
                  <p className="text-[#A0AAA1] text-xs sm:text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#303A33]">
                  <ul className="space-y-1.5">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-xs text-[#A0AAA1]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#80B9A5] shrink-0"></span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-12 p-6 rounded-lg bg-[#1D2420] border border-[#303A33] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-md bg-[#242D27] border border-[#303A33] flex items-center justify-center text-[#80B9A5] shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#F0F2ED]">
                Ready to investigate digital media?
              </h4>
              <p className="text-xs text-[#A0AAA1] mt-0.5">
                Analyze custom images or evaluate pre-calibrated forensic datasets.
              </p>
            </div>
          </div>

          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-xs font-medium text-[#101311] bg-[#80B9A5] hover:bg-[#93c7b6] transition-colors cursor-pointer"
          >
            <span>Launch Analysis Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
