import type { FC } from 'react';
import { 
  Image as ImageIcon, 
  Film, 
  HelpCircle, 
  FileCheck2 
} from 'lucide-react';

interface FeaturesProps {
  onSelectFeature?: (featureId: string) => void;
}

export const Features: FC<FeaturesProps> = () => {
  const featureList = [
    {
      id: 'image-authenticity',
      title: 'Image Authenticity Analysis',
      icon: ImageIcon,
      accent: 'cyan',
      tag: 'Spatial & Spectral',
      description:
        'Scans uploaded imagery for telltale signs of generative synthesis, boundary blending discontinuities, and 2D-FFT Fourier checkerboard artifacts produced by upsampling layers.',
      capabilities: [
        'Transposed convolution grid detection',
        'Facial boundary gradient seam inspection',
        'Corneal specular reflection symmetry check'
      ]
    },
    {
      id: 'video-frame-analysis',
      title: 'Video Frame Analysis',
      icon: Film,
      accent: 'violet',
      tag: 'Temporal Consistency',
      description:
        'Samples video keyframes to analyze intra-frame facial consistency and temporal transitions. Flags unnatural head pitch warping and frame-to-frame optical flow flickering.',
      capabilities: [
        'Uniform keyframe sampling & inspection',
        'Suspicious timestamp localization',
        'Warping & temporal jitter scoring'
      ]
    },
    {
      id: 'explainable-detection',
      title: 'Explainable Detection Results',
      icon: HelpCircle,
      accent: 'blue',
      tag: 'Interpretability First',
      description:
        'Rejects opaque black-box verdicts. TruthLens unpacks individual forensic heuristics into distinct, human-readable evidence cards explaining why a metric was flagged.',
      capabilities: [
        'Heuristic severity ratings (High / Med / Low)',
        'Illustrative visual region callouts',
        'Transparent limitations & context notice'
      ]
    },
    {
      id: 'downloadable-reports',
      title: 'Downloadable Audit Reports',
      icon: FileCheck2,
      accent: 'emerald',
      tag: 'Executive Documentation',
      description:
        'Generate structured, printable PDF audit documentation complete with simulated cryptographic verification hash, executive summary, evidence matrix, and ethical disclaimers.',
      capabilities: [
        'One-click PDF / browser print formatting',
        'Cryptographic audit fingerprint',
        'Clear demonstration vs live-model badge'
      ]
    }
  ];

  return (
    <section className="py-20 bg-[#070A13] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-3 font-semibold">
            Core Architecture
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-heading mb-4">
            Engineered for Transparency & Forensics
          </h3>
          <p className="text-slate-400 text-base leading-relaxed">
            Modern media manipulation requires multi-dimensional inspection. TruthLens examines both spatial image anomalies and temporal video transitions.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {featureList.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="glass-card glass-card-hover rounded-2xl p-7 flex flex-col justify-between border border-slate-800/80 bg-slate-900/40 relative overflow-hidden group"
              >
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-colors pointer-events-none"></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700/50">
                      {feature.tag}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white mb-3 font-heading group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h4>

                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80">
                  <div className="text-xs font-semibold text-slate-300 mb-2.5 uppercase tracking-wider font-mono">
                    Key Heuristics:
                  </div>
                  <ul className="space-y-1.5">
                    {feature.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
