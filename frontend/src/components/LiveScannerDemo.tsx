import { useState } from 'react';
import type { FC } from 'react';
import { 
  Scan, 
  Activity, 
  Layers, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';

interface LiveScannerDemoProps {
  onSelectSample: (sampleId: string) => void;
}

export const LiveScannerDemo: FC<LiveScannerDemoProps> = ({ onSelectSample }) => {
  const [activeLayer, setActiveLayer] = useState<'standard' | 'frequency' | 'gradient'>('standard');
  const [isScanning, setIsScanning] = useState(true);

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-2xl glass-card overflow-hidden shadow-2xl shadow-cyan-950/20 border border-slate-800">
      
      {/* Top Terminal Status Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-slate-300 font-semibold tracking-wide">HEURISTIC FORENSIC VIEWER</span>
          <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
            SIMULATED SCAN
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-violet-400" />
          <span>FPS: 60</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">2D-FFT: 512x512</span>
        </div>
      </div>

      {/* Main Preview Container with Scan Overlay */}
      <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
        
        {/* Sample Image Base */}
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80"
          alt="Synthetic Demo Portrait"
          className={`w-full h-full object-cover transition-all duration-500 ${
            activeLayer === 'frequency' 
              ? 'filter invert contrast-200 hue-rotate-180 brightness-75' 
              : activeLayer === 'gradient'
              ? 'filter contrast-150 grayscale saturate-200'
              : ''
          }`}
        />

        {/* Frequency Heatmap Matrix Simulation */}
        {activeLayer === 'frequency' && (
          <div className="absolute inset-0 bg-gradient-to-t from-violet-900/40 via-cyan-900/30 to-fuchsia-900/40 mix-blend-color-dodge pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border border-cyan-400/50 rounded-full animate-ping opacity-25"></div>
            <div className="absolute font-mono text-[10px] text-cyan-300 bg-black/70 px-2 py-1 rounded top-4 left-4 border border-cyan-500/30">
              SPECTRUM: Transposed Conv Grid Anomaly (High Frequency Peaks)
            </div>
          </div>
        )}

        {/* Spatial Gradient Mask Simulation */}
        {activeLayer === 'gradient' && (
          <div className="absolute inset-0 bg-red-950/20 mix-blend-difference pointer-events-none">
            <div className="absolute font-mono text-[10px] text-amber-300 bg-black/70 px-2 py-1 rounded top-4 left-4 border border-amber-500/30">
              GRADIENT: Edge Smoothing Discontinuity along Jawline
            </div>
          </div>
        )}

        {/* Sweeping Radar Scan Line */}
        {isScanning && <div className="animate-scan-line pointer-events-none"></div>}

        {/* Synthetic Bounding Box: Face Region */}
        <div className="absolute top-[18%] left-[32%] w-[36%] h-[56%] border-2 border-dashed border-cyan-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono bg-cyan-950/90 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40">
              FACE ROI #01
            </span>
            <span className="text-[9px] font-mono text-cyan-400 font-bold">
              p(manip) = 0.84
            </span>
          </div>

          {/* Eye Sub-Bounding Boxes */}
          <div className="flex justify-between px-3 -mt-6">
            <div className="w-9 h-6 border border-violet-400 bg-violet-500/10 rounded flex items-center justify-center text-[7px] text-violet-300 font-mono">
              EYE_L
            </div>
            <div className="w-9 h-6 border border-violet-400 bg-violet-500/10 rounded flex items-center justify-center text-[7px] text-violet-300 font-mono">
              EYE_R
            </div>
          </div>

          <div className="flex justify-between items-end">
            <span className="text-[8px] font-mono text-violet-300 bg-black/70 px-1 rounded">
              Specular: Asymmetric
            </span>
            <span className="text-[8px] font-mono text-amber-300 bg-black/70 px-1 rounded">
              Seam Blur: 0.78
            </span>
          </div>
        </div>

        {/* Floating Forensic Indicators */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-slate-900/90 backdrop-blur-md border border-red-500/40 rounded-lg px-2.5 py-1 text-xs text-red-300 flex items-center gap-1.5 shadow-md">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span className="font-mono font-medium">Spectral Checkerboard Detected</span>
          </div>
          <div className="bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-lg px-2.5 py-1 text-xs text-cyan-300 flex items-center gap-1.5 shadow-md">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-medium">Gaze Coherence: 89%</span>
          </div>
        </div>

      </div>

      {/* Interactive Controls & Layer Switcher */}
      <div className="p-4 bg-slate-900/70 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Layer Filters */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-500" /> Layer:
          </span>
          <button
            onClick={() => setActiveLayer('standard')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeLayer === 'standard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveLayer('frequency')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeLayer === 'frequency'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            2D-FFT Spectra
          </button>
          <button
            onClick={() => setActiveLayer('gradient')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              activeLayer === 'gradient'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Boundary Gradient
          </button>
        </div>

        {/* Action Button: Load into studio */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition-colors"
          >
            {isScanning ? 'Pause Beam' : 'Resume Beam'}
          </button>
          <button
            onClick={() => onSelectSample('sample-ai-deepfake')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 shadow-md transition-all cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Load in Studio</span>
          </button>
        </div>

      </div>

    </div>
  );
};
