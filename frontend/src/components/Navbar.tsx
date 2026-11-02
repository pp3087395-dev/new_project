import { useState } from 'react';
import type { FC } from 'react';
import { 
  Scan, 
  BookOpen, 
  History, 
  HelpCircle, 
  Menu, 
  X, 
  Activity,
  Home,
  Info
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: FC<NavbarProps> = ({ 
  currentPath, 
  onNavigate 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEngineTooltip, setShowEngineTooltip] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/how-it-works', label: 'How It Works', icon: HelpCircle },
    { path: '/evidence-guide', label: 'Evidence Guide', icon: BookOpen },
    { path: '/audit-history', label: 'Audit History', icon: History },
  ];

  const handleNavClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isHomeActive = currentPath === '/' || currentPath === '/home';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[68px] flex items-center justify-between">
        
        {/* LEFT: Compact, Elegant TruthLens Brand */}
        <div 
          onClick={() => handleNavClick('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:bg-blue-700 transition-all duration-150">
            <Scan className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
            <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-tight">
              <span className="text-lg sm:text-xl font-black tracking-tight text-slate-950 font-sans">
                Truth<span className="text-blue-600">Lens</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                AI
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
              Digital Forensics
            </span>
          </div>
        </div>

        {/* CENTER/RIGHT NAVIGATION: Even, Harmonious Sizing */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? isHomeActive 
              : currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-blue-600 bg-blue-50 font-bold border border-blue-200/80 shadow-2xs'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50 font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Engine Diagnostic & Evenly Sized Analyze Button */}
        <div className="hidden lg:flex items-center gap-2.5">
          
          {/* Engine Status Diagnostic Pill */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowEngineTooltip(true)}
              onMouseLeave={() => setShowEngineTooltip(false)}
              onClick={() => setShowEngineTooltip(!showEngineTooltip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono bg-white text-slate-800 border border-slate-200 hover:border-blue-400 shadow-2xs transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold text-slate-900">ENGINE READY</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showEngineTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 shadow-xl z-50">
                <div className="font-bold text-slate-950 mb-1.5 flex items-center gap-2 font-mono text-xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  Smaug-AI ViT + 2D-FFT NumPy
                </div>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  Connected to FastAPI backend for genuine 2D Fast Fourier Transform frequency spectra and Vision Transformer deepfake inference.
                </p>
              </div>
            )}
          </div>

          {/* Balanced Analyze Image Button — Even size fitting best in navbar */}
          <button
            onClick={() => handleNavClick('/analyze')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-xs hover:shadow-sm cursor-pointer active:scale-95 text-white ${
              currentPath === '/analyze'
                ? 'bg-blue-700 ring-2 ring-blue-400'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <Scan className="w-4 h-4 text-white" />
            <span>Analyze Image</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-lg text-slate-700 hover:text-blue-600 hover:bg-slate-100 border border-slate-200"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-blue-600" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2 text-xs font-mono">
            <span className="text-blue-600 flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5" /> FORENSIC ENGINE ACTIVE
            </span>
            <span className="text-slate-700 font-semibold">Smaug-AI // 2D-FFT</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/' 
              ? isHomeActive 
              : currentPath === item.path;

            return (
              <button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors ${
                  isActive
                    ? 'text-blue-700 bg-blue-50 border border-blue-200'
                    : 'text-slate-800 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-600'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            onClick={() => handleNavClick('/analyze')}
            className="w-full mt-3 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-md cursor-pointer"
          >
            <Scan className="w-5 h-5 text-white" />
            <span>Analyze Image</span>
          </button>
        </div>
      )}
    </header>
  );
};
