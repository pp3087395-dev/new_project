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
      title: 'Upload Media Safely',
      icon: UploadCloud,
      description:
        'Upload an image (JPG, PNG, WEBP) or short video clip (MP4, WEBM). Processing runs in-memory without persistent server storage, preserving media privacy.',
      details: [
        'Client-side preview generation',
        'Strict MIME type and size validation',
        'No public database archiving'
      ]
    },
    {
      step: '02',
      title: 'Multi-Heuristic AI Inspection',
      icon: Cpu,
      description:
        'The media is passed through multi-layered forensic heuristics: spatial boundary gradients, 2D-FFT frequency spectra, ocular reflection symmetry, and keyframe temporal stability.',
      details: [
        'Transposed convolution grid scan',
        'Facial landmark extraction & alignment',
        'Temporal video frame jitter analysis'
      ]
    },
    {
      step: '03',
      title: 'Review Evidence & Limitations',
      icon: FileCheck,
      description:
        'Examine the structured findings. Rather than a blind percentage, review specific anomalies, why they matter, detection limitations, and recommended verification steps.',
      details: [
        'Potentially Manipulated / Clean / Inconclusive',
        'Visual layer inspection & callouts',
        'Printable forensic audit report export'
      ]
    }
  ];

  return (
    <section id="how-it-works-section" className="py-20 bg-[#090E1B] border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-2 block">
            Verification Pipeline
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-heading mb-4">
            How TruthLens Investigates Media
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Understanding authenticity requires structured methodology. Here is how our analysis pipeline breaks down every submitted file.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative glass-card rounded-2xl p-7 border border-slate-800 bg-slate-900/50 flex flex-col justify-between"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-mono font-extrabold text-cyan-400/80 bg-cyan-950/40 px-3 py-1 rounded-lg border border-cyan-800/40">
                    {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-300">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3 font-heading">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <ul className="space-y-1.5">
                    {item.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
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
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white font-heading">
                Ready to investigate suspicious media?
              </h4>
              <p className="text-xs text-slate-400">
                Test custom files or use our pre-calibrated forensic datasets.
              </p>
            </div>
          </div>

          <button
            onClick={onStartAnalysis}
            className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-md transition-all cursor-pointer"
          >
            <span>Open Analysis Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
