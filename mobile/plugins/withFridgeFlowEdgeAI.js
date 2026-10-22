const { withAppBuildGradle, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Expo Config Plugin for FridgeFlow AI on-device LiteRT / TFLite neural vision inference.
 * Ensures:
 * 1. Bundled model weights (.tflite, .onnx, manifest.json) are copied into android/app/src/main/assets/
 * 2. noCompress 'tflite', 'onnx' is added to androidResources in build.gradle
 * 3. LiteRT runtime dependencies are added to dependencies in build.gradle
 * 4. Custom Kotlin native modules are copied and registered
 */
function withFridgeFlowEdgeAI(config) {
  // 1. Copy model assets and native Kotlin files into Android project
  config = withDangerousMod(config, [
    'android',
    async (cfg) => {
      const projectRoot = cfg.modRequest.projectRoot;
      const androidDir = cfg.modRequest.platformProjectRoot;

      // Assets directory
      const assetsDest = path.join(androidDir, 'app', 'src', 'main', 'assets', 'models', 'bundled-vlm');
      fs.mkdirSync(assetsDest, { recursive: true });

      const modelSourceDir = path.join(projectRoot, 'assets', 'models', 'bundled-vlm');
      if (fs.existsSync(modelSourceDir)) {
        for (const file of fs.readdirSync(modelSourceDir)) {
          const srcFile = path.join(modelSourceDir, file);
          const dstFile = path.join(assetsDest, file);
          fs.copyFileSync(srcFile, dstFile);
        }
      }

      // Native Kotlin modules
      const javaDest = path.join(androidDir, 'app', 'src', 'main', 'java', 'com', 'fridgeflow', 'ai');
      fs.mkdirSync(javaDest, { recursive: true });

      const templateDir = path.join(projectRoot, 'src', 'native-modules', 'android');
      if (fs.existsSync(templateDir)) {
        for (const file of fs.readdirSync(templateDir)) {
          fs.copyFileSync(path.join(templateDir, file), path.join(javaDest, file));
        }
      }

      // Register package in MainApplication.kt
      const mainAppPath = path.join(javaDest, 'MainApplication.kt');
      if (fs.existsSync(mainAppPath)) {
        let mainAppContent = fs.readFileSync(mainAppPath, 'utf8');
        if (!mainAppContent.includes('FridgeFlowEdgeAIPackage()')) {
          mainAppContent = mainAppContent.replace(
            /PackageList\(this\)\.packages\.apply\s*\{/g,
            'PackageList(this).packages.apply {\n          add(FridgeFlowEdgeAIPackage())'
          );
          fs.writeFileSync(mainAppPath, mainAppContent, 'utf8');
        }
      }

      return cfg;
    },
  ]);

  // 2. Modify app/build.gradle
  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    // Add noCompress 'tflite', 'onnx'
    if (!contents.includes("noCompress 'tflite'")) {
      contents = contents.replace(
        /androidResources\s*\{/g,
        "androidResources {\n        noCompress 'tflite', 'onnx'"
      );
    }

    // Add LiteRT dependencies
    if (!contents.includes('org.tensorflow:tensorflow-lite:')) {
      const deps = `
    // LiteRT / TensorFlow Lite On-Device Neural Vision Inference
    implementation("org.tensorflow:tensorflow-lite:2.16.1")
    implementation("org.tensorflow:tensorflow-lite-support:0.4.4")
    implementation("org.tensorflow:tensorflow-lite-gpu:2.16.1")
`;
      contents = contents.replace(/dependencies\s*\{/, `dependencies {${deps}`);
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
}

module.exports = withFridgeFlowEdgeAI;
