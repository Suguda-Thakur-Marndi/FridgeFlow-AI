import { Platform } from 'react-native';
import { IEdgeVisionEngine } from './types';
import { WebEdgeVisionEngine } from './engine.web';
import { NativeEdgeVisionEngine } from './engine.native';

export { WebEdgeVisionEngine } from './engine.web';
export { NativeEdgeVisionEngine } from './engine.native';

let engineInstance: IEdgeVisionEngine | null = null;

export function getEdgeVisionEngine(): IEdgeVisionEngine {
  if (!engineInstance) {
    if (Platform.OS === 'web') {
      engineInstance = new WebEdgeVisionEngine();
    } else {
      engineInstance = new NativeEdgeVisionEngine();
    }
  }
  return engineInstance;
}

export const EdgeVisionEngine = getEdgeVisionEngine();
