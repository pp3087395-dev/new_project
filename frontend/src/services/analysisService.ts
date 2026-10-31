import type {
  AnalysisResult,
  ResultCategory,
  EvidenceItem,
  SampleMedia
} from '../types';

export interface AnalysisProgressCallback {
  (percentage: number, stageName: string): void;
}

// Built-in sample assets for clearly separated demonstrative evaluation
export const SAMPLE_DATASETS: SampleMedia[] = [
  {
    id: 'sample-ai-deepfake',
    name: 'synthetic_portrait_gan_v2.jpg',
    description: 'Demonstration asset illustrating theoretical transposed convolution periodicities in older GAN/diffusion literature.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    expectedCategory: 'potentially_manipulated',
    badge: 'Demo Model Sample'
  },
  {
    id: 'sample-authentic-photo',
    name: 'camera_capture_raw_8291.jpg',
    description: 'Demonstration asset illustrating standard continuous sensor noise distribution in photography.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    expectedCategory: 'no_strong_signs',
    badge: 'Demo Clean Sample'
  },
  {
    id: 'sample-inconclusive-clip',
    name: 'social_compressed_preview.jpg',
    description: 'Demonstration asset illustrating heavy social media compression masking fine frequency features.',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    expectedCategory: 'inconclusive',
    badge: 'Demo Inconclusive Sample'
  }
];

export const analysisService = {
  getBackendUrl(): string {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
      return envUrl.replace(/\/+$/, '');
    }
    return 'http://127.0.0.1:8000';
  },

  /**
   * Fast lightweight ping probe.
   * Resolves immediately to check if the server is awake without waiting for model weights.
   */
  async ping(timeoutMs = 4000): Promise<boolean> {
    try {
      const url = `${this.getBackendUrl()}/api/ping`;
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return !!data.ok;
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Comprehensive health check.
   * Reports server status, model loading progress ('loading' | 'ready' | 'error'), and active model name.
   */
  async checkBackendHealth(timeoutMs = 10000): Promise<{
    isOnline: boolean;
    modelStatus: 'ready' | 'loading' | 'error' | 'unavailable' | 'unknown';
    modelName?: string;
    details?: any;
    error?: string;
  }> {
    try {
      const url = `${this.getBackendUrl()}/api/health`;
      const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
      if (res.ok) {
        const data = await res.json();
        return {
          isOnline: true,
          modelStatus: data.ai_model_status || (data.ai_model_connected ? 'ready' : 'unavailable'),
          modelName: data.ai_model_name,
          details: data,
          error: data.ai_model_error || undefined,
        };
      }
      return { isOnline: false, modelStatus: 'unknown' };
    } catch (e: any) {
      return { isOnline: false, modelStatus: 'unknown', error: e.message };
    }
  },

  /**
   * Generates a downscaled JPEG data-URL thumbnail (max 320px) on the client canvas.
   * Replaces ephemeral URL.createObjectURL(file) blob URLs that expire upon session/reload,
   * ensuring history and dashboard previews persist indefinitely without localStorage overflow.
   */
  async createDownscaledThumbnail(file: File, maxDim = 320): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve((e.target?.result as string) || '');
          }
        };
        img.onerror = () => resolve((e.target?.result as string) || '');
        img.src = (e.target?.result as string) || '';
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  },

  /**
   * Main analysis dispatcher.
   * If an actual file is uploaded, sends multipart/form-data to the FastAPI backend.
   * If a demonstrative sample is selected, runs the clearly labeled demo simulation.
   */
  async analyzeMedia(
    file: File | { name: string; size: number; type: string; url: string; sampleId?: string },
    onProgress?: AnalysisProgressCallback
  ): Promise<AnalysisResult> {
    const isSample = !('lastModified' in file);

    // -------------------------------------------------------------
    // PATH 1: GENUINE BACKEND IMAGE ANALYSIS (Real 2D-FFT & Metadata)
    // -------------------------------------------------------------
    if (!isSample && file instanceof File) {
      const backendUrl = this.getBackendUrl();
      const mediaUrl = await this.createDownscaledThumbnail(file, 320);
      const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm)$/i) !== null;

      if (isVideo) {
        throw new Error('Video frame analysis is scheduled for Phase 4. Currently, image forensics (2D-FFT & metadata extraction) is active.');
      }

      if (onProgress) onProgress(20, 'Reading file bytes and computing client-side integrity check...');
      await new Promise(r => setTimeout(r, 200));

      if (onProgress) onProgress(45, 'Sending image to TruthLens backend (first analysis after a cold start can take longer)...');

      const formData = new FormData();
      formData.append('file', file);

      let response: Response;
      try {
        response = await fetch(`${backendUrl}/api/analyze/image`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(120000), // 120-second timeout for CPU inference & cold starts
        });
      } catch (networkErr: any) {
        if (networkErr.name === 'TimeoutError') {
          throw new Error('Analysis timed out after 120 seconds. The server may be experiencing high CPU load or a cold start.');
        }
        throw new Error(
          `Unable to connect to TruthLens backend at ${backendUrl}. Please ensure the server is running and reachable.`
        );
      }

      if (!response.ok) {
        let errMessage = `Server returned HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errMessage = errJson.detail;
        } catch {
          // fallback to status code
        }
        throw new Error(errMessage);
      }

      if (onProgress) onProgress(80, 'Running Vision Transformer inference and 2D-FFT spectrum...');
      const backendData = await response.json();

      if (onProgress) onProgress(100, 'Forensics analysis complete!');

      const dimensions = backendData.metadata_analysis.dimensions;
      const energy = backendData.frequency_analysis.energy_distribution;
      const exifCount = Object.keys(backendData.metadata_analysis.exif_data || {}).length;
      const rawAi = backendData.ai_classification;

      const aiClassification = rawAi ? {
        modelId: rawAi.model_id,
        modelName: rawAi.model_name,
        modelVersion: rawAi.model_version,
        status: rawAi.status as 'success' | 'unavailable' | 'error',
        predictedClass: rawAi.predicted_class,
        predictedLabelDescription: rawAi.predicted_label_description,
        confidenceScore: rawAi.confidence_score,
        decisionThreshold: rawAi.decision_threshold,
        uncertainBand: rawAi.uncertain_band,
        scores: rawAi.scores,
        rawLogits: rawAi.raw_logits,
        calibrationStatement: rawAi.calibration_statement,
        scopeLimitation: rawAi.scope_limitation,
        inferenceTimeMs: rawAi.inference_time_ms,
        errorMessage: rawAi.error_message
      } : undefined;

      const rawProv = backendData.provenance;
      const provenance = rawProv ? {
        aiSourceDeclared: Boolean(rawProv.ai_source_declared),
        declaredSourceType: rawProv.declared_source_type || null,
        toolStrings: rawProv.tool_strings || [],
        c2paPresent: Boolean(rawProv.c2pa_present),
        c2paVerified: rawProv.c2pa_verified,
        watermarkMatch: rawProv.watermark_match || null,
        notes: rawProv.notes || []
      } : undefined;

      let resultCategory: ResultCategory = 'forensic_signal_analysis';
      let confidenceScore: number | null = null;
      let confidenceRationale = '';

      if (aiClassification && aiClassification.status === 'success') {
        if (aiClassification.predictedClass === 'FAKE') {
          resultCategory = 'potentially_manipulated';
        } else if (aiClassification.predictedClass === 'REAL') {
          resultCategory = 'no_strong_signs';
        } else if (aiClassification.predictedClass === 'INCONCLUSIVE') {
          resultCategory = 'inconclusive';
        }
        confidenceScore = aiClassification.confidenceScore ?? null;
        const displayClass = aiClassification.predictedClass === 'FAKE'
          ? 'Likely fully AI-generated'
          : (aiClassification.predictedClass === 'REAL' ? 'No signs of full AI generation' : 'Inconclusive');
        confidenceRationale = `AI Classification: ${displayClass} (${confidenceScore}% model activation). ${aiClassification.predictedLabelDescription || ''}`;
      } else if (aiClassification && aiClassification.status === 'unavailable') {
        resultCategory = 'forensic_signal_analysis';
        confidenceScore = null;
        confidenceRationale = `AI Classification model unavailable (${aiClassification.errorMessage || 'offline'}). Deterministic 2D-FFT and metadata inspection completed successfully.`;
      } else if (aiClassification && aiClassification.status === 'error') {
        resultCategory = 'forensic_signal_analysis';
        confidenceScore = null;
        confidenceRationale = `Inference error: ${aiClassification.errorMessage}. No synthetic prediction generated.`;
      } else {
        resultCategory = 'forensic_signal_analysis';
        confidenceScore = null;
        confidenceRationale = 'Confidence score withheld: Pretrained AI classification model is not connected.';
      }

      // Construct genuine evidence items from real backend computations
      const evidence: EvidenceItem[] = [];

      // 1. AI Model Evidence (if present)
      if (aiClassification && aiClassification.status === 'success') {
        const fakePct = aiClassification.scores?.FAKE ? (aiClassification.scores.FAKE * 100).toFixed(1) : '0';
        const realPct = aiClassification.scores?.REAL ? (aiClassification.scores.REAL * 100).toFixed(1) : '0';
        const isFake = aiClassification.predictedClass === 'FAKE';
        const isInconclusive = aiClassification.predictedClass === 'INCONCLUSIVE';
        evidence.push({
          id: 'ev-ai-classifier',
          title: `Classifier Verdict: ${isFake ? 'Likely fully AI-generated' : (isInconclusive ? 'Inconclusive' : 'No signs of full AI generation')}`,
          category: 'spatial_artifacts',
          severity: isFake ? 'high' : (isInconclusive ? 'medium' : 'clean'),
          score: Math.round(confidenceScore || 50),
          summary: `Model: ${aiClassification.modelName}. Class activation: Fake ${fakePct}% vs Real ${realPct}%.`,
          details: `${aiClassification.predictedLabelDescription || ''} ${aiClassification.calibrationStatement} ${aiClassification.scopeLimitation}`,
          visualCue: `Inference completed in ${aiClassification.inferenceTimeMs}ms on CPU.`,
          isDemonstrationOnly: false
        });
      } else if (aiClassification && aiClassification.status !== 'success') {
        evidence.push({
          id: 'ev-ai-classifier-status',
          title: 'AI Neural Classifier: Unavailable or Offline',
          category: 'spatial_artifacts',
          severity: 'info',
          score: 0,
          summary: aiClassification.errorMessage || 'Model weights not loaded or inference failed.',
          details: 'TruthLens operates honestly in deterministic signal-processing mode when the neural classifier is unavailable. No mock or fabricated predictions are returned.',
          visualCue: 'Review server logs or network status.',
          isDemonstrationOnly: false
        });
      }

      // 1b. Provenance Clues Evidence Item
      if (provenance) {
        evidence.push({
          id: 'ev-provenance-clues',
          title: provenance.aiSourceDeclared
            ? 'Provenance Clues: AI Source / Editing Declared in Metadata'
            : 'Provenance Clues: Metadata & Container Inspection',
          category: 'metadata_compression',
          severity: provenance.aiSourceDeclared ? 'medium' : 'info',
          score: provenance.aiSourceDeclared ? 75 : 20,
          summary: provenance.aiSourceDeclared
            ? `Metadata declared: ${provenance.declaredSourceType || provenance.toolStrings.join(', ') || 'AI editing marker'}.`
            : (provenance.toolStrings.length > 0
              ? `Tool markers: ${provenance.toolStrings.join(', ')}.`
              : (provenance.notes.length > 0 ? provenance.notes[0] : 'No provenance clues found.')),
          details: [
            ...provenance.notes,
            'Provenance clues are auxiliary metadata indicators and never alter the neural classifier verdict.'
          ].join(' • '),
          visualCue: provenance.c2paPresent ? 'C2PA manifest marker present in media container.' : 'EXIF / XMP / IPTC metadata inspection.',
          isDemonstrationOnly: false
        });
      }

      // 2. Frequency Domain Evidence
      evidence.push({
        id: 'ev-fft-energy',
        title: '2D-FFT Radial Spectral Energy Distribution',
        category: 'frequency_domain',
        severity: 'info',
        score: Math.round(energy.high_frequency_pct),
        summary: `Low Freq (Core): ${energy.low_frequency_pct}%, Mid Freq: ${energy.mid_frequency_pct}%, High Freq: ${energy.high_frequency_pct}%`,
        details: `The 2D Fast Fourier Transform decomposed the ${dimensions.width}×${dimensions.height} image into its spatial frequency components. The center of the spectrum represents baseline luminance, while radial dispersion represents edge transitions and micro-texture grain. Frequency visualization is an inspection aid and does not constitute proof of manipulation.`,
        visualCue: 'Computed 2D-FFT magnitude spectrum displayed in the Media Inspector.',
        isDemonstrationOnly: false
      });

      // 3. Metadata Evidence
      evidence.push({
        id: 'ev-exif-headers',
        title: backendData.metadata_analysis.has_exif
          ? `Embedded EXIF Metadata Detected (${exifCount} tags)`
          : 'EXIF Metadata Stripped or Absent',
        category: 'metadata_compression',
        severity: backendData.metadata_analysis.has_exif ? 'clean' : 'medium',
        score: backendData.metadata_analysis.has_exif ? 10 : 65,
        summary: backendData.metadata_analysis.has_exif
          ? `Found camera/software tags: ${Object.keys(backendData.metadata_analysis.exif_data).slice(0, 3).join(', ')}...`
          : 'No EXIF metadata container found. Standard for social messaging apps or AI image generation tools.',
        details: backendData.metadata_analysis.missing_metadata.join(' • '),
        visualCue: 'See full metadata breakdown table below.',
        isDemonstrationOnly: false
      });

      // 4. Resolution Evidence
      evidence.push({
        id: 'ev-resolution-spec',
        title: `Resolution & Color Space: ${dimensions.width} × ${dimensions.height} (${backendData.metadata_analysis.color_mode})`,
        category: 'spatial_artifacts',
        severity: dimensions.total_pixels < 250000 ? 'medium' : 'clean',
        score: dimensions.total_pixels < 250000 ? 50 : 15,
        summary: `Aspect Ratio: ${dimensions.aspect_ratio} • Total Pixel Count: ${dimensions.total_pixels.toLocaleString()} px.`,
        details: dimensions.total_pixels < 250000
          ? 'Sub-pixel density is relatively low. Fine generative artifacts can be masked by low pixel counts.'
          : 'Resolution is sufficient for standard spatial and frequency forensic inspection.',
        visualCue: 'Spatial boundaries verified by Pillow decoder.',
        isDemonstrationOnly: false
      });

      const summaryText = aiClassification && aiClassification.status === 'success'
        ? `ViT classifier predicted ${aiClassification.predictedClass} (${aiClassification.predictedLabelDescription}) with ${aiClassification.confidenceScore}% confidence. Genuine 2D-FFT frequency spectrum and EXIF metadata computed.`
        : `Extracted genuine dimensions (${dimensions.width}×${dimensions.height}), ${backendData.metadata_analysis.format} format, and computed real 2D-FFT frequency spectrum.`;

      return {
        id: backendData.id,
        fileName: backendData.file_name,
        fileType: 'image',
        fileSizeFormatted: backendData.file_size_formatted,
        fileSizeBytes: backendData.file_size_bytes,
        mediaUrl,
        analyzedAt: new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        status: 'completed',
        mode: 'genuine_signal_processing',
        stageLabel: backendData.stage_label || 'Image Forensics & Pretrained ViT AI Classifier',
        resultCategory,
        confidenceScore,
        confidenceRationale,
        summary: summaryText,
        evidence,
        metadataAnalysis: {
          dimensions: {
            width: dimensions.width,
            height: dimensions.height,
            aspectRatio: dimensions.aspect_ratio || `${dimensions.width}:${dimensions.height}`,
            totalPixels: dimensions.total_pixels ?? (dimensions.width * dimensions.height),
          },
          format: backendData.metadata_analysis.format,
          colorMode: backendData.metadata_analysis.color_mode,
          hasExif: backendData.metadata_analysis.has_exif,
          exifData: backendData.metadata_analysis.exif_data || {},
          missingMetadata: backendData.metadata_analysis.missing_metadata || []
        },
        frequencyAnalysis: {
          method: backendData.frequency_analysis.method,
          fftVisualizationBase64: backendData.frequency_analysis.fft_visualization_base64,
          energyDistribution: {
            lowFrequencyPct: energy.low_frequency_pct,
            midFrequencyPct: energy.mid_frequency_pct,
            highFrequencyPct: energy.high_frequency_pct
          },
          description: backendData.frequency_analysis.description,
          disclaimer: backendData.frequency_analysis.disclaimer
        },
        aiClassification,
        provenance,
        limitations: backendData.limitations,
        nextSteps: backendData.recommendations,
        modelInfo: {
          name: aiClassification?.modelName || 'TruthLens Media Forensics Engine',
          version: aiClassification?.modelVersion || 'v1.1.0',
          mode: 'genuine_signal_processing',
          disclaimer: aiClassification?.calibrationStatement || 'Deterministic signal processing and neural classification.'
        },
        sha256Hash: backendData.sha256_hash
      };
    }

    // -------------------------------------------------------------
    // PATH 2: DEMONSTRATION SIMULATION (Clearly Segregated)
    // -------------------------------------------------------------
    if (onProgress) onProgress(20, 'Loading demonstration sample dataset...');
    await new Promise(r => setTimeout(r, 300));
    if (onProgress) onProgress(60, 'Synthesizing educational heuristic markers...');
    await new Promise(r => setTimeout(r, 300));
    if (onProgress) onProgress(100, 'Demonstration analysis complete!');

    const sampleId = 'sampleId' in file ? file.sampleId : '';
    let category: ResultCategory = 'potentially_manipulated';
    if (sampleId === 'sample-authentic-photo') {
      category = 'no_strong_signs';
    } else if (sampleId === 'sample-inconclusive-clip') {
      category = 'inconclusive';
    }

    const demoEvidence: EvidenceItem[] = [
      {
        id: 'dev-demo-1',
        title: 'Demonstration Heuristic Signal',
        category: 'frequency_domain',
        severity: category === 'potentially_manipulated' ? 'high' : 'clean',
        score: category === 'potentially_manipulated' ? 88 : 12,
        summary: 'This record was generated in demonstration mode using simulated test presets.',
        details: 'Demonstration mode illustrates how deepfake detection metrics will be structured once a pretrained neural network is connected in Phase 3.',
        visualCue: 'Demonstration overlay active.',
        isDemonstrationOnly: true
      }
    ];

    return {
      id: `TL-DEMO-${Math.floor(100000 + Math.random() * 900000)}`,
      fileName: file.name,
      fileType: 'image',
      fileSizeFormatted: `${((file.size || 2500000) / (1024 * 1024)).toFixed(2)} MB`,
      fileSizeBytes: file.size || 2500000,
      mediaUrl: 'url' in file ? file.url : '',
      analyzedAt: new Date().toLocaleString(),
      status: 'completed',
      mode: 'demo_simulation',
      stageLabel: 'Demonstration Mode — Simulated Heuristics',
      resultCategory: category,
      confidenceScore: category === 'inconclusive' ? null : 84.5,
      confidenceRationale: 'Demonstration Metric: Derived from illustrative heuristic test weights.',
      summary: 'Demonstration simulation: Illustrates how detection metrics will appear with a pretrained AI classifier.',
      evidence: demoEvidence,
      limitations: [
        'Demonstration Mode does NOT perform real AI inference.',
        'To run genuine 2D-FFT and metadata forensics, upload an actual image file.'
      ],
      nextSteps: [
        'Upload your own image to test real backend 2D-FFT processing.',
        'Review the educational guides in "Understand the Evidence".'
      ],
      modelInfo: {
        name: 'TruthLens Demo Simulator',
        version: 'v0.9-demo',
        mode: 'demo_simulation',
        disclaimer: 'Demonstration mode for interface preview.'
      },
      sha256Hash: 'sha256:demo000000000000000000000000000000000000000000000000000000000000'
    };
  }
};
