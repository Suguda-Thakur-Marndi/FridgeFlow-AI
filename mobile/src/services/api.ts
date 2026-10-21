import { Platform } from 'react-native';
import { PreferencesService } from '@/storage/preferences';
import { RecognizedItemReview, Recipe } from '@/types';
import { EdgeVisionEngine, matchLocalRecipes, findLocalSubstitution } from './edgeAI';

export interface ScanApiResponse {
  status: string;
  model_name: string;
  is_live_model?: boolean;
  timestamp: string;
  items_detected: number;
  needs_review_count: number;
  ingredients: Array<{
    name: string;
    category: string;
    confidence: number;
    estimated_shelf_life_days: number;
    quantity: number;
    unit: string;
    needs_review: boolean;
    flagged: boolean;
    notes?: string;
  }>;
  raw_summary?: string;
  processing_time_ms: number;
}

export interface ScanResult {
  ingredients: RecognizedItemReview[];
  modelName: string;
  isLive: boolean;
  isEdgeAI?: boolean;
  inferenceTimeMs?: number;
}

export const ApiService = {
  async checkHealth(): Promise<{ healthy: boolean; model?: string; message?: string; isEdge?: boolean }> {
    try {
      const status = await EdgeVisionEngine.getStatus();
      return {
        healthy: true,
        model: `${status.modelConfig.name} (${status.engine.toUpperCase()})`,
        isEdge: true,
      };
    } catch (err: any) {
      return { healthy: false, message: err?.message || 'Local AI engine error' };
    }
  },

  async scanImage(imageUri: string, options?: { forceRemote?: boolean; onProgress?: (percent: number) => void }): Promise<ScanResult> {
    // Immediate offline return for demo URI placeholder
    if (imageUri.startsWith('demo://')) {
      return this.getOfflineReferenceProfile();
    }

    // Default to 100% On-Device Edge AI (Zero Cloud / No Remote API)
    if (!options?.forceRemote) {
      try {
        const localResult = await EdgeVisionEngine.analyzeFridgeImage(imageUri, {
          onProgress: (_stage, pct) => {
            if (options?.onProgress) options.onProgress(pct);
          },
        });
        return {
          ingredients: localResult.ingredients,
          modelName: localResult.modelName,
          isLive: localResult.isLive,
          isEdgeAI: true,
          inferenceTimeMs: localResult.inferenceTimeMs,
        };
      } catch (edgeErr: any) {
        console.warn('On-device inference error:', edgeErr?.message);
        throw edgeErr;
      }
    }

    const baseUrl = await PreferencesService.getBackendUrl();
    const formData = new FormData();

    // Prepare image payload for React Native vs Web fetch
    let filename = 'fridge_scan.jpg';
    let type = 'image/jpeg';

    if (!imageUri.startsWith('data:') && !imageUri.startsWith('blob:')) {
      const extracted = imageUri.split('/').pop() || 'fridge_scan.jpg';
      const match = /\.(\w+)$/.exec(extracted);
      if (match) {
        filename = extracted;
        type = `image/${match[1]}`;
      }
    } else if (imageUri.startsWith('data:')) {
      const mimeMatch = imageUri.match(/^data:([^;]+);/);
      if (mimeMatch) {
        type = mimeMatch[1];
        const ext = type.split('/')[1] || 'jpg';
        filename = `fridge_scan.${ext}`;
      }
    }

    if (Platform.OS === 'web') {
      try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        formData.append('file', blob, filename);
      } catch (err: any) {
        throw new Error(`Failed to load image file: ${err?.message || 'invalid file URI'}`);
      }
    } else {
      // @ts-ignore: React Native FormData file object signature
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      });
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s aligned with backend inference timeout

      const response = await fetch(`${baseUrl}/api/v1/scan`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          if (errJson.detail) errorDetail = errJson.detail;
        } catch {}
        throw new Error(errorDetail);
      }

      const data: ScanApiResponse = await response.json();
      const items = (data.ingredients || []).map((it, idx) => ({
        id: `detected-${Date.now()}-${idx}`,
        name: it.name,
        category: it.category || 'Produce',
        confidence: it.confidence,
        estimated_shelf_life_days: it.estimated_shelf_life_days || 5,
        quantity: it.quantity || 1.0,
        unit: it.unit || 'item',
        needs_review: it.needs_review || it.confidence < 0.85,
        flagged: it.flagged || false,
        notes: it.notes,
      }));

      return {
        ingredients: items,
        modelName: data.model_name || 'Gemma 3 (4B Multimodal)',
        isLive: Boolean(data.is_live_model),
      };
    } catch (error: any) {
      console.warn('Backend scan failed:', error?.message);
      throw error;
    }
  },

  getOfflineReferenceProfile(): ScanResult {
    return {
      ingredients: [
          {
            id: 'rec-1',
            name: 'Baby Spinach',
            category: 'Produce',
            confidence: 0.98,
            estimated_shelf_life_days: 3,
            quantity: 1,
            unit: 'bag (150g)',
            needs_review: false,
            flagged: false,
            notes: 'Best within 3 days (Expiring soon)',
          },
          {
            id: 'rec-2',
            name: 'Eggs (Organic)',
            category: 'Dairy & Egg',
            confidence: 0.95,
            estimated_shelf_life_days: 10,
            quantity: 6,
            unit: 'large',
            needs_review: false,
            flagged: false,
            notes: 'Best within 10 days',
          },
          {
            id: 'rec-3',
            name: 'Greek Yogurt',
            category: 'Dairy & Egg',
            confidence: 0.84,
            estimated_shelf_life_days: 5,
            quantity: 1,
            unit: '500g tub',
            needs_review: true,
            flagged: false,
            notes: 'Best within 5 days',
          },
          {
            id: 'rec-4',
            name: 'Red Bell Pepper',
            category: 'Produce',
            confidence: 0.92,
            estimated_shelf_life_days: 7,
            quantity: 2,
            unit: 'whole',
            needs_review: false,
            flagged: false,
            notes: 'Best within 7 days',
          },
          {
            id: 'rec-5',
            name: 'Oat Milk (Barista)',
            category: 'Dairy / Alt',
            confidence: 0.76,
            estimated_shelf_life_days: 4,
            quantity: 1,
            unit: '1L (Half full)',
            needs_review: true,
            flagged: true,
            notes: 'Verify brand & open date',
          },
          {
            id: 'rec-6',
            name: 'Cheddar Cheese',
            category: 'Dairy',
            confidence: 0.9,
            estimated_shelf_life_days: 14,
            quantity: 1,
            unit: '200g block',
            needs_review: false,
            flagged: false,
            notes: 'Best within 14 days',
          },
        ],
        modelName: 'Offline Reference Profile (Calibrated for Stitch UI)',
        isLive: false,
      };
  },

  async getRecipes(
    availableIngredients: string[],
    expiringIngredients: string[] = []
  ): Promise<Recipe[]> {
    // 100% On-Device Offline Recipe Matching
    return matchLocalRecipes(availableIngredients, expiringIngredients);
  },

  async getSubstitution(missingIngredient: string, availableIngredients: string[]): Promise<any> {
    // 100% On-Device Offline Culinary Substitutions
    return findLocalSubstitution(missingIngredient, availableIngredients);
  },
};

