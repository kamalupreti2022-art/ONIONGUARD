
export type OnionDefectType = 'healthy' | 'damaged' | 'rotten' | 'sprouted' | 'other' | 'undersized' |'unable_to_determine';

export interface DefectCounts {
  healthy: number;
  damaged: number;
  rotten: number;
  sprouted: number;
  other?: number;
  undersized: number;
  unableToDetermine: number;
}

export interface DefectPercentages {
  healthy: number;
  damaged: number;
  rotten: number;
  sprouted: number;
  other?: number;
  undersized: number;
  unableToDetermine?: number;
}

export interface ClassProbabilityItem {
  className: string;
  displayName: string;
  probability: number;
  percentage: number;
}

export interface ImageAnalysisItem {
  id: string;
  imageIndex: number;
  imageSrc: string;
  prediction: OnionDefectType;
  label: string; // 'Healthy' | 'Rotten' | 'Sprouted' | 'Damaged' | 'Other' | 'Undersized' | 'Unable to determine'
  confidence?: number; // Real model confidence percentage (0-100)
  qualityInterpretation?: string;
  recommendation?: string;
  allProbabilities?: ClassProbabilityItem[];
  rawClassName?: string;
  detectionCount?: number;
  isLowConfidence?: boolean;
  lowConfidenceWarning?: string;
  reason: string; // Transparency & explainability why it was classified
  sizeReferenceDetected: boolean;
  sizeReferenceNote?: string;
  diameterMm?: number;
  bulbDetected: boolean;
  pixelStats?: {
    onionPixelRatio: number;
    greenRatio: number;
    darkRotRatio: number;
    cutBlemishRatio: number;
  };
}

export type ModelEngineType = 'tfjs_local' | 'direct_cv' | 'roboflow_api';


export interface ModelStatus {
  engine: ModelEngineType;
  name: string;
  isAvailable: boolean;
  version: string;
  statusMessage: string;
  customModelFile?: string | null;
}

export interface BoundingBox {
  id: number;
  x: number; // detection center x in source-image pixels
  y: number; // detection center y in source-image pixels
  width?: number; // detection width in source-image pixels
  height?: number; // detection height in source-image pixels
  size?: number;
  defectType: OnionDefectType;
  confidence?: number;
  label: string;
  reason?: string;
  rawClassName?: string;
}

export interface BatchData {
  batchId: string;
  procurementCentre: string;
  inspectorName: string;
  date: string;
  onionVariety: string;
  approxQuantity: string;
  notes?: string;
}

export interface AssessmentRecord {
  reportId: string;
  batch: BatchData;
  timestamp: string;
  images: string[];
  imageItems?: ImageAnalysisItem[];
  totalAnalyzed: number;
  counts: DefectCounts;
  percentages: DefectPercentages;
  gradeA: number; // percentage
  gradeURS: number; // Under-size, Rotten, Sprouted percentage
  qualitySummary: string;
  status: 'Completed' | 'Pending Review' | 'Flagged';
  isDemoData: boolean;
  isRealScan?: boolean;
  modelEngineUsed?: string;
  modelAvailable?: boolean;
  modelNotice?: string;
  boundingBoxes?: BoundingBox[];
}

export type ViewMode = 
  | 'landing'
  | 'dashboard'
  | 'create-batch'
  | 'image-upload'
  | 'analyzing'
  | 'analysis-results'
  | 'report'
  | 'history'
  | 'procurement-centre'
  | 'settings';

export type Language = 'en' | 'hi';
