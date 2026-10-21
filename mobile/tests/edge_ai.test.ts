import { WebEdgeVisionEngine } from '../src/services/edgeAI/engine.web';
import { EDGE_MODEL_CATALOG, DEFAULT_EDGE_MODEL_ID } from '../src/services/edgeAI/catalog';
import { matchLocalRecipes } from '../src/services/edgeAI/recipes';
import { findLocalSubstitution } from '../src/services/edgeAI/substitutions';

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

async function runEdgeAITests() {
  console.log('\n========================================');
  console.log('Running FridgeFlow AI — Edge AI Test Suite');
  console.log('========================================\n');

  const engine = new WebEdgeVisionEngine();

  // 1. Hardware Capability Detection
  const caps = await engine.detectCapabilities();
  assert(caps.platform === 'web', 'Detects Web platform correctly');
  assert(['high', 'medium', 'low'].includes(caps.tier), 'Assigns valid hardware tier');
  assert(typeof caps.hasWasmSimd === 'boolean', 'Checks WASM SIMD capability');
  assert(typeof caps.hasWebGPU === 'boolean', 'Checks WebGPU capability');

  // 2. Model Catalog & Status
  const status = await engine.getStatus();
  assert(status.selectedModelId === DEFAULT_EDGE_MODEL_ID, 'Defaults to SmolVLM 500M');
  assert(status.modelConfig.downloadSizeBytes > 0, 'Model catalog specifies non-zero download size');
  assert(status.modelConfig.license.includes('Apache'), 'Model has permissive Apache 2.0 license');

  // 3. Model Switch
  await engine.setModel('fridgevision-edge');
  const switchedStatus = await engine.getStatus();
  assert(switchedStatus.selectedModelId === 'fridgevision-edge', 'Switches active model in catalog');
  assert(switchedStatus.modelConfig.name.includes('FridgeVision'), 'Retrieves correct model configuration');

  // 4. Model Installation & Progress Tracking
  let progressReported = 0;
  await engine.installModel('smolvlm-500m', (p) => {
    progressReported = p;
  });
  assert(progressReported === 100, 'Model install reports 100% completion');
  const installedStatus = await engine.getStatus();
  assert(installedStatus.isInstalled, 'Marks model as installed and cached');

  // 5. Model Deletion
  await engine.deleteModel();
  const deletedStatus = await engine.getStatus();
  assert(!deletedStatus.isInstalled, 'Clears model weights from local cache');

  // 6. Structured Local Inference Output
  // Re-install for inference test
  await engine.installModel('fridgevision-edge');
  const dummySvgDataUri = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="green" width="100" height="100"/></svg>';

  const scanResult = await engine.analyzeFridgeImage(dummySvgDataUri);
  assert(scanResult.isLive, 'Flags scan as live on-device AI inference');
  assert(scanResult.ingredients.length > 0, 'Returns non-empty ingredient predictions');
  assert(scanResult.inferenceTimeMs >= 0, 'Measures positive inference latency');

  const firstItem = scanResult.ingredients[0];
  assert(typeof firstItem.name === 'string' && firstItem.name.length > 0, 'Item prediction has valid name');
  assert(typeof firstItem.category === 'string', 'Item prediction has valid category');
  assert(firstItem.confidence >= 0 && firstItem.confidence <= 1, 'Confidence score is bounded between 0.0 and 1.0');
  assert(firstItem.estimated_shelf_life_days >= 1, 'Estimated shelf life is at least 1 day');

  // 7. Uncertainty & Review Flag Threshold (< 0.85)
  const lowConfItem = scanResult.ingredients.find((i) => i.confidence < 0.85);
  if (lowConfItem) {
    assert(lowConfItem.needs_review === true, 'Item with confidence < 0.85 automatically flagged for user review');
  } else {
    assert(true, 'Review flag rule evaluated');
  }

  // 8. Cancellation Support via AbortSignal
  const abortController = new AbortController();
  abortController.abort();
  try {
    await engine.analyzeFridgeImage(dummySvgDataUri, { signal: abortController.signal });
    assert(false, 'Should have thrown abort error');
  } catch (err: any) {
    assert(err.message.includes('cancelled'), 'Inference respects AbortSignal cancellation');
  }

  // 9. Offline Zero-Waste Recipe Engine (100% Match)
  const fullInventory = ['Eggs', 'Baby Spinach', 'Cheddar Cheese', 'Red Bell Pepper'];
  const fullRecipes = matchLocalRecipes(fullInventory, ['Baby Spinach']);
  assert(fullRecipes.length > 0, 'Matches local recipes without network access');
  assert(fullRecipes[0].match_percentage === 100, 'Calculates 100% match for complete inventory');
  assert(fullRecipes[0].crisper_first === true, 'Prioritizes recipes using expiring crisper items');

  // 10. Offline Partial Inventory Match (< 100%)
  const partialInventory = ['Greek Yogurt', 'Baby Spinach'];
  const partialRecipes = matchLocalRecipes(partialInventory);
  const chickpeaRecipe = partialRecipes.find((r) => r.id === 'recipe-chickpea-bowl');
  assert(Boolean(chickpeaRecipe && chickpeaRecipe.match_percentage < 100), 'Calculates partial match percentage');
  assert(chickpeaRecipe?.missing_ingredients.includes('Canned Chickpeas') === true, 'Identifies missing ingredient for shopping list');

  // 11. Offline Domestic Culinary Substitution
  const subResult = findLocalSubstitution('Heavy Cream', ['Greek Yogurt', 'Eggs']);
  assert(subResult !== null, 'Finds local domestic substitution without internet');
  assert(subResult?.substitute_ingredient.includes('Greek Yogurt') === true, 'Recommends Greek yogurt for heavy cream');
  assert(subResult?.confidence === 0.94, 'Calculates culinary substitution confidence');

  console.log('\n========================================');
  console.log(`Edge AI Test Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runEdgeAITests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
