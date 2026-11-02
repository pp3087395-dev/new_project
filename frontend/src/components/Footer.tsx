import type { FC } from 'react';
import { Scan, Lock, ShieldCheck, Activity } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: FC<FooterProps> = ({ onNavigate }) => {
  const handleNav = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs py-10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNav('/')}>
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-2xs">
                <Scan className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight font-sans">
                Truth<span className="text-blue-600">Lens</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                AI FORENSICS
              </span>
            </div>

            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              "See Beyond the Image." A transparent, multi-spectral digital media forensics platform engineered for authentic image verification, 2D Fast Fourier Transform decomposition, and EXIF container verification.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              <span>In-memory media safety. Uploads are processed in RAM without persistent disk retention.</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div>
            <h4 className="text-slate-900 font-mono uppercase tracking-wider text-[11px] font-bold mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => handleNav('/')}
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-700"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/how-it-works')}
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-700"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/evidence-guide')}
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-700"
                >
                  Evidence Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/audit-history')}
                  className="hover:text-blue-600 transition-colors cursor-pointer text-slate-700"
                >
                  Audit History
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/analyze')}
                  className="hover:text-blue-700 transition-colors cursor-pointer text-blue-600 font-semibold"
                >
                  Analyze Image
                </button>
              </li>
            </ul>
          </div>

          {/* Forensic Scope & Ethics */}
          <div>
            <h4 className="text-slate-900 font-mono uppercase tracking-wider text-[11px] font-bold mb-3">
              Forensic Integrity
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              TruthLens advocates for probabilistic transparency. Absence of automated detection does not constitute legal proof that an image is untouched.
            </p>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Smaug-AI // 2D-FFT // EXIF Pipeline</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            © {CURRENT_YEAR} TruthLens Digital Forensics. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-blue-600" />
              <span>VISION TRANSFORMER CPU</span>
            </span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">FASTAPI BACKEND READY</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
