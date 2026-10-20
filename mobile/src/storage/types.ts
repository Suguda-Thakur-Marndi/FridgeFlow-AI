import { Ingredient, GroceryItem, ExpiryStatus } from '@/types';

export interface IIngredientRepository {
  getAllIngredients(): Ingredient[];
  addIngredient(item: Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>): Ingredient;
  updateIngredient(id: string, updates: Partial<Ingredient>): void;
  deleteIngredient(id: string): void;
  bulkAddIngredients(items: Array<Omit<Ingredient, 'id' | 'daysRemaining' | 'status'>>): void;
}

export interface IShoppingListRepository {
  getAllGroceryItems(): GroceryItem[];
  addGroceryItem(item: Omit<GroceryItem, 'id'>): GroceryItem;
  toggleGroceryItem(id: string, checked: boolean): void;
  updateGroceryQuantity(id: string, delta: number): void;
  deleteGroceryItem(id: string): void;
  clearCompletedGroceryItems(): void;
}

export interface IPreferencesRepository {
  getBackendUrl(): Promise<string>;
  setBackendUrl(url: string): Promise<void>;
  getDietaryPreferences(): Promise<string[]>;
  setDietaryPreferences(prefs: string[]): Promise<void>;
  getNotificationsEnabled(): Promise<boolean>;
  setNotificationsEnabled(enabled: boolean): Promise<void>;
  getOfflineMode(): Promise<boolean>;
  setOfflineMode(enabled: boolean): Promise<void>;
}

export interface IStorageRepository extends IIngredientRepository, IShoppingListRepository {
  seedDataIfEmpty(): void;
}
