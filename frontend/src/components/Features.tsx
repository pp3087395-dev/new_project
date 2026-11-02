import type { FC } from 'react';
import { 
  Image as ImageIcon, 
  Film, 
  HelpCircle, 
  FileCheck2,
  CheckCircle2
} from 'lucide-react';

interface FeaturesProps {
  onSelectFeature?: (featureId: string) => void;
}

export const Features: FC<FeaturesProps> = () => {
  const featureList = [
    {
      id: 'image-authenticity',
      title: 'Spatial & Spectral Image Forensics',
      icon: ImageIcon,
      tag: 'Spatial & Spectral',
      description:
        'Scans uploaded imagery for telltale signs of generative synthesis, boundary blending discontinuities, and 2D-FFT Fourier checkerboard artifacts produced by convolutional upsampling layers.',
      capabilities: [
        'Transposed convolution grid detection',
        'Facial boundary gradient seam inspection',
        'Corneal specular reflection symmetry verification'
      ]
    },
    {
      id: 'video-frame-analysis',
      title: 'Video Frame & Keyframe Inspection',
      icon: Film,
      tag: 'Temporal Consistency',
      description:
        'Samples video keyframes to analyze intra-frame facial consistency and temporal transitions. Flags unnatural head pose warping and frame-to-frame optical flow flickering.',
      capabilities: [
        'Uniform keyframe sampling & inspection',
        'Suspicious timestamp localization',
        'Optical warping & temporal jitter scoring'
      ]
    },
    {
      id: 'explainable-detection',
      title: 'Calibrated Explainable Verdicts',
      icon: HelpCircle,
      tag: 'Interpretability First',
      description:
        'Rejects opaque black-box verdicts. TruthLens unpacks individual forensic heuristics into distinct, human-readable evidence items explaining why a metric was flagged.',
      capabilities: [
        'Heuristic severity ratings (Clean / Low / Med / High)',
        'Illustrative visual region callouts',
        'Transparent model calibration & uncertainty band'
      ]
    },
    {
      id: 'downloadable-reports',
      title: 'Cryptographic Audit Reports',
      icon: FileCheck2,
      tag: 'Documentation Suite',
      description:
        'Generate structured, printable PDF audit documentation complete with SHA-256 cryptographic verification hash, executive summary, evidence matrix, and ethical disclaimers.',
      capabilities: [
        'One-click PDF / browser print formatting',
        'Cryptographic SHA-256 audit fingerprint',
        'Clear model provenance vs demo sample badge'
      ]
    }
  ];

  return (
    <section className="py-20 bg-[#101311] border-t border-[#303A33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#80B9A5] mb-2 inline-block font-semibold">
            FORENSIC CAPABILITIES
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#F0F2ED] tracking-tight mb-4 font-sans">
            Engineered for Forensic Transparency
          </h2>
          <p className="text-[#A0AAA1] text-sm sm:text-base leading-relaxed">
            Media authentication requires multidimensional inspection. TruthLens examines spatial generative artifacts, mathematical Fourier frequencies, and EXIF container provenance.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featureList.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="rounded-lg p-6 flex flex-col justify-between border border-[#303A33] bg-[#171C19] hover:border-[#435248] transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-md bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[#80B9A5]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-[#A0AAA1] bg-[#1D2420] px-2.5 py-1 rounded border border-[#303A33]">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#F0F2ED] mb-2 font-sans">
                    {feature.title}
                  </h3>

                  <p className="text-[#A0AAA1] text-xs sm:text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#303A33]">
                  <div className="text-[11px] font-mono text-[#707B72] uppercase tracking-wider mb-2 font-semibold">
                    Core Metrics Evaluated:
                  </div>
                  <ul className="space-y-1.5">
                    {feature.capabilities.map((cap, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-[#A0AAA1]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#80B9A5] shrink-0" />
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
