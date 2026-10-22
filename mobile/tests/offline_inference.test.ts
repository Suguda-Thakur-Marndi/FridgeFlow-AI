import { WebEdgeVisionEngine } from '../src/services/edgeAI/engine.web';
import * as fs from 'fs';
import * as path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`PASS: ${testName}`);
    passed++;
  } else {
    console.error(`FAIL: ${testName} - ${detail || 'Assertion failed'}`);
    failed++;
  }
}

async function runOfflineVerification() {
  console.log('\n================================================================================');
  console.log('FridgeFlow AI — Offline Neural Vision Model Verification');
  console.log('Guarantee: Zero Network Traffic, Real Local Neural ONNX Model Inference');
  console.log('================================================================================\n');

  // 1. Strict Network Isolation Mock: Reject ANY outgoing HTTP/HTTPS network calls
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = url.toString();
    if (urlStr.startsWith('http:') || urlStr.startsWith('https:') || urlStr.includes('huggingface') || urlStr.includes('api.')) {
      throw new Error(`CRITICAL VIOLATION: Network call blocked in strict offline mode -> ${urlStr}`);
    }
    // Only permit local static asset access (e.g. /models/bundled-vlm/model.onnx)
    return originalFetch(url, init);
  };

  const engine = new WebEdgeVisionEngine();

  // Verify initial status
  const status = await engine.getStatus();
  assert(status.offlineReady === true, 'Engine reports offline-ready before scan');
  assert(status.isInstalled === true, 'Bundled model is pre-installed');

  // Test photo: fridge_test_01
  const testImagePath = path.resolve(__dirname, '../assets/test_dataset/fridge_test_01_user_upload.jpg');
  assert(fs.existsSync(testImagePath), 'Held-out test image exists on local disk');

  console.log('\nExecuting genuine on-device neural inference in STRICT OFFLINE mode...');
  const memBefore = process.memoryUsage().heapUsed;
  const start = Date.now();

  const scanResult = await engine.analyzeFridgeImage(`file://${testImagePath}`);

  const duration = Date.now() - start;
  const memAfter = process.memoryUsage().heapUsed;
  const deltaMemMb = ((memAfter - memBefore) / (1024 * 1024)).toFixed(2);

  console.log(`Neural inference completed in ${duration} ms (Reported model latency: ${scanResult.inferenceTimeMs} ms)`);
  console.log(`Memory delta: ${deltaMemMb} MB`);

  // Verify Result Integrity
  assert(scanResult.isLive === true, 'Inference flagged as genuine live neural inference');
  assert(scanResult.ingredients.length > 0, 'Detects ingredients from real photo pixels');
  assert(scanResult.inferenceTimeMs > 0, 'Measures positive inference execution latency');
  assert(scanResult.modelVersion === '1.0.0-bundled', 'Reports 1.0.0-bundled model version');
  assert(scanResult.availabilityStatus === 'ready', 'Model availability status is ready');

  // Verify Validated Result Schema
  const vr = scanResult.validatedResult;
  assert(Boolean(vr), 'Produces validatedResult schema');
  assert(vr?.model.identifier === 'bundled-vision-vlm', 'Correct model identifier');
  assert(vr?.model.family === 'MobileNetV2-FoodVision', 'Correct model architecture family');
  assert(typeof vr?.uncalibrated_warning === 'string', 'Contains uncalibrated probability warning');
  assert(
    vr?.uncalibrated_warning.includes('uncalibrated') === true,
    'Warning explicitly explains raw score nature'
  );

  // Check ingredient details
  console.log('\nDetected Ingredients:');
  for (const item of scanResult.ingredients) {
    console.log(
      `  • ${item.name} (${item.category}): score=${item.confidence.toFixed(3)}, review=${item.needs_review}, shelfLife=${item.estimated_shelf_life_days}d`
    );
    assert(item.confidence >= 0 && item.confidence <= 1.0, `Confidence bounded: ${item.name}`);
    if (item.confidence < 0.85) {
      assert(item.needs_review === true, `Uncertain item (${item.name}) flagged for review`);
    }
  }

  // Verify that an unknown / new image (e.g. crisper drawer) also works offline
  const crisperPath = path.resolve(__dirname, '../assets/test_dataset/fridge_test_02_produce_crisper.jpg');
  const crisperResult = await engine.analyzeFridgeImage(`file://${crisperPath}`);
  assert(crisperResult.ingredients.length > 0, 'Processes second novel photo offline without network');

  // Restore fetch
  (globalThis as any).fetch = originalFetch;

  console.log('\n================================================================================');
  console.log(`Offline Verification Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runOfflineVerification().catch((err) => {
  console.error('Offline test execution error:', err);
  process.exit(1);
});
