import { useState } from 'react';
import type { FC } from 'react';
import { 
  ShieldCheck, 
  Scan, 
  BookOpen, 
  History, 
  HelpCircle, 
  Menu, 
  X, 
  Info,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewAnalysis: () => void;
}

export const Navbar: FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNewAnalysis 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemoTooltip, setShowDemoTooltip] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Home', icon: ShieldCheck },
    { id: 'analyze', label: 'Analyze Media', icon: Scan },
    { id: 'how-it-works', label: 'How It Works', icon: HelpCircle },
    { id: 'evidence', label: 'Evidence Guide', icon: BookOpen },
    { id: 'history', label: 'Audit History', icon: History },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070A13]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-violet-500/20 to-purple-600/30 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400 transition-all duration-300">
            <Scan className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Truth<span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Lens</span>
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
              Look Beyond What You See
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action & Demo Badge */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Demo Mode Badge */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowDemoTooltip(true)}
              onMouseLeave={() => setShowDemoTooltip(false)}
              onClick={() => setShowDemoTooltip(!showDemoTooltip)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-violet-950/50 text-violet-300 border border-violet-800/40 hover:border-violet-600 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>DEMO MODE</span>
              <Info className="w-3 h-3 text-violet-400 ml-0.5" />
            </button>

            {showDemoTooltip && (
              <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-xl bg-slate-900 border border-violet-500/30 text-xs text-slate-300 shadow-xl z-50 backdrop-blur-lg">
                <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400"></span>
                  Demonstration Heuristics Active
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  During Phase 1, detection results use explainable heuristic simulation. In Phase 2, this switches to FastAPI + ONNX/Deepfake pretrained inference.
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            onClick={() => {
              onNewAnalysis();
              handleNavClick('analyze');
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>Analyze Media</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-[#0B0F19] px-4 pt-3 pb-5 space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-2">
            <span className="text-xs font-mono text-violet-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> DEMO MODE ACTIVE
            </span>
            <span className="text-[11px] text-slate-400">Phase 1 Prototype</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-400" />
                {item.label}
              </button>
            );
          })}

          <button
            onClick={() => {
              onNewAnalysis();
              handleNavClick('analyze');
            }}
            className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-violet-600 shadow-md"
          >
            <Scan className="w-4 h-4" />
            <span>Start Media Analysis</span>
          </button>
        </div>
      )}
    </header>
  );
};
