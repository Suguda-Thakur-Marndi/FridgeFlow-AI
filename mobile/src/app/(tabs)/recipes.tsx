import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { StorageRepository } from '@/storage/database';
import { ApiService } from '@/services/api';
import { RecipeCard } from '@/components/RecipeCard';
import { CulinaryHeader } from '@/components/CulinaryHeader';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';
import { Recipe } from '@/types';

const RECIPE_FILTERS = [
  'All Recipes',
  'Zero Waste (100% Match)',
  'High Protein',
  'Quick (< 20m)',
  'Vegetarian',
];

export default function RecipesScreen() {
  const isFocused = useIsFocused();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [activeFilter, setActiveFilter] = useState('All Recipes');
  const [promptInput, setPromptInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadRecipes = async () => {
    const ingredients = StorageRepository.getAllIngredients();
    const available = ingredients.map((i) => i.name);
    const expiring = ingredients
      .filter((i) => i.status === 'expiring_today' || i.status === 'use_soon')
      .map((i) => i.name);

    const fetched = await ApiService.getRecipes(available, expiring);
    setRecipes(fetched);
  };

  useEffect(() => {
    loadRecipes();
  }, [isFocused]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddMissingToGrocery = (missingItems: string[], recipeTitle: string) => {
    for (const item of missingItems) {
      StorageRepository.addGroceryItem({
        name: item,
        category: 'Pantry & Dry Goods',
        quantity: 1,
        checked: false,
        recipeOrigin: recipeTitle,
      });
    }
    showToast(`Added ${missingItems.length} missing items to Shopping List!`);
  };

  const handleCookRecipe = (recipe: Recipe) => {
    // Deduct quantities or mark usage in fridge
    showToast(`Bon appétit! Saved recipe to cooking log.`);
  };

  const handleInspirePrompt = () => {
    if (!promptInput.trim()) return;
    showToast(`Generating custom recipe for: "${promptInput}"...`);
    setPromptInput('');
  };

  // Filter recipes
  const filteredRecipes = recipes.filter((r) => {
    if (activeFilter === 'All Recipes') return true;
    if (activeFilter === 'Zero Waste (100% Match)') return r.match_percentage === 100;
    if (activeFilter === 'High Protein') {
      return r.dietary_tags.some((t) => t.toLowerCase().includes('protein'));
    }
    if (activeFilter === 'Quick (< 20m)') {
      return r.prep_time_minutes <= 20;
    }
    if (activeFilter === 'Vegetarian') {
      return r.dietary_tags.some((t) => t.toLowerCase().includes('vegetarian'));
    }
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <CulinaryHeader title="Meal Planner" subtitle="AI Culinary Engine" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Header Banner */}
        <View style={styles.headerBanner}>
          <View style={styles.engineBadge}>
            <MaterialIcons name="auto-awesome" size={14} color={CulinaryColors.primary} />
            <Text style={styles.engineBadgeText}>AI CULINARY ENGINE</Text>
          </View>
          <Text style={styles.headline}>What can you cook today?</Text>
          <Text style={styles.subheadline}>
            Ranked by zero-waste fridge match &amp; shelf-life priority
          </Text>
        </View>

        {/* Crisper Alert Pill Banner */}
        <View style={styles.crisperPriorityCard}>
          <View style={styles.crisperIconBox}>
            <MaterialIcons name="eco" size={18} color={CulinaryColors.primary} />
          </View>
          <View style={styles.crisperInfo}>
            <View style={styles.crisperHeaderRow}>
              <Text style={styles.crisperTitle}>Crisper-First Priority</Text>
              <View style={styles.itemsExpiringTag}>
                <Text style={styles.itemsExpiringText}>2 items expiring</Text>
              </View>
            </View>
            <Text style={styles.crisperDesc}>
              Using up: <Text style={styles.boldText}>Baby Spinach</Text> (2 days left),{' '}
              <Text style={styles.boldText}>Greek Yogurt</Text> (3 days left).
            </Text>
          </View>
        </View>

        {/* Interactive Filter Chips Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {RECIPE_FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                {isActive && (
                  <MaterialIcons
                    name="check"
                    size={14}
                    color={CulinaryColors.onPrimary}
                    style={{ marginRight: 4 }}
                  />
                )}
                <Text
                  style={[styles.filterChipText, isActive && styles.filterChipTextActive]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Interactive Prompt Pill Bar */}
        <View style={styles.promptBar}>
          <View style={styles.brainIconBox}>
            <MaterialIcons name="psychology" size={18} color={CulinaryColors.primary} />
          </View>
          <TextInput
            style={styles.promptInput}
            placeholder="Prompt AI: 'Warm dinner under 300 kcal'..."
            placeholderTextColor={CulinaryColors.outline}
            value={promptInput}
            onChangeText={setPromptInput}
            onSubmitEditing={handleInspirePrompt}
          />
          <TouchableOpacity style={styles.inspireBtn} onPress={handleInspirePrompt}>
            <Text style={styles.inspireBtnText}>Inspire</Text>
            <MaterialIcons name="send" size={14} color={CulinaryColors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Recipe Cards Stream */}
        <View style={styles.recipesList}>
          {filteredRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onAddMissingToGrocery={handleAddMissingToGrocery}
              onCookRecipe={handleCookRecipe}
            />
          ))}
        </View>

        {/* Bottom AI Prompt Generation Card */}
        <View style={styles.bottomAiCard}>
          <View style={styles.bottomAiIconBox}>
            <MaterialIcons name="cookie" size={22} color={CulinaryColors.secondaryFixed} />
          </View>
          <View style={styles.bottomAiTextCol}>
            <Text style={styles.bottomAiTitle}>Have something else in mind?</Text>
            <Text style={styles.bottomAiSub}>
              Ask AI to invent a recipe with what's inside
            </Text>
          </View>
          <TouchableOpacity
            style={styles.generatePill}
            onPress={() => showToast('Gemma recipe generator ready!')}
          >
            <Text style={styles.generatePillText}>Generate</Text>
            <MaterialIcons name="auto-awesome" size={14} color={CulinaryColors.primary} />
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <MaterialIcons name="check-circle" size={18} color={CulinaryColors.secondaryFixed} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  contentContainer: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerBanner: {
    marginBottom: Spacing.md,
  },
  engineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  engineBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    letterSpacing: 0.5,
  },
  headline: {
    ...Typography.headlineLg,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  subheadline: {
    ...Typography.bodyMd,
    color: CulinaryColors.onSurfaceVariant,
    marginTop: 2,
  },
  crisperPriorityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CulinaryColors.surfaceContainerHigh,
    borderRadius: Radii.xl,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Elevation.level1,
  },
  crisperIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crisperInfo: {
    flex: 1,
  },
  crisperHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  crisperTitle: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  itemsExpiringTag: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  itemsExpiringText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    fontSize: 10,
    fontWeight: '600',
  },
  crisperDesc: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: CulinaryColors.onSurface,
  },
  filterScroll: {
    marginHorizontal: -Spacing.margin,
    marginBottom: Spacing.md,
  },
  filterContainer: {
    paddingHorizontal: Spacing.margin,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  filterChipActive: {
    backgroundColor: CulinaryColors.primary,
  },
  filterChipText: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurfaceVariant,
  },
  filterChipTextActive: {
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  promptBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: 6,
    marginBottom: Spacing.md,
    ...Elevation.level1,
  },
  brainIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  promptInput: {
    flex: 1,
    marginHorizontal: 8,
    ...Typography.bodySm,
    color: CulinaryColors.onSurface,
  },
  inspireBtn: {
    backgroundColor: CulinaryColors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inspireBtnText: {
    ...Typography.labelSm,
    color: CulinaryColors.onPrimary,
    fontWeight: '600',
  },
  recipesList: {
    gap: 4,
  },
  bottomAiCard: {
    backgroundColor: CulinaryColors.primaryContainer,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    ...Elevation.level1,
  },
  bottomAiIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomAiTextCol: {
    flex: 1,
  },
  bottomAiTitle: {
    ...Typography.labelMd,
    color: CulinaryColors.secondaryFixed,
    fontWeight: '700',
  },
  bottomAiSub: {
    ...Typography.bodySm,
    color: CulinaryColors.onPrimaryContainer,
    marginTop: 2,
  },
  generatePill: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  generatePillText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: CulinaryColors.inverseSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.full,
    gap: 8,
    ...Elevation.level3,
  },
  toastText: {
    ...Typography.labelMd,
    color: CulinaryColors.inverseOnSurface,
  },
});
