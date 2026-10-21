import type { FC } from 'react';
import { 
  Scan, 
  HelpCircle, 
  ShieldAlert, 
  Cpu, 
  Lock, 
  ArrowRight,
  Sparkles
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
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden radial-glow cyber-grid">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-900/80 border border-cyan-500/30 text-cyan-300 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>University Hackathon Prototype</span>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-slate-400">Explainable Forensics Framework</span>
          </div>
        </div>

        {/* Hero Headings */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-6 font-heading leading-tight">
            Can You Trust{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-violet-400 bg-clip-text text-transparent">
              What You See?
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed mb-8">
            Investigate suspicious images and videos with AI-assisted media authenticity analysis. Unpack visual artifacts, frequency domain anomalies, and probabilistic confidence.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAnalysis}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-xl shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <Scan className="w-5 h-5" />
              <span>Analyze Media</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-80" />
            </button>

            <button
              onClick={onLearnMore}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-base font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 transition-all duration-200 cursor-pointer"
            >
              <HelpCircle className="w-5 h-5 text-slate-400" />
              <span>How It Works</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Client-Side Privacy by Default</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Multi-Spectral Heuristic Pipeline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-violet-400" />
              <span>Probabilistic & Transparent Scores</span>
            </div>
          </div>
        </div>

        {/* Interactive Media Scanner Demo Showcase */}
        <div className="mt-4">
          <div className="text-center mb-3">
            <span className="text-xs uppercase tracking-widest font-mono text-slate-500 font-medium">
              Interactive Forensics Demonstration
            </span>
          </div>
          <LiveScannerDemo onSelectSample={onSelectSample} />
        </div>

      </div>
    </section>
  );
};
