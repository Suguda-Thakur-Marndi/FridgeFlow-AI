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

export interface LocalScanResult {
  ingredients: RecognizedItemReview[];
  modelName: string;
  isLive: boolean; // True if genuine on-device local AI inference ran
  inferenceTimeMs: number;
  engineUsed: EdgeEngineType;
  deviceTier: DeviceHardwareTier;
  rawSummary?: string;
  modelId: string;
}

export interface IEdgeVisionEngine {
  getStatus(): Promise<EdgeModelStatus>;
  installModel(modelId?: string, onProgress?: (percent: number) => void): Promise<void>;
  unloadModel(): Promise<void>;
  deleteModel(): Promise<void>;
  setModel(modelId: string): Promise<void>;
  analyzeFridgeImage(imageUri: string, options?: LocalInferenceOptions): Promise<LocalScanResult>;
}
