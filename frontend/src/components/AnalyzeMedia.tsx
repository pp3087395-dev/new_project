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

  // Step 7 Backend Polling State
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('checking');
  const [modelName, setModelName] = useState<string>('Smaug AI Image Detector');
  const [pollSecondsElapsed, setPollSecondsElapsed] = useState<number>(0);
  const [pollAttempt, setPollAttempt] = useState<number>(0);

  const runHealthCheck = useRef<() => void>(() => {});
  const backendUrl = analysisService.getBackendUrl();

  // Polling loop: probe /api/ping (60s timeout, 5s retry), then /api/health for model readiness
  useEffect(() => {
    let isCancelled = false;
    let timerId: any = null;
    let secondsInterval: any = null;
    const startTime = Date.now();
    const MAX_WAIT_MS = 60000; // 60s max wait for cold start
    const PING_INTERVAL_MS = 5000; // 5s retry
    const HEALTH_INTERVAL_MS = 3000; // 3s while model loading

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
        // Continue checking health until model is ready
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
      setErrorMessage('Video frame analysis is scheduled for Phase 4. Currently, image forensics (2D-FFT and metadata inspection) is active.');
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Page Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-800/40 mb-3">
          <Scan className="w-3.5 h-3.5" />
          <span>Forensic Upload Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-heading mb-3">
          Upload Image for Forensics & 2D-FFT Analysis
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Submit images for mathematical 2D Fast Fourier Transform inspection and EXIF provenance extraction. Processing runs in-memory with client-side privacy safeguards.
        </p>
      </div>

      {/* Backend Connectivity Status Banner (Step 7: Waking up, Model Loading, Online, Offline) */}
      <div className={`mb-6 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
        backendStatus === 'online'
          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
          : backendStatus === 'model_loading'
          ? 'bg-sky-950/30 border-sky-500/40 text-sky-300'
          : backendStatus === 'waking_up' || backendStatus === 'checking'
          ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
          : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
      }`}>
        <div className="flex items-center gap-3">
          {backendStatus === 'online' && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          )}
          {backendStatus === 'model_loading' && (
            <Loader2 className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
          )}
          {(backendStatus === 'waking_up' || backendStatus === 'checking') && (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
          )}
          {backendStatus === 'offline' && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}

          <div>
            {backendStatus === 'online' && (
              <span>
                <strong>System Online & Ready:</strong> Connected to FastAPI backend with <span className="font-semibold">{modelName}</span> and 2D-FFT forensics.
              </span>
            )}
            {backendStatus === 'model_loading' && (
              <span>
                <strong>Server Online, Model Loading:</strong> FastAPI server is active; AI classification model weights are initializing on CPU ({pollSecondsElapsed}s elapsed)...
              </span>
            )}
            {(backendStatus === 'waking_up' || backendStatus === 'checking') && (
              <span>
                <strong>Waking up server...</strong> Cold start on Render free tier takes 30–50s ({pollSecondsElapsed}s / 60s max, retrying every 5s).
              </span>
            )}
            {backendStatus === 'offline' && (
              <span>
                <strong>FastAPI Backend Offline:</strong> Unable to connect to <code className="bg-black/40 px-1 py-0.5 rounded font-mono">{backendUrl}</code> after 60s. Start locally via <code className="bg-black/40 px-1 py-0.5 rounded font-mono">python -m uvicorn app.main:app</code> or verify your cloud deployment.
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0">
          {backendStatus === 'offline' && (
            <button
              onClick={() => runHealthCheck.current()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/70 border border-rose-500/50 text-rose-200 transition-colors text-xs font-medium cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          )}
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            API: {backendUrl.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/50 border border-red-500/50 flex items-center justify-between gap-3 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Zone / Media Preview Card */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 p-8 sm:p-12 text-center glass-card ${
            isDragging
              ? 'border-cyan-400 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg,video/mp4,video/quicktime,video/webm"
            onChange={handleFileInputChange}
            className="hidden"
            id="media-file-input"
          />

          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/5">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2 font-heading">
            Drag and drop your image or video here
          </h3>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
            Supports JPG, PNG, WEBP (up to 15MB) and MP4, MOV, WEBM videos (up to 50MB).
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 hover:border-cyan-500/40 transition-all shadow-md cursor-pointer"
          >
            <FileUp className="w-4 h-4 text-cyan-400" />
            <span>Browse Local Files</span>
          </button>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Safe In-Memory Processing
            </span>
            <span>•</span>
            <span>No Data Retention</span>
          </div>
        </div>
      ) : (
        /* Preview Card with Controls */
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-xs font-mono text-slate-300 font-semibold uppercase">
                {selectedSample ? 'Pre-Loaded Demonstration Sample' : 'Custom Upload Staged'}
              </span>
            </div>
            {!isAnalyzing && (
              <button
                onClick={handleRemoveMedia}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-red-950/20 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Remove Media</span>
              </button>
            )}
          </div>

          {/* Media Player / Image Display */}
          <div className="relative aspect-video w-full max-h-[380px] bg-black rounded-xl overflow-hidden my-4 flex items-center justify-center border border-slate-800">
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
                alt="Uploaded media preview"
                className="w-full h-full object-contain"
              />
            )}

            {/* Scanning animation during analysis */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs flex flex-col items-center justify-center p-6">
                <div className="animate-scan-line"></div>
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mb-4 animate-spin">
                  <Scan className="w-7 h-7" />
                </div>
                <div className="text-cyan-300 font-mono font-bold text-sm tracking-wider mb-1">
                  ANALYSIS IN PROGRESS ({progressPct}%)
                </div>
                <div className="text-slate-300 text-xs text-center max-w-sm mb-2">
                  {progressStage}
                </div>
                <div className="text-slate-400 text-[11px] text-center max-w-sm mb-4 italic">
                  Note: The first analysis after a cold start can take longer.
                </div>
                
                {/* Progress Bar */}
                <div className="w-full max-w-md bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-violet-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="text-sm font-semibold text-white font-mono truncate max-w-sm">
                {selectedFile?.name || selectedSample?.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ${selectedFile.type}`
                  : `Preset Sample • ${selectedSample?.description}`}
              </p>
            </div>

            {!isAnalyzing && (
              <button
                onClick={handleStartAnalysis}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Scan className="w-4 h-4" />
                <span>Analyze Media</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Preset Hackathon Test Samples Picker */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Or Try with Curated Demonstration Samples</span>
            </h3>
            <p className="text-xs text-slate-400">
              Ideal for testing different forensic heuristics instantly during hackathon evaluation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SAMPLE_DATASETS.map((sample) => {
            const isSelected = selectedSample?.id === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`glass-card rounded-xl p-4 cursor-pointer border transition-all duration-200 text-left relative group ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/30 shadow-md shadow-cyan-500/10'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                }`}
              >
                <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-black">
                  <img
                    src={sample.url}
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      sample.expectedCategory === 'potentially_manipulated'
                        ? 'bg-red-950/90 text-red-300 border border-red-500/40'
                        : sample.expectedCategory === 'no_strong_signs'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950/90 text-amber-300 border border-amber-500/40'
                    }`}>
                      {sample.badge}
                    </span>
                  </div>
                  {sample.type === 'video' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 p-1 rounded text-cyan-400">
                      <Play className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                <h4 className="text-xs font-bold text-white font-mono truncate mb-1">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
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
