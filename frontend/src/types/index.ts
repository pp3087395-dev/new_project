export type ResultCategory = 
  | 'potentially_manipulated'
  | 'no_strong_signs'
  | 'inconclusive'
  | 'forensic_signal_analysis';

export type EvidenceSeverity = 'high' | 'medium' | 'low' | 'clean' | 'info';

export type EvidenceCategory = 
  | 'frequency_domain' 
  | 'spatial_artifacts' 
  | 'facial_consistency' 
  | 'metadata_compression' 
  | 'temporal_continuity';

export interface EvidenceItem {
  id: string;
  title: string;
  category: EvidenceCategory;
  severity: EvidenceSeverity;
  score: number; // 0 to 100
  summary: string;
  details: string;
  visualCue?: string;
  isDemonstrationOnly: boolean;
}

export interface VideoFrameSample {
  frameIndex: number;
  timestampSeconds: number;
  timestampLabel: string;
  anomalyScore: number;
  status: 'clean' | 'suspicious' | 'uncertain';
  notes: string;
}

export interface DimensionsInfo {
  width: number;
  height: number;
  aspectRatio: string;
  totalPixels: number;
}

export interface ImageMetadataAnalysis {
  dimensions: DimensionsInfo;
  format: string;
  colorMode: string;
  hasExif: boolean;
  exifData: Record<string, string>;
  missingMetadata: string[];
}

export interface SpectralEnergyDistribution {
  lowFrequencyPct: number;
  midFrequencyPct: number;
  highFrequencyPct: number;
}

export interface FrequencyAnalysis {
  method: string;
  fftVisualizationBase64: string;
  energyDistribution: SpectralEnergyDistribution;
  description: string;
  disclaimer: string;
}

export interface ModelMetadata {
  name: string;
  version: string;
  mode: 'genuine_signal_processing' | 'demo_simulation' | 'pretrained_onnx' | 'backend_fastapi';
  disclaimer: string;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: 'image' | 'video';
  fileSizeFormatted: string;
  fileSizeBytes: number;
  mediaUrl: string;
  analyzedAt: string;
  status: 'completed' | 'processing' | 'error';
  mode: 'genuine_signal_processing' | 'demo_simulation';
  stageLabel: string;
  resultCategory: ResultCategory;
  confidenceScore: number | null; // null when withheld or model not yet connected
  confidenceRationale: string;
  summary: string;
  evidence: EvidenceItem[];
  metadataAnalysis?: ImageMetadataAnalysis;
  frequencyAnalysis?: FrequencyAnalysis;
  videoFrames?: VideoFrameSample[];
  limitations: string[];
  nextSteps: string[];
  modelInfo: ModelMetadata;
  sha256Hash: string;
}

export interface AnalysisHistoryEntry {
  id: string;
  fileName: string;
  fileType: 'image' | 'video';
  analyzedAt: string;
  resultCategory: ResultCategory;
  confidenceScore: number | null;
  summary: string;
  mode: 'genuine_signal_processing' | 'demo_simulation';
}

export interface SampleMedia {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video';
  url: string;
  expectedCategory: ResultCategory;
  badge: string;
}
