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
      badge: 'Critical Ground Truth',
      color: 'amber',
      text: 'A detector indicating "No Strong Signs of Manipulation" is NOT proof that an image or video is authentic. It only means current heuristics did not find detectable anomalies above threshold. Subtle edits, shallowfakes, and novel diffusion architectures may not be caught.'
    },
    {
      title: 'Probabilistic Confidence vs Legal Proof',
      icon: Scale,
      badge: 'Probabilistic Limits',
      color: 'violet',
      text: 'Machine learning predictions are statistical estimates. They do not constitute forensic certainty or courtroom proof. High-confidence flags should be treated as grounds for rigorous human investigation, not summary judgment.'
    },
    {
      title: 'Compression & Adversarial Degradation',
      icon: AlertTriangle,
      badge: 'Signal Interference',
      color: 'red',
      text: 'Social media compression algorithms (JPEG chroma subsampling, H.264/H.265 quantization) strip away delicate high-frequency sensor noise. This can generate false positives by mimicking generative blur or hide real generative fingerprints.'
    },
    {
      title: 'Ethical Verification & Human Judgment',
      icon: CheckCircle,
      badge: 'Best Practice',
      color: 'cyan',
      text: 'Responsible verification pairs automated tooling with primary-source journalism, provenance metadata checking (e.g. C2PA standards), reverse image indexing, and corroborating contextual evidence.'
    }
  ];

  return (
    <section className="py-20 bg-[#070A13] border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner Alert */}
        <div className="p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 mb-12 flex flex-col md:flex-row items-start md:items-center gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Responsible AI & Media Forensics Disclosure
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-1 font-heading">
              Why Media Authenticity Cannot Be 100% Guaranteed by Any Algorithm
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              TruthLens was built to assist investigators, journalists, and citizens — not replace critical judgment. Detectors face an adversarial cat-and-mouse game against evolving generative architectures.
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
                className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/60">
                      {p.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-2 font-heading">
                    {p.title}
                  </h4>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
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
