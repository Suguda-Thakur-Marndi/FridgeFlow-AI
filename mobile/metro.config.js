const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add custom asset extensions for on-device neural model weights
config.resolver.assetExts.push('onnx', 'tflite', 'wasm');

// Redirect onnxruntime-web imports to the Metro-compatible CJS build
const ortRuntimePath = path.resolve(__dirname, 'src/services/edgeAI/ort-web-runtime.js');

const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'onnxruntime-web') {
    return {
      filePath: ortRuntimePath,
      type: 'sourceFile',
    };
  }
  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
