import { useState } from 'react';
import type { FC } from 'react';
import { 
  Activity, 
  Layers, 
  Eye, 
  AlertTriangle,
  Scan
} from 'lucide-react';

interface LiveScannerDemoProps {
  onSelectSample: (sampleId: string) => void;
}

export const LiveScannerDemo: FC<LiveScannerDemoProps> = ({ onSelectSample }) => {
  const [activeLayer, setActiveLayer] = useState<'standard' | 'frequency' | 'gradient'>('standard');
  const [isScanning, setIsScanning] = useState(true);

  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-lg bg-[#171C19] border border-[#303A33] overflow-hidden shadow-2xl">
      
      {/* Top Telemetry Bar */}
      <div className="px-4 py-2.5 bg-[#1D2420] border-b border-[#303A33] flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#80B9A5] animate-pulse"></span>
          <span className="text-[#F0F2ED] font-medium tracking-wider">FORENSIC RETICLE // WORKSTATION</span>
          <span className="text-[10px] text-[#80B9A5] bg-[#101311] px-2 py-0.5 rounded border border-[#303A33]">
            SAMPLE: GAN_V2
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#A0AAA1] text-[11px]">
          <span className="hidden sm:inline">MATRIX: 512×512</span>
          <span className="text-[#303A33] hidden sm:inline">|</span>
          <span className="flex items-center gap-1 text-[#80B9A5]">
            <Activity className="w-3 h-3" />
            <span>RADIAL: ACTIVE</span>
          </span>
        </div>
      </div>

      {/* Main Inspection Viewport with Framing Reticles */}
      <div className="relative aspect-video w-full bg-[#101311] overflow-hidden flex items-center justify-center">
        
        {/* Four Corner Reticles */}
        <div className="reticle-corner-tl" />
        <div className="reticle-corner-tr" />
        <div className="reticle-corner-bl" />
        <div className="reticle-corner-br" />

        {/* Center Crosshair Marker */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-6 h-px bg-[#80B9A5]" />
          <div className="h-6 w-px bg-[#80B9A5] absolute" />
        </div>

        {/* Sample Image */}
        <img
          src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80"
          alt="Synthetic Forensic Portrait Sample"
          className={`w-full h-full object-cover transition-all duration-300 ${
            activeLayer === 'frequency' 
              ? 'filter invert contrast-200 hue-rotate-180 brightness-75' 
              : activeLayer === 'gradient'
              ? 'filter contrast-150 grayscale saturate-200'
              : ''
          }`}
        />

        {/* Layer 2: Frequency Heatmap Matrix Simulation */}
        {activeLayer === 'frequency' && (
          <div className="absolute inset-0 bg-[#80B9A5]/15 mix-blend-color-dodge pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 border border-[#80B9A5]/40 rounded-full animate-ping opacity-20"></div>
            <div className="absolute top-4 left-4 font-mono text-[10px] text-[#80B9A5] bg-[#101311]/90 px-2 py-1 rounded border border-[#303A33]">
              FFT SPECTRUM: Transposed Conv Periodic Spikes (High Freq Band)
            </div>
          </div>
        )}

        {/* Layer 3: Spatial Gradient Mask Simulation */}
        {activeLayer === 'gradient' && (
          <div className="absolute inset-0 bg-[#E47777]/15 mix-blend-difference pointer-events-none">
            <div className="absolute top-4 left-4 font-mono text-[10px] text-[#D9AB68] bg-[#101311]/90 px-2 py-1 rounded border border-[#303A33]">
              GRADIENT: Boundary Laplacian Discontinuity along Jawline
            </div>
          </div>
        )}

        {/* Restrained Radar Scan Beam */}
        {isScanning && <div className="animate-forensic-scan pointer-events-none"></div>}

        {/* Synthetic Bounding Box: Face Region ROI */}
        <div className="absolute top-[16%] left-[32%] w-[36%] h-[60%] border border-[#80B9A5] pointer-events-none flex flex-col justify-between p-2 shadow-sm bg-[#80B9A5]/5">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono bg-[#101311]/90 text-[#80B9A5] px-1.5 py-0.5 rounded border border-[#303A33]">
              ROI #01 [X:328, Y:164]
            </span>
            <span className="text-[9px] font-mono text-[#E47777] font-semibold bg-[#101311]/90 px-1 py-0.5 rounded border border-[#303A33]">
              p(manip) = 0.84
            </span>
          </div>

          {/* Eye Sub-Bounding Boxes */}
          <div className="flex justify-between px-3 -mt-6">
            <div className="w-9 h-6 border border-[#80B9A5]/70 bg-[#80B9A5]/10 rounded flex items-center justify-center text-[7px] text-[#80B9A5] font-mono">
              CORNEA_L
            </div>
            <div className="w-9 h-6 border border-[#80B9A5]/70 bg-[#80B9A5]/10 rounded flex items-center justify-center text-[7px] text-[#80B9A5] font-mono">
              CORNEA_R
            </div>
          </div>

          <div className="flex justify-between items-end text-[8px] font-mono">
            <span className="text-[#A0AAA1] bg-[#101311]/90 px-1 py-0.5 rounded border border-[#303A33]">
              Reflection: Asymmetric
            </span>
            <span className="text-[#D9AB68] bg-[#101311]/90 px-1 py-0.5 rounded border border-[#303A33]">
              Seam Blur: 0.78
            </span>
          </div>
        </div>

        {/* Telemetry Overlay Tags */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 pointer-events-none">
          <div className="bg-[#101311]/90 border border-[#E47777]/40 rounded px-2 py-0.5 text-[10px] text-[#E47777] flex items-center gap-1.5 font-mono">
            <AlertTriangle className="w-3 h-3" />
            <span>High-Freq Periodic Artifacts</span>
          </div>
          <div className="bg-[#101311]/90 border border-[#80B9A5]/40 rounded px-2 py-0.5 text-[10px] text-[#80B9A5] flex items-center gap-1.5 font-mono">
            <Eye className="w-3 h-3" />
            <span>Gaze Coherence: 89%</span>
          </div>
        </div>

      </div>

      {/* Viewport Control Bar */}
      <div className="p-3 bg-[#1D2420] border-t border-[#303A33] flex flex-wrap items-center justify-between gap-3">
        
        {/* Layer Selectors */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#707B72] mr-1 flex items-center gap-1 font-mono">
            <Layers className="w-3.5 h-3.5 text-[#80B9A5]" />
            <span>LAYER:</span>
          </span>
          <button
            onClick={() => setActiveLayer('standard')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeLayer === 'standard'
                ? 'bg-[#242D27] text-[#80B9A5] border border-[#80B9A5]/50'
                : 'text-[#A0AAA1] hover:text-[#F0F2ED] bg-[#171C19] border border-[#303A33]'
            }`}
          >
            Spatial RGB
          </button>
          <button
            onClick={() => setActiveLayer('frequency')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeLayer === 'frequency'
                ? 'bg-[#242D27] text-[#80B9A5] border border-[#80B9A5]/50'
                : 'text-[#A0AAA1] hover:text-[#F0F2ED] bg-[#171C19] border border-[#303A33]'
            }`}
          >
            2D-FFT Spectra
          </button>
          <button
            onClick={() => setActiveLayer('gradient')}
            className={`px-2.5 py-1 rounded text-xs font-mono transition-colors cursor-pointer ${
              activeLayer === 'gradient'
                ? 'bg-[#242D27] text-[#80B9A5] border border-[#80B9A5]/50'
                : 'text-[#A0AAA1] hover:text-[#F0F2ED] bg-[#171C19] border border-[#303A33]'
            }`}
          >
            Boundary Gradient
          </button>
        </div>

        {/* Scan Beam Control & Studio Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsScanning(!isScanning)}
            className="text-xs font-mono text-[#A0AAA1] hover:text-[#F0F2ED] px-2.5 py-1 rounded bg-[#171C19] border border-[#303A33] hover:border-[#435248] transition-colors cursor-pointer"
          >
            {isScanning ? 'Pause Beam' : 'Resume Beam'}
          </button>
          <button
            onClick={() => onSelectSample('sample-ai-deepfake')}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium text-[#101311] bg-[#80B9A5] hover:bg-[#93c7b6] transition-colors cursor-pointer"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Load in Studio</span>
          </button>
        </div>

      </div>

    </div>
  );
};
