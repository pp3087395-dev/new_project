import type { FC } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Scale 
} from 'lucide-react';

export const ResponsibleAI: FC = () => {
  const principles = [
    {
      title: 'No Automated Guarantee of Authenticity',
      icon: ShieldAlert,
      badge: 'GROUND TRUTH',
      text: 'A classification of "No Signs of Full AI Generation" does NOT guarantee that media is untouched. It signifies that current neural and Fourier heuristics did not detect anomalies exceeding the decision threshold. Subtle edits, shallowfakes, and novel diffusion architectures may remain undetected.'
    },
    {
      title: 'Probabilistic Confidence vs Legal Proof',
      icon: Scale,
      badge: 'PROBABILISTIC LIMITS',
      text: 'Machine learning scores represent statistical probability distributions. They do not constitute forensic certainty or courtroom proof. High-confidence classifications must be treated as indicators for rigorous corroboration by human investigators, not summary judgment.'
    },
    {
      title: 'Compression & Adversarial Degradation',
      icon: AlertTriangle,
      badge: 'SIGNAL DEGRADATION',
      text: 'Re-compression algorithms used by messaging apps and social media platforms (JPEG chroma subsampling, spatial downscaling) strip away high-frequency sensor noise. This degradation can produce inconclusive scores by attenuating genuine generative fingerprints.'
    },
    {
      title: 'Ethical Verification & Corroboration',
      icon: CheckCircle,
      badge: 'INVESTIGATIVE PRACTICE',
      text: 'Responsible verification pairs automated tooling with primary-source investigative journalism, provenance metadata inspection (C2PA content credentials), reverse image indexing, and corroborating real-world context.'
    }
  ];

  return (
    <section className="py-20 bg-[#101311] border-t border-[#303A33]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Alert */}
        <div className="p-6 rounded-lg bg-[#171C19] border border-[#D9AB68]/40 mb-10 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-11 h-11 rounded-md bg-[#D9AB68]/10 border border-[#D9AB68]/30 flex items-center justify-center text-[#D9AB68] shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#D9AB68] bg-[#D9AB68]/10 px-2 py-0.5 rounded border border-[#D9AB68]/20">
                FORENSIC ETHICS & SCOPE BOUNDARY
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F0F2ED] mb-1 font-sans">
              Why Media Authenticity Cannot Be 100% Guaranteed by Any Single Algorithm
            </h3>
            <p className="text-xs sm:text-sm text-[#A0AAA1] leading-relaxed">
              TruthLens is engineered to assist investigators, fact-checkers, and journalists — not replace human verification. Automated detection operates in an evolving adversarial space against generative model releases.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {principles.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div
                key={idx}
                className="rounded-lg p-6 border border-[#303A33] bg-[#171C19] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-md bg-[#1D2420] border border-[#303A33] flex items-center justify-center text-[#80B9A5]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-mono text-[#A0AAA1] bg-[#1D2420] px-2.5 py-1 rounded border border-[#303A33]">
                      {p.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#F0F2ED] mb-2 font-sans">
                    {p.title}
                  </h4>

                  <p className="text-[#A0AAA1] text-xs sm:text-sm leading-relaxed">
                    {p.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
