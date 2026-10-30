import type { FC } from 'react';
import { Scan, Lock } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: FC<FooterProps> = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-slate-800 bg-[#05070D] text-slate-400 text-xs py-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Scan className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight font-heading">
                Truth<span className="text-cyan-400">Lens</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm max-w-md leading-relaxed">
              "Look Beyond What You See." A transparent, multi-spectral media authenticity inspection platform built for university hackathon competition.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Client-side media safety. Uploaded files are processed in-memory and not stored.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-mono uppercase tracking-wider text-[11px] font-bold mb-3">
              Navigation
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => { setActiveTab('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('analyze'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Media Upload Studio
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('how-it-works'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  How Heuristics Work
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('evidence'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Understand the Evidence
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('history'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Audit History
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon & Privacy Notes */}
          <div>
            <h4 className="text-white font-mono uppercase tracking-wider text-[11px] font-bold mb-3">
              Forensic Ethics
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
              TruthLens advocates for probabilistic transparency. No automated algorithm can provide an absolute guarantee of media authenticity.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400">
              Built by Hackathon Team of 4 Beginner Developers.
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            © {CURRENT_YEAR} TruthLens Project. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Neural & Signal Forensics</span>
            <span>•</span>
            <span className="text-cyan-400">FastAPI Ready</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
