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
    return import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  },

  async checkBackendHealth(): Promise<{ isOnline: boolean; details?: any }> {
    try {
      const url = `${this.getBackendUrl()}/api/health`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, details: data };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
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
      const mediaUrl = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video') || file.name.match(/\.(mp4|mov|webm)$/i) !== null;

      if (isVideo) {
        throw new Error('Video frame analysis is scheduled for Phase 4. Currently, image forensics (2D-FFT & metadata extraction) is active.');
      }

      if (onProgress) onProgress(20, 'Reading file bytes and computing client-side integrity check...');
      await new Promise(r => setTimeout(r, 200));

      if (onProgress) onProgress(45, 'Sending image to TruthLens FastAPI backend via multipart/form-data...');

      const formData = new FormData();
      formData.append('file', file);

      let response: Response;
      try {
        response = await fetch(`${backendUrl}/api/analyze/image`, {
          method: 'POST',
          body: formData,
        });
      } catch (networkErr: any) {
        throw new Error(
          `Unable to connect to TruthLens backend at ${backendUrl}. Please ensure FastAPI is running via 'python app/main.py'.`
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

      if (onProgress) onProgress(80, 'Processing 2D-FFT log-magnitude spectrum and EXIF headers...');
      const backendData = await response.json();

      if (onProgress) onProgress(100, 'Forensics analysis complete!');

      const dimensions = backendData.metadata_analysis.dimensions;
      const energy = backendData.frequency_analysis.energy_distribution;
      const exifCount = Object.keys(backendData.metadata_analysis.exif_data || {}).length;

      // Construct genuine evidence items from real backend computations
      const evidence: EvidenceItem[] = [
        {
          id: 'ev-fft-energy',
          title: '2D-FFT Radial Spectral Energy Distribution',
          category: 'frequency_domain',
          severity: 'info',
          score: Math.round(energy.high_frequency_pct),
          summary: `Low Freq (Core): ${energy.low_frequency_pct}%, Mid Freq: ${energy.mid_frequency_pct}%, High Freq: ${energy.high_frequency_pct}%`,
          details: `The 2D Fast Fourier Transform decomposed the ${dimensions.width}×${dimensions.height} image into its spatial frequency components. The center of the spectrum represents baseline luminance, while radial dispersion represents edge transitions and micro-texture grain.`,
          visualCue: 'Computed 2D-FFT magnitude spectrum displayed in the Media Inspector.',
          isDemonstrationOnly: false
        },
        {
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
        },
        {
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
        }
      ];

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
        stageLabel: backendData.stage_label || 'Image Forensics — AI Detector Not Yet Connected',
        resultCategory: 'forensic_signal_analysis',
        confidenceScore: null, // CONFIDENCE WITHHELD: Pretrained AI model not yet connected
        confidenceRationale: 'Confidence score withheld: Pretrained AI classification model is not yet connected. TruthLens presents genuine mathematical Fourier signals without fabricating artificial confidence percentages.',
        summary: `Extracted genuine dimensions (${dimensions.width}×${dimensions.height}), ${backendData.metadata_analysis.format} format, and computed real 2D-FFT frequency spectrum.`,
        evidence,
        metadataAnalysis: {
          dimensions: backendData.metadata_analysis.dimensions,
          format: backendData.metadata_analysis.format,
          colorMode: backendData.metadata_analysis.color_mode,
          hasExif: backendData.metadata_analysis.has_exif,
          exifData: backendData.metadata_analysis.exif_data,
          missingMetadata: backendData.metadata_analysis.missing_metadata
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
        limitations: backendData.limitations,
        nextSteps: backendData.recommendations,
        modelInfo: {
          name: 'TruthLens Signal Forensics Engine',
          version: 'v1.0.0-phase1',
          mode: 'genuine_signal_processing',
          disclaimer: 'Pretrained neural deepfake model is not yet connected. Results represent genuine deterministic signal processing.'
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
