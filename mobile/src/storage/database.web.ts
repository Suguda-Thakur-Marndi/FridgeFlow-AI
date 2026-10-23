import { Ingredient, GroceryItem, ExpiryStatus } from '@/types';
import { IStorageRepository } from './types';

const INGREDIENTS_KEY = 'fridgeflow_web_ingredients_v1';
const GROCERY_KEY = 'fridgeflow_web_groceries_v1';

export function calculateExpiryInfo(expiryDateStr: string): { daysRemaining: number; status: ExpiryStatus } {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = expiryDateStr.split('-');
    const expDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    expDate.setHours(0, 0, 0, 0);

    const diffTime = expDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: ExpiryStatus = 'fresh';
    if (daysRemaining < 0) {
      status = 'expired';
    } else if (daysRemaining === 0) {
      status = 'expiring_today';
    } else if (daysRemaining <= 3) {
      status = 'use_soon';
    } else {
      status = 'fresh';
    }

    return { daysRemaining, status };
  } catch {
    return { daysRemaining: 5, status: 'fresh' };
  }
}

export function formatFutureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// In-memory fallback if localStorage is restricted
const memoryStorage: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return memoryStorage[key] ?? null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  memoryStorage[key] = value;
}

function loadIngredients(): any[] {
  const raw = safeGetItem(INGREDIENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveIngredients(items: any[]): void {
  safeSetItem(INGREDIENTS_KEY, JSON.stringify(items));
}

function loadGroceries(): any[] {
  const raw = safeGetItem(GROCERY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveGroceries(items: any[]): void {
  safeSetItem(GROCERY_KEY, JSON.stringify(items));
}

export const StorageRepository: IStorageRepository = {
  // ---- INGREDIENTS ----
  getAllIngredients(): Ingredient[] {
    const rawItems = loadIngredients();
    const sorted = [...rawItems].sort((a, b) => (a.expiryDate || '').localeCompare(b.expiryDate || ''));
    return sorted.map((r) => {
      const { daysRemaining, status } = calculateExpiryInfo(r.expiryDate);
      return {
        ...r,
        daysRemaining,
        status,
      };
    });
  },

  addIngredient(item: Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>): Ingredient {
    const id = 'ing-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const { daysRemaining, status } = calculateExpiryInfo(item.expiryDate);
    const newItem: Ingredient = {
      ...item,
      id,
      daysRemaining,
      status,
    };
    const items = loadIngredients();
    items.push(newItem);
    saveIngredients(items);
    return newItem;
  },

  updateIngredient(id: string, updates: Partial<Ingredient>) {
    const items = loadIngredients();
    const idx = items.findIndex((it) => it.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      saveIngredients(items);
    }
  },

  deleteIngredient(id: string) {
    const items = loadIngredients();
    const filtered = items.filter((it) => it.id !== id);
    saveIngredients(filtered);
  },

  bulkAddIngredients(newItems: Array<Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>>) {
    const items = loadIngredients();
    for (const it of newItems) {
      const id = 'ing-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      const { daysRemaining, status } = calculateExpiryInfo(it.expiryDate);
      items.push({
        ...it,
        id,
        daysRemaining,
        status,
      });
    }
    saveIngredients(items);
  },

  // ---- GROCERY LIST ----
  getAllGroceryItems(): GroceryItem[] {
    const raw = loadGroceries();
    // Sort unchecked first, then by category, then created date
    return [...raw].sort((a, b) => {
      if (a.checked !== b.checked) return a.checked ? 1 : -1;
      return (a.category || '').localeCompare(b.category || '');
    });
  },

  addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem {
    const items = loadGroceries();
    const existing = items.find(
      (it) => it.name.trim().toLowerCase() === item.name.trim().toLowerCase() && !it.checked
    );

    if (existing) {
      existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
      saveGroceries(items);
      return existing;
    }

    const id = 'groc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newItem: GroceryItem = {
      ...item,
      id,
    };
    items.unshift(newItem);
    saveGroceries(items);
    return newItem;
  },

  toggleGroceryItem(id: string, checked: boolean) {
    const items = loadGroceries();
    const found = items.find((it) => it.id === id);
    if (found) {
      found.checked = checked;
      saveGroceries(items);
    }
  },

  updateGroceryQuantity(id: string, delta: number) {
    const items = loadGroceries();
    const found = items.find((it) => it.id === id);
    if (found) {
      found.quantity = Math.max(1, Math.min(99, (found.quantity || 1) + delta));
      saveGroceries(items);
    }
  },

  deleteGroceryItem(id: string) {
    const items = loadGroceries();
    const filtered = items.filter((it) => it.id !== id);
    saveGroceries(filtered);
  },

  clearCompletedGroceryItems() {
    const items = loadGroceries();
    const remaining = items.filter((it) => !it.checked);
    saveGroceries(remaining);
  },

  seedDataIfEmpty() {
    const items = loadIngredients();
    if (items.length > 0) return;

    const sampleIngredients: Array<Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>> = [
      {
        name: 'Baby Spinach',
        category: 'Produce',
        quantity: 1,
        unit: 'bag (150g)',
        expiryDate: formatFutureDate(2),
        confidence: 0.98,
        source: 'ai_scan',
        notes: 'Best within 2 days • Crisper Priority',
      },
      {
        name: 'Eggs (Organic)',
        category: 'Dairy & Egg',
        quantity: 6,
        unit: 'large',
        expiryDate: formatFutureDate(10),
        confidence: 0.95,
        source: 'ai_scan',
        notes: 'Best within 10 days',
      },
      {
        name: 'Greek Yogurt',
        category: 'Dairy & Egg',
        quantity: 1,
        unit: '500g tub',
        expiryDate: formatFutureDate(3),
        confidence: 0.84,
        source: 'ai_scan',
        notes: 'Best within 3 days • Verified size',
      },
      {
        name: 'Red Bell Pepper',
        category: 'Produce',
        quantity: 2,
        unit: 'whole',
        expiryDate: formatFutureDate(7),
        confidence: 0.92,
        source: 'ai_scan',
        notes: 'Best within 7 days',
      },
      {
        name: 'Oat Milk (Barista)',
        category: 'Dairy / Alt',
        quantity: 1,
        unit: '1L',
        expiryDate: formatFutureDate(4),
        confidence: 0.76,
        source: 'ai_scan',
        notes: 'Opened 3 days ago',
      },
      {
        name: 'Cheddar Cheese',
        category: 'Dairy',
        quantity: 1,
        unit: '200g block',
        expiryDate: formatFutureDate(14),
        confidence: 0.9,
        source: 'ai_scan',
        notes: 'Mature sharp cheddar',
      },
    ];

    this.bulkAddIngredients(sampleIngredients);

    const sampleGroceries: Array<Omit<GroceryItem, 'id'>> = [
      {
        name: 'Avocados (3 pack)',
        category: 'Produce',
        quantity: 1,
        unit: 'pack',
        checked: false,
        recipeOrigin: 'For Salad',
      },
      {
        name: 'Lemons (2 whole)',
        category: 'Produce',
        quantity: 2,
        unit: 'whole',
        checked: true,
        recipeOrigin: 'Pantry staple',
      },
      {
        name: 'Fresh Cilantro (1 bunch)',
        category: 'Produce',
        quantity: 1,
        unit: 'bunch',
        checked: false,
        recipeOrigin: 'Chickpea Bowl recipe',
      },
      {
        name: 'Canned Chickpeas (2 cans - 400g)',
        category: 'Pantry & Dry Goods',
        quantity: 2,
        unit: 'cans',
        checked: false,
        recipeOrigin: 'Crispy Chickpea Bowl',
      },
      {
        name: 'Tahini Paste (1 jar)',
        category: 'Pantry & Dry Goods',
        quantity: 1,
        unit: 'jar',
        checked: false,
        recipeOrigin: 'Crispy Chickpea Bowl',
      },
      {
        name: 'Extra Virgin Olive Oil',
        category: 'Pantry & Dry Goods',
        quantity: 1,
        unit: 'bottle',
        checked: true,
        recipeOrigin: 'Pantry staple',
      },
      {
        name: 'Heavy Cream',
        category: 'Dairy & Alternatives',
        quantity: 1,
        unit: 'carton',
        checked: false,
        recipeOrigin: 'Vegetable Frittata',
      },
    ];

    for (const g of sampleGroceries) {
      this.addGroceryItem(g);
    }
  },

  clearAllData() {
    saveIngredients([]);
    saveGroceries([]);
  },

  resetToSampleData() {
    this.clearAllData();
    this.seedDataIfEmpty();
  },
};
