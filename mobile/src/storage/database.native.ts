import * as SQLite from 'expo-sqlite';
import { Ingredient, GroceryItem, ExpiryStatus } from '@/types';
import { IStorageRepository } from './types';

const DB_NAME = 'fridgeflow.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync(DB_NAME);
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: SQLite.SQLiteDatabase) {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1.0,
      unit TEXT NOT NULL DEFAULT 'item',
      expiry_date TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      source TEXT DEFAULT 'manual',
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS grocery_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 1.0,
      unit TEXT,
      checked INTEGER NOT NULL DEFAULT 0,
      recipe_origin TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

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

export const StorageRepository: IStorageRepository = {
  // ---- INGREDIENTS ----
  getAllIngredients(): Ingredient[] {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiry_date: string;
      confidence: number;
      source: 'ai_scan' | 'manual';
      notes?: string;
    }>('SELECT * FROM ingredients ORDER BY expiry_date ASC');

    return rows.map((r) => {
      const { daysRemaining, status } = calculateExpiryInfo(r.expiry_date);
      return {
        id: r.id,
        name: r.name,
        category: r.category,
        quantity: r.quantity,
        unit: r.unit,
        expiryDate: r.expiry_date,
        daysRemaining,
        status,
        confidence: r.confidence,
        source: r.source,
        notes: r.notes,
      };
    });
  },

  addIngredient(item: Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>): Ingredient {
    const db = getDatabase();
    const id = 'ing-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();

    db.runSync(
      `INSERT INTO ingredients (id, name, category, quantity, unit, expiry_date, confidence, source, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.name,
        item.category,
        item.quantity,
        item.unit,
        item.expiryDate,
        item.confidence ?? 1.0,
        item.source,
        item.notes ?? '',
        now,
      ]
    );

    const { daysRemaining, status } = calculateExpiryInfo(item.expiryDate);
    return {
      ...item,
      id,
      daysRemaining,
      status,
    };
  },

  updateIngredient(id: string, updates: Partial<Ingredient>) {
    const db = getDatabase();
    const existing = db.getFirstSync<{
      name: string;
      category: string;
      quantity: number;
      unit: string;
      expiry_date: string;
      notes?: string;
    }>('SELECT * FROM ingredients WHERE id = ?', [id]);

    if (!existing) return;

    db.runSync(
      `UPDATE ingredients
       SET name = ?, category = ?, quantity = ?, unit = ?, expiry_date = ?, notes = ?
       WHERE id = ?`,
      [
        updates.name ?? existing.name,
        updates.category ?? existing.category,
        updates.quantity ?? existing.quantity,
        updates.unit ?? existing.unit,
        updates.expiryDate ?? existing.expiry_date,
        updates.notes ?? existing.notes ?? '',
        id,
      ]
    );
  },

  deleteIngredient(id: string) {
    const db = getDatabase();
    db.runSync('DELETE FROM ingredients WHERE id = ?', [id]);
  },

  bulkAddIngredients(items: Array<Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>>) {
    const db = getDatabase();
    db.withTransactionSync(() => {
      for (const it of items) {
        const id = 'ing-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        const now = new Date().toISOString();
        db.runSync(
          `INSERT INTO ingredients (id, name, category, quantity, unit, expiry_date, confidence, source, notes, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            it.name,
            it.category,
            it.quantity,
            it.unit,
            it.expiryDate,
            it.confidence ?? 1.0,
            it.source,
            it.notes ?? '',
            now,
          ]
        );
      }
    });
  },

  // ---- GROCERY LIST ----
  getAllGroceryItems(): GroceryItem[] {
    const db = getDatabase();
    const rows = db.getAllSync<{
      id: string;
      name: string;
      category: string;
      quantity: number;
      unit?: string;
      checked: number;
      recipe_origin?: string;
      notes?: string;
    }>('SELECT * FROM grocery_items ORDER BY checked ASC, category ASC, created_at DESC');

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      quantity: r.quantity,
      unit: r.unit,
      checked: r.checked === 1,
      recipeOrigin: r.recipe_origin,
      notes: r.notes,
    }));
  },

  addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem {
    const db = getDatabase();
    const existing = db.getFirstSync<{ id: string; quantity: number }>(
      'SELECT id, quantity FROM grocery_items WHERE LOWER(name) = LOWER(?) AND checked = 0',
      [item.name.trim()]
    );

    if (existing) {
      db.runSync('UPDATE grocery_items SET quantity = quantity + ? WHERE id = ?', [item.quantity, existing.id]);
      return { ...item, id: existing.id, quantity: existing.quantity + item.quantity };
    }

    const id = 'groc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const now = new Date().toISOString();
    db.runSync(
      `INSERT INTO grocery_items (id, name, category, quantity, unit, checked, recipe_origin, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, item.name.trim(), item.category, item.quantity, item.unit ?? '', item.checked ? 1 : 0, item.recipeOrigin ?? '', now]
    );

    return { ...item, id };
  },

  toggleGroceryItem(id: string, checked: boolean) {
    const db = getDatabase();
    db.runSync('UPDATE grocery_items SET checked = ? WHERE id = ?', [checked ? 1 : 0, id]);
  },

  updateGroceryQuantity(id: string, delta: number) {
    const db = getDatabase();
    const row = db.getFirstSync<{ quantity: number }>('SELECT quantity FROM grocery_items WHERE id = ?', [id]);
    if (!row) return;
    const newQty = Math.max(1, Math.min(99, row.quantity + delta));
    db.runSync('UPDATE grocery_items SET quantity = ? WHERE id = ?', [newQty, id]);
  },

  deleteGroceryItem(id: string) {
    const db = getDatabase();
    db.runSync('DELETE FROM grocery_items WHERE id = ?', [id]);
  },

  clearCompletedGroceryItems() {
    const db = getDatabase();
    db.runSync('DELETE FROM grocery_items WHERE checked = 1');
  },

  seedDataIfEmpty() {
    const db = getDatabase();
    const count = db.getFirstSync<{ c: number }>('SELECT COUNT(*) as c FROM ingredients');
    if (count && count.c > 0) {
      return;
    }

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
    const db = getDatabase();
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM ingredients');
      db.runSync('DELETE FROM grocery_items');
    });
  },

  resetToSampleData() {
    this.clearAllData();
    this.seedDataIfEmpty();
  },
};
