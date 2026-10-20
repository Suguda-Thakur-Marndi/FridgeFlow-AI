import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const KEY_BACKEND_URL = '@fridgeflow_backend_url';
const KEY_DIETARY_PREFS = '@fridgeflow_dietary_prefs';
const KEY_ONBOARDED = '@fridgeflow_onboarded';

// Default endpoint suitable for platform: 10.0.2.2 for Android emulator, localhost for web/iOS
const DEFAULT_URL = Platform.select({
  android: 'http://10.0.2.2:8000',
  default: 'http://localhost:8000',
});

export const PreferencesService = {
  async getBackendUrl(): Promise<string> {
    try {
      const url = await AsyncStorage.getItem(KEY_BACKEND_URL);
      return url || DEFAULT_URL;
    } catch {
      return DEFAULT_URL;
    }
  },

  async setBackendUrl(url: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_BACKEND_URL, url.trim());
    } catch (err) {
      console.warn('Failed to save backend URL', err);
    }
  },

  async getDietaryPreferences(): Promise<string[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY_DIETARY_PREFS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async setDietaryPreferences(prefs: string[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_DIETARY_PREFS, JSON.stringify(prefs));
    } catch (err) {
      console.warn('Failed to save dietary preferences', err);
    }
  },

  async isOnboarded(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(KEY_ONBOARDED);
      return val === 'true';
    } catch {
      return false;
    }
  },

  async setOnboarded(val: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY_ONBOARDED, val ? 'true' : 'false');
    } catch (err) {
      console.warn('Failed to save onboarded state', err);
    }
  },
};
