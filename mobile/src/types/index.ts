export type IngredientCategory =
  | 'Produce'
  | 'Dairy & Egg'
  | 'Dairy / Alt'
  | 'Meat & Seafood'
  | 'Pantry'
  | 'Bakery'
  | 'Beverage'
  | 'Other';

export type ExpiryStatus = 'fresh' | 'use_soon' | 'expiring_today' | 'expired';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expiryDate: string; // ISO date string YYYY-MM-DD
  daysRemaining: number;
  status: ExpiryStatus;
  confidence?: number;
  source: 'ai_scan' | 'manual';
  notes?: string;
  imageUrl?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string; // Aisle name
  quantity: number;
  unit?: string;
  checked: boolean;
  recipeOrigin?: string;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  match_percentage: number;
  prep_time_minutes: number;
  servings: number;
  difficulty: string;
  image_url?: string;
  in_stock_ingredients: string[];
  missing_ingredients: string[];
  instructions: string[];
  dietary_tags: string[];
  crisper_first: boolean;
  expiring_items_used: string[];
}

export interface RecognizedItemReview {
  id: string;
  name: string;
  category: string;
  confidence: number;
  estimated_shelf_life_days: number;
  quantity: number;
  unit: string;
  needs_review: boolean;
  flagged: boolean;
  notes?: string;
}
