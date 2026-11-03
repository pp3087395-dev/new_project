import { useState, useRef, useEffect } from 'react';
import type { FC, DragEvent, ChangeEvent } from 'react';
import { 
  UploadCloud, 
  FileUp, 
  X, 
  AlertCircle, 
  Scan, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { analysisService, SAMPLE_DATASETS } from '../services/analysisService';
import type { AnalysisResult, SampleMedia } from '../types';

interface AnalyzeMediaProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  preSelectedSampleId?: string | null;
}

const MAX_IMAGE_SIZE_MB = 15;

type BackendStatus = 'checking' | 'waking_up' | 'model_loading' | 'online' | 'offline';

export const AnalyzeMedia: FC<AnalyzeMediaProps> = ({ 
  onAnalysisComplete,
  preSelectedSampleId 
}) => {
  const initialSample = preSelectedSampleId ? SAMPLE_DATASETS.find(s => s.id === preSelectedSampleId) || null : null;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSample, setSelectedSample] = useState<SampleMedia | null>(initialSample);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialSample ? initialSample.url : null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(initialSample ? initialSample.type : null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  const [prevSampleId, setPrevSampleId] = useState<string | null | undefined>(preSelectedSampleId);

  if (preSelectedSampleId !== prevSampleId) {
    setPrevSampleId(preSelectedSampleId);
    if (preSelectedSampleId) {
      const sample = SAMPLE_DATASETS.find(s => s.id === preSelectedSampleId);
      if (sample) {
        setSelectedSample(sample);
        setSelectedFile(null);
        setPreviewUrl(sample.url);
        setFileType(sample.type);
        setErrorMessage(null);
      }
    }
  }
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backend Polling & Health State
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [modelName, setModelName] = useState<string>('Smaug AI Image Detector');
  const [pollSecondsElapsed, setPollSecondsElapsed] = useState<number>(0);
  const [pollAttempt, setPollAttempt] = useState<number>(0);

  const runHealthCheck = useRef<() => void>(() => {});
  const backendUrl = analysisService.getBackendUrl();

  // Polling loop: probe /api/ping (60s max wait, 5s retry), then /api/health for model readiness
  useEffect(() => {
    let isCancelled = false;
    let timerId: any = null;
    let secondsInterval: any = null;
    const startTime = Date.now();
    const MAX_WAIT_MS = 60000;
    const PING_INTERVAL_MS = 5000;
    const HEALTH_INTERVAL_MS = 3000;

    secondsInterval = setInterval(() => {
      if (!isCancelled) {
        setPollSecondsElapsed(Math.round((Date.now() - startTime) / 1000));
      }
    }, 1000);

    const poll = async () => {
      if (isCancelled) return;

      // 1. Probe /api/ping
      const pingOk = await analysisService.ping(4000);
      if (isCancelled) return;

      if (!pingOk) {
        if (Date.now() - startTime >= MAX_WAIT_MS) {
          setBackendStatus('offline');
          clearInterval(secondsInterval);
          return;
        }
        setBackendStatus('waking_up');
        timerId = setTimeout(poll, PING_INTERVAL_MS);
        return;
      }

      // 2. Ping succeeded, check /api/health
      const health = await analysisService.checkBackendHealth(4000);
      if (isCancelled) return;

      if (!health.isOnline) {
        if (Date.now() - startTime >= MAX_WAIT_MS) {
          setBackendStatus('offline');
          clearInterval(secondsInterval);
          return;
        }
        setBackendStatus('waking_up');
        timerId = setTimeout(poll, PING_INTERVAL_MS);
        return;
      }

      if (health.modelName) {
        setModelName(health.modelName);
      }

      if (health.modelStatus === 'loading') {
        setBackendStatus('model_loading');
        timerId = setTimeout(poll, HEALTH_INTERVAL_MS);
      } else if (health.modelStatus === 'ready') {
        setBackendStatus('online');
        clearInterval(secondsInterval);
      } else if (health.modelStatus === 'error') {
        setBackendStatus('offline');
        clearInterval(secondsInterval);
      } else {
        setBackendStatus('online');
        clearInterval(secondsInterval);
      }
    };

    runHealthCheck.current = () => {
      if (timerId) clearTimeout(timerId);
      if (secondsInterval) clearInterval(secondsInterval);
      setPollSecondsElapsed(0);
      setBackendStatus('checking');
      setPollAttempt(prev => prev + 1);
    };

    poll();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      if (secondsInterval) clearInterval(secondsInterval);
    };
  }, [pollAttempt]);

  const handleSelectSample = (sample: SampleMedia) => {
    setErrorMessage(null);
    setSelectedFile(null);
    setSelectedSample(sample);
    setFileType(sample.type);
    setPreviewUrl(sample.url);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (file: File) => {
    setErrorMessage(null);
    setSelectedSample(null);

    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const isImage = validImageTypes.includes(file.type) || file.name.match(/\.(jpg|jpeg|png|webp)$/i);
    const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm)$/i);

    if (isVideo) {
      setErrorMessage('Video frame analysis is scheduled for Phase 4. Currently, image forensics (2D-FFT and EXIF metadata inspection) is active.');
      return;
    }

    if (!isImage) {
      setErrorMessage('Unsupported file format. Please upload JPG, PNG, or WEBP images.');
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_IMAGE_SIZE_MB) {
      setErrorMessage(`Image file exceeds ${MAX_IMAGE_SIZE_MB}MB limit (${sizeMB.toFixed(1)}MB).`);
      return;
    }

    setSelectedFile(file);
    setFileType('image');
    analysisService.createDownscaledThumbnail(file, 480).then(setPreviewUrl);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedFile(null);
    setSelectedSample(null);
    setPreviewUrl(null);
    setFileType(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !selectedSample) {
      setErrorMessage('Please upload a file or choose a demonstration sample first.');
      return;
    }

    setIsAnalyzing(true);
    setProgressPct(0);
    setProgressStage('Initializing image forensics pipeline...');

    try {
      let targetPayload: any;
      if (selectedFile) {
        targetPayload = selectedFile;
      } else if (selectedSample) {
        targetPayload = {
          name: selectedSample.name,
          size: 2840000,
          type: 'image/jpeg',
          url: selectedSample.url,
          sampleId: selectedSample.id
        };
      }

      const result = await analysisService.analyzeMedia(targetPayload, (pct, stage) => {
        setProgressPct(pct);
        setProgressStage(stage);
      });

      onAnalysisComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during analysis. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      
      {/* Header Section */}
      <div className="text-center mb-9">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-mono bg-blue-100 text-blue-900 border border-blue-300 font-extrabold mb-3 shadow-2xs">
          <Scan className="w-3.5 h-3.5 text-blue-600" />
          <span>FORENSIC ACQUISITION CONSOLE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight mb-3 font-sans">
          Upload Image for Forensics & 2D-FFT Inspection
        </h1>
        <p className="text-slate-700 text-base max-w-2xl mx-auto leading-relaxed font-medium">
          Staged images are analyzed for mathematical 2D Fast Fourier Transform frequency signatures, Vision Transformer patch activations, and EXIF camera provenance.
        </p>
      </div>

      {/* Backend Connectivity Status Banner */}
      <div className={`mb-6 p-4 rounded-xl border-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm transition-colors ${
        backendStatus === 'online'
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
          : backendStatus === 'model_loading'
          ? 'bg-blue-50/80 border-blue-300 text-blue-900'
          : backendStatus === 'waking_up' || backendStatus === 'checking'
          ? 'bg-amber-50/80 border-amber-300 text-amber-900'
          : 'bg-rose-50/80 border-rose-300 text-rose-900'
      }`}>
        <div className="flex items-center gap-2.5">
          {backendStatus === 'online' && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0"></span>
          )}
          {backendStatus === 'model_loading' && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          )}
          {(backendStatus === 'waking_up' || backendStatus === 'checking') && (
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
          )}
          {backendStatus === 'offline' && (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}

          <div className="font-mono text-xs leading-relaxed font-medium">
            {backendStatus === 'online' && (
              <span>
                <strong className="text-slate-950 font-bold">System Online:</strong> FastAPI server connected with <span className="text-emerald-700 font-bold">{modelName}</span> and 2D-FFT NumPy engine.
              </span>
            )}
            {backendStatus === 'model_loading' && (
              <span>
                <strong className="text-slate-950 font-bold">Model Initializing:</strong> Server reachable; Vision Transformer model weights loading on CPU ({pollSecondsElapsed}s elapsed)...
              </span>
            )}
            {(backendStatus === 'waking_up' || backendStatus === 'checking') && (
              <span>
                <strong className="text-slate-950 font-bold">Connecting to Backend:</strong> Probing server instance ({pollSecondsElapsed}s / 60s max, retrying every 5s)...
              </span>
            )}
            {backendStatus === 'offline' && (
              <span>
<<<<<<< HEAD
                <strong>FastAPI Backend Offline:</strong> Unable to connect to <code className="bg-black/40 px-1 py-0.5 rounded font-mono">{backendUrl || '(VITE_API_BASE_URL is not set)'}</code> after 60s. Start locally via <code className="bg-black/40 px-1 py-0.5 rounded font-mono">python -m uvicorn app.main:app</code> or verify your cloud deployment.
=======
                <strong className="text-slate-950 font-bold">Backend Offline:</strong> Unable to connect to <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200 text-slate-900 font-bold">{backendUrl}</code>. Start locally via <code className="bg-white px-1.5 py-0.5 rounded border border-rose-200 text-slate-900 font-bold">python -m uvicorn app.main:app</code>.
>>>>>>> 0c62bebb249622b5e819024c106133cc292b68a7
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 font-mono text-[11px] font-bold">
          {backendStatus === 'offline' && (
            <button
              onClick={() => runHealthCheck.current()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          )}
<<<<<<< HEAD
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            API: {backendUrl ? backendUrl.replace(/^https?:\/\//, '') : 'NOT CONFIGURED'}
=======
          <span className="text-slate-600 uppercase tracking-wider">
            PORT: {backendUrl.replace(/^https?:\/\//, '')}
>>>>>>> 0c62bebb249622b5e819024c106133cc292b68a7
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border-2 border-rose-300 flex items-center justify-between gap-3 text-xs text-rose-900 font-mono shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-bold">{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-rose-700 hover:text-rose-950 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone / Media Staging Console */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all p-10 sm:p-14 text-center bg-white shadow-sm ${
            isDragging
              ? 'border-blue-500 bg-blue-50/40 ring-4 ring-blue-500/10'
              : 'border-slate-300 hover:border-blue-500 hover:shadow-md'
          }`}
        >
          {/* Reticle Corner Accents */}
          <div className="reticle-corner-blue-tl" />
          <div className="reticle-corner-blue-tr" />
          <div className="reticle-corner-blue-bl" />
          <div className="reticle-corner-blue-br" />

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime,video/webm"
            onChange={handleFileInputChange}
            className="hidden"
            id="media-file-input"
          />

          <div className="w-16 h-16 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 mb-2 font-sans">
            Drag and drop media file for forensic inspection
          </h3>

          <p className="text-slate-700 text-sm sm:text-base max-w-md mx-auto mb-6 font-mono font-medium">
            Supported: JPG, PNG, WEBP (up to 15MB). In-memory stream processing.
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-500/25 active:scale-95"
          >
            <FileUp className="w-5 h-5 text-white" />
            <span>Browse Local Files</span>
          </button>

          <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-center gap-4 text-xs font-mono text-slate-600 font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck className="w-4 h-4" /> Client-Side Privacy
            </span>
            <span>•</span>
            <span>No Persistent Storage</span>
          </div>
        </div>
      ) : (
        /* Preview Card with Forensic Framing & Telemetry */
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-mono text-slate-950 font-extrabold uppercase">
                {selectedSample ? 'DEMO DATASET STAGED' : 'MEDIA ARTIFACT STAGED FOR ANALYSIS'}
              </span>
            </div>
            {!isAnalyzing && (
              <button
                onClick={handleRemoveMedia}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer font-bold"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove Media</span>
              </button>
            )}
          </div>

          {/* Media Player / Image Display Frame */}
          <div className="relative aspect-video w-full max-h-[380px] bg-slate-950 rounded-xl overflow-hidden my-3 flex items-center justify-center border border-slate-800 shadow-inner">
            {/* Reticles */}
            <div className="reticle-corner-blue-tl" />
            <div className="reticle-corner-blue-tr" />
            <div className="reticle-corner-blue-bl" />
            <div className="reticle-corner-blue-br" />

            {fileType === 'video' ? (
              <video
                src={previewUrl}
                controls={!isAnalyzing}
                autoPlay={false}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Staged media preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Scanning animation during active analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-[#101311]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6">
                <div className="animate-forensic-scan"></div>
                <div className="w-12 h-12 rounded-md bg-[#1D2420] border border-[#80B9A5]/50 flex items-center justify-center text-[#80B9A5] mb-3">
                  <Scan className="w-6 h-6 animate-pulse" />
                </div>
                <div className="text-[#80B9A5] font-mono font-semibold text-xs tracking-wider mb-1">
                  INFERENCE IN PROGRESS // {progressPct}%
                </div>
                <div className="text-[#F0F2ED] text-xs text-center max-w-sm mb-1.5 font-mono">
                  {progressStage}
                </div>
                <div className="text-[#707B72] text-[10px] text-center max-w-sm mb-4 font-mono">
                  First execution after server cold start may take 15–30s on CPU.
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-sm bg-[#1D2420] rounded-full h-1.5 overflow-hidden border border-[#303A33]">
                  <div
                    className="bg-[#80B9A5] h-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Staged File Technical Details & Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <div className="font-mono">
              <h4 className="text-sm font-extrabold text-slate-950 truncate max-w-md">
                {selectedFile?.name || selectedSample?.name}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${selectedFile.type}`
                  : `Preset Demonstration Asset • ${selectedSample?.description}`}
              </p>
            </div>

            {!isAnalyzing && (
              <button
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all cursor-pointer shadow-lg shadow-blue-500/25 active:scale-95"
              >
                <Scan className="w-5 h-5 text-white" />
                <span>Run Forensic Analysis</span>
                <ArrowRight className="w-5 h-5 ml-0.5 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Evaluation Test Samples Picker */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <div className="mb-4">
          <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Curated Demonstration Datasets</span>
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-mono">
            Explore diverse forensic heuristics with pre-calibrated evaluation samples.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => {
            const isSelected = selectedSample?.id === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`rounded-xl p-3.5 cursor-pointer border-2 transition-all text-left bg-white relative shadow-2xs hover:shadow-md ${
                  isSelected
                    ? 'border-blue-600 ring-4 ring-blue-500/10 bg-blue-50/20'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2.5 bg-slate-950 border border-slate-800">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-extrabold shadow-sm ${
                      sample.expectedCategory === 'potentially_manipulated'
                        ? 'bg-rose-950/90 text-rose-300 border border-rose-700'
                        : sample.expectedCategory === 'no_strong_signs'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950/90 text-amber-300 border border-amber-700'
                    }`}>
                      {sample.badge}
                    </span>
                  </div>
                  {sample.type === 'video' && (
                    <div className="absolute bottom-1.5 right-1.5 bg-slate-950/90 p-1 rounded text-sky-400">
                      <Play className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-slate-950 font-mono truncate mb-1">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-sans">
                  {sample.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
