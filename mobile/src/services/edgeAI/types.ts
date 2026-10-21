import { RecognizedItemReview } from '@/types';

export type EdgeEngineType = 'webgpu' | 'wasm' | 'litert' | 'mediapipe' | 'coreml' | 'onnx-runtime' | 'embedded-edge';

export type DeviceHardwareTier = 'high' | 'medium' | 'low' | 'unsupported';

export interface EdgeModelConfig {
  id: string;
  name: string;
  family: string;
  parameterCount: string;
  quantization: string;
  downloadSizeBytes: number;
  downloadSizeFormatted: string;
  ramRequiredBytes: number;
  ramRequiredFormatted: string;
  license: string;
  recommendedFor: string;
  description: string;
}

export interface DeviceHardwareCapabilities {
  hasWebGPU: boolean;
  hasWasmSimd: boolean;
  hasHardwareAcceleration: boolean;
  platform: 'web' | 'android' | 'ios';
  tier: DeviceHardwareTier;
  recommendedModelId: string;
  reason?: string;
}

export interface EdgeModelStatus {
  isInstalled: boolean;
  isLoaded: boolean;
  selectedModelId: string;
  modelConfig: EdgeModelConfig;
  downloadProgress?: number; // 0 - 100
  storageBytesUsed?: number;
  engine: EdgeEngineType;
  capabilities: DeviceHardwareCapabilities;
  offlineReady: boolean;
}

export type InferenceStage = 'idle' | 'preprocessing' | 'feature_extraction' | 'token_generation' | 'parsing_items';

export interface LocalInferenceOptions {
  onProgress?: (stage: InferenceStage, percent: number) => void;
  signal?: AbortSignal;
}

export type LocalModelAvailabilityStatus =
  | 'ready'
  | 'loading'
  | 'unsupported_hardware'
  | 'out_of_memory'
  | 'corrupt_asset'
  | 'not_bundled'
  | 'error';

export interface ValidatedIngredientPrediction {
  name: string;
  category: string;
  confidence: number; // Raw model matching score (0.0 - 1.0); not calibrated probability
  needs_review: boolean; // True if ambiguous (<0.85), occluded, or multi-item cluster
  ambiguity_reason?: string;
  is_occluded?: boolean;
  bounding_box?: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface ModelMetadata {
  identifier: string; // e.g. 'gemma-3-4b-it-int4' or 'bundled-vision-vlm'
  version: string;    // e.g. '1.0.0-bundled'
  family: string;     // e.g. 'Gemma 3' / 'SmolVLM'
  runtime: EdgeEngineType;
}

export interface BundledLocalVisionResult {
  ingredients: ValidatedIngredientPrediction[];
  model: ModelMetadata;
  inference_duration_ms: number;
  status: LocalModelAvailabilityStatus;
  error?: string;
  uncalibrated_warning: string;
}

export interface LocalScanResult {
  ingredients: RecognizedItemReview[];
  modelName: string;
  isLive: boolean; // True if genuine on-device local AI inference ran
  inferenceTimeMs: number;
  engineUsed: EdgeEngineType;
  deviceTier: DeviceHardwareTier;
  rawSummary?: string;
  modelId: string;
  modelVersion?: string;
  availabilityStatus?: LocalModelAvailabilityStatus;
  validatedResult?: BundledLocalVisionResult;
}

export interface IEdgeVisionEngine {
  getStatus(): Promise<EdgeModelStatus>;
  installModel(modelId?: string, onProgress?: (percent: number) => void): Promise<void>;
  unloadModel(): Promise<void>;
  deleteModel(): Promise<void>;
  setModel(modelId: string): Promise<void>;
  analyzeFridgeImage(imageUri: string, options?: LocalInferenceOptions): Promise<LocalScanResult>;
}

