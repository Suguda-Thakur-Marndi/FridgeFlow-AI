/**
 * Unit Test Suite for FridgeFlow AI Core Business Logic
 * Tests expiry status calculation, recipe matching algorithms,
 * deduplication, and AI confidence calibration.
 */

import { ExpiryStatus } from '../src/types';

// 1. Expiry Calculation Logic
function calculateExpiryStatus(daysRemaining: number): ExpiryStatus {
  if (daysRemaining < 0) return 'expired';
  if (daysRemaining === 0) return 'expiring_today';
  if (daysRemaining <= 3) return 'use_soon';
  return 'fresh';
}

// 2. Recipe Matching & Missing Ingredients Algorithm
function evaluateRecipeMatch(
  requiredIngredients: string[],
  availableIngredients: string[]
): {
  matchPercentage: number;
  inStock: string[];
  missing: string[];
  isFullMatch: boolean;
} {
  const inStock: string[] = [];
  const missing: string[] = [];
  const availLower = availableIngredients.map((i) => i.toLowerCase().trim());

  for (const req of requiredIngredients) {
    const reqLower = req.toLowerCase().trim();
    const matched = availLower.some((avail) => avail.includes(reqLower) || reqLower.includes(avail));
    if (matched) {
      inStock.push(req);
    } else {
      missing.push(req);
    }
  }

  const matchPercentage =
    requiredIngredients.length > 0
      ? Math.round((inStock.length / requiredIngredients.length) * 100)
      : 0;

  return {
    matchPercentage,
    inStock,
    missing,
    isFullMatch: missing.length === 0,
  };
}

// 3. Grocery Item Deduplication Logic
interface GroceryItemTest {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

function addOrMergeGroceryItem(
  existingList: GroceryItemTest[],
  newItem: { name: string; quantity: number }
): GroceryItemTest[] {
  const cleanName = newItem.name.trim().toLowerCase();
  const existingIdx = existingList.findIndex(
    (item) => !item.checked && item.name.trim().toLowerCase() === cleanName
  );

  if (existingIdx >= 0) {
    const updated = [...existingList];
    updated[existingIdx] = {
      ...updated[existingIdx],
      quantity: updated[existingIdx].quantity + newItem.quantity,
    };
    return updated;
  }

  return [
    ...existingList,
    {
      id: 'item-' + Date.now(),
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      checked: false,
    },
  ];
}

// 4. AI Confidence Calibration
function calibrateConfidence(confidence: number): {
  needsReview: boolean;
  displayPercentage: number;
} {
  const pct = Math.round(confidence * 100);
  return {
    needsReview: pct < 85,
    displayPercentage: pct,
  };
}

// 5. Aisle Categorization Logic
function categorizeAisle(itemName: string): string {
  const lower = itemName.toLowerCase();
  if (
    lower.includes('milk') ||
    lower.includes('cheese') ||
    lower.includes('yogurt') ||
    lower.includes('cream') ||
    lower.includes('butter')
  ) {
    return 'Dairy & Alternatives';
  }
  if (
    lower.includes('apple') ||
    lower.includes('banana') ||
    lower.includes('spinach') ||
    lower.includes('cilantro') ||
    lower.includes('lemon') ||
    lower.includes('avocado') ||
    lower.includes('pepper')
  ) {
    return 'Produce';
  }
  return 'Pantry & Dry Goods';
}

// ============ RUN TESTS ============
export function runTests(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName}`);
    }
  }

  // Test 1: Expiry Status
  assert(calculateExpiryStatus(-1) === 'expired', 'Negative days remaining is expired');
  assert(calculateExpiryStatus(0) === 'expiring_today', '0 days remaining is expiring_today');
  assert(calculateExpiryStatus(2) === 'use_soon', '2 days remaining is use_soon');
  assert(calculateExpiryStatus(3) === 'use_soon', '3 days remaining is use_soon');
  assert(calculateExpiryStatus(10) === 'fresh', '10 days remaining is fresh');

  // Test 2: Recipe 100% Zero-Waste Match
  const skilletReqs = ['Eggs', 'Baby Spinach', 'Cheddar Cheese', 'Red Bell Pepper'];
  const userFridge = ['Baby Spinach', 'Eggs (Organic)', 'Cheddar Cheese', 'Red Bell Pepper'];
  const res100 = evaluateRecipeMatch(skilletReqs, userFridge);
  assert(res100.matchPercentage === 100, 'All ingredients present yields 100% match');
  assert(res100.isFullMatch === true, 'All ingredients present sets isFullMatch to true');
  assert(res100.missing.length === 0, 'No missing ingredients for 100% match');

  // Test 3: Recipe Partial Match with Missing Items
  const chickpeaReqs = ['Greek Yogurt', 'Baby Spinach', 'Red Bell Pepper', 'Canned Chickpeas', 'Tahini'];
  const resPartial = evaluateRecipeMatch(chickpeaReqs, userFridge);
  assert(resPartial.matchPercentage < 100, 'Partial inventory yields < 100% match');
  assert(resPartial.missing.includes('Canned Chickpeas'), 'Correctly flags Canned Chickpeas as missing');
  assert(resPartial.missing.includes('Tahini'), 'Correctly flags Tahini as missing');

  // Test 4: Grocery Deduplication
  const initialList: GroceryItemTest[] = [
    { id: '1', name: 'Avocados', quantity: 2, checked: false },
    { id: '2', name: 'Olive Oil', quantity: 1, checked: true },
  ];
  const merged1 = addOrMergeGroceryItem(initialList, { name: 'Avocados', quantity: 1 });
  assert(merged1.length === 2, 'Does not add duplicate unchecked row for same name');
  assert(merged1[0].quantity === 3, 'Increments existing quantity for unchecked duplicate');

  const merged2 = addOrMergeGroceryItem(initialList, { name: 'Olive Oil', quantity: 1 });
  assert(merged2.length === 3, 'Adds new entry if existing item with same name is already checked');

  // Test 5: AI Confidence Calibration
  const confHigh = calibrateConfidence(0.98);
  assert(confHigh.needsReview === false, '0.98 confidence does not need review');
  assert(confHigh.displayPercentage === 98, 'Correctly displays 98%');

  const confLow = calibrateConfidence(0.76);
  assert(confLow.needsReview === true, '0.76 confidence triggers needsReview flag');
  assert(confLow.displayPercentage === 76, 'Correctly displays 76%');

  // Test 6: Aisle Categorization
  assert(categorizeAisle('Organic Whole Milk') === 'Dairy & Alternatives', 'Milk mapped to Dairy');
  assert(categorizeAisle('Red Bell Pepper') === 'Produce', 'Bell Pepper mapped to Produce');
  assert(categorizeAisle('Brown Basmati Rice') === 'Pantry & Dry Goods', 'Rice mapped to Pantry');

  return { passed, failed, results };
}

// Self-run execution
const summary = runTests();
console.log(`\n========================================`);
console.log(`Mobile Logic Test Results: ${summary.passed} PASSED, ${summary.failed} FAILED`);
console.log(`========================================`);
summary.results.forEach((r) => console.log(r));
if (typeof process !== 'undefined' && summary.failed > 0) {
  process.exit(1);
}
