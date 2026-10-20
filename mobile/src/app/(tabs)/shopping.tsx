import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Share,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { StorageRepository } from '@/storage/database';
import { GroceryItemRow } from '@/components/GroceryItemRow';
import { CulinaryHeader } from '@/components/CulinaryHeader';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';
import { GroceryItem } from '@/types';

export default function ShoppingScreen() {
  const isFocused = useIsFocused();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [quickAddText, setQuickAddText] = useState('');

  const loadData = () => {
    const list = StorageRepository.getAllGroceryItems();
    setItems(list);
  };

  useEffect(() => {
    loadData();
  }, [isFocused]);

  const handleToggle = (id: string, checked: boolean) => {
    StorageRepository.toggleGroceryItem(id, checked);
    loadData();
  };

  const handleQuantityChange = (id: string, delta: number) => {
    StorageRepository.updateGroceryQuantity(id, delta);
    loadData();
  };

  const handleDelete = (id: string) => {
    StorageRepository.deleteGroceryItem(id);
    loadData();
  };

  const handleClearCompleted = () => {
    StorageRepository.clearCompletedGroceryItems();
    loadData();
  };

  const handleQuickAdd = () => {
    if (!quickAddText.trim()) return;

    // Detect likely aisle category based on keywords
    const lower = quickAddText.toLowerCase();
    let cat = 'Pantry & Dry Goods';
    if (
      lower.includes('milk') ||
      lower.includes('cheese') ||
      lower.includes('yogurt') ||
      lower.includes('cream') ||
      lower.includes('butter')
    ) {
      cat = 'Dairy & Alternatives';
    } else if (
      lower.includes('apple') ||
      lower.includes('banana') ||
      lower.includes('spinach') ||
      lower.includes('cilantro') ||
      lower.includes('lemon') ||
      lower.includes('avocado') ||
      lower.includes('pepper') ||
      lower.includes('onion') ||
      lower.includes('garlic')
    ) {
      cat = 'Produce';
    }

    StorageRepository.addGroceryItem({
      name: quickAddText.trim(),
      category: cat,
      quantity: 1,
      checked: false,
    });

    setQuickAddText('');
    loadData();
  };

  const handleShareList = async () => {
    const uncompleted = items.filter((i) => !i.checked);
    const textLines = [
      '🛒 FridgeFlow AI — Grocery List',
      ...uncompleted.map((i) => `• ${i.name} (x${i.quantity}) [${i.category}]`),
    ].join('\n');

    try {
      await Share.share({ message: textLines });
    } catch (e) {
      console.warn('Share error', e);
    }
  };

  // Group items by category (Aisles)
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.checked).length;
  const percentDone = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;
  const mealPlanCount = items.filter((i) => i.recipeOrigin).length;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <SafeAreaView style={styles.safeArea}>
      <CulinaryHeader title="Shopping List" subtitle="Aisle-Sorted" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Subtitle & Context Banner */}
        <View style={styles.headerSubtitleRow}>
          <View style={styles.headerSubtitleCol}>
            <Text style={styles.headline}>Grocery List</Text>
            <View style={styles.metaRow}>
              <MaterialIcons name="restaurant-menu" size={15} color={CulinaryColors.primary} />
              <Text style={styles.metaText}>
                {totalCount} items total • {mealPlanCount} from planned meals
              </Text>
            </View>
          </View>

          <View style={styles.zeroWasteBadge}>
            <MaterialIcons name="eco" size={15} color={CulinaryColors.primary} />
            <Text style={styles.zeroWasteBadgeText}>Zero-Waste Plan</Text>
          </View>
        </View>

        {/* Top Progress Bento Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeaderRow}>
            <View style={styles.progressIconAndTitle}>
              <View style={styles.progressIconBox}>
                <MaterialIcons name="checklist-rtl" size={20} color={CulinaryColors.onPrimaryContainer} />
              </View>
              <View>
                <Text style={styles.progressTitle}>Shopping Progress</Text>
                <Text style={styles.progressSub}>
                  {checkedCount} of {totalCount} items checked ({percentDone}%)
                </Text>
              </View>
            </View>

            <View style={styles.progressActions}>
              <TouchableOpacity
                style={styles.clearDoneBtn}
                onPress={handleClearCompleted}
                accessibilityLabel="Clear completed items"
              >
                <MaterialIcons name="clear-all" size={16} color={CulinaryColors.secondary} />
                <Text style={styles.clearDoneText}>Clear Done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareBtn}
                onPress={handleShareList}
                accessibilityLabel="Share list"
              >
                <MaterialIcons name="share" size={18} color={CulinaryColors.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar Track */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${percentDone}%` }]} />
          </View>

          {/* Delight Tip Badge */}
          <View style={styles.delightFooterRow}>
            <View style={styles.delightLeft}>
              <MaterialIcons name="lightbulb" size={16} color={CulinaryColors.tertiaryFixedDim} />
              <Text style={styles.delightText}>Organized to match standard aisle flow</Text>
            </View>
            <Text style={styles.syncedText}>Aisles synced</Text>
          </View>
        </View>

        {/* Quick Add Interactive Input Field */}
        <View style={styles.quickAddCard}>
          <MaterialIcons name="add-shopping-cart" size={20} color={CulinaryColors.outline} />
          <TextInput
            style={styles.quickAddInput}
            placeholder="Add item (e.g., Almond milk, olive oil)..."
            placeholderTextColor={CulinaryColors.outline}
            value={quickAddText}
            onChangeText={setQuickAddText}
            onSubmitEditing={handleQuickAdd}
          />
          <TouchableOpacity style={styles.quickAddBtn} onPress={handleQuickAdd}>
            <MaterialIcons name="add" size={20} color={CulinaryColors.onPrimary} />
          </TouchableOpacity>
        </View>

        {/* Categories List Container */}
        {totalCount === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="shopping-bag" size={48} color={CulinaryColors.outlineVariant} />
            <Text style={styles.emptyTitle}>Your grocery list is empty</Text>
            <Text style={styles.emptySubtitle}>
              Items needed for your AI recipes will appear here automatically, or you can add items above.
            </Text>
          </View>
        ) : (
          categories.map((cat) => {
            const catItems = items.filter((i) => i.category === cat);
            if (catItems.length === 0) return null;

            return (
              <View key={cat} style={styles.sectionContainer}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <MaterialIcons
                      name={
                        cat.includes('Produce')
                          ? 'eco'
                          : cat.includes('Dairy')
                          ? 'egg'
                          : 'kitchen'
                      }
                      size={20}
                      color={CulinaryColors.primary}
                    />
                    <Text style={styles.sectionTitle}>{cat}</Text>
                  </View>
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{catItems.length} items</Text>
                  </View>
                </View>

                {catItems.map((item) => (
                  <GroceryItemRow
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    onQuantityChange={handleQuantityChange}
                    onDelete={handleDelete}
                  />
                ))}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerSubtitleCol: {
    flex: 1,
  },
  headline: {
    ...Typography.headlineMd,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  metaText: {
    ...Typography.bodySm,
    color: CulinaryColors.secondary,
  },
  zeroWasteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(205, 235, 196, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 4,
  },
  zeroWasteBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  progressCard: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Elevation.level1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  progressIconAndTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  progressIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTitle: {
    ...Typography.labelLg,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  progressSub: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    marginTop: 1,
  },
  progressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  clearDoneText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
  },
  shareBtn: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: CulinaryColors.surfaceContainerHighest,
    borderRadius: Radii.full,
    overflow: 'hidden',
    padding: 1.5,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CulinaryColors.primaryContainer,
    borderRadius: Radii.full,
  },
  delightFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 41, 35, 0.08)',
  },
  delightLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  delightText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
  },
  syncedText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  quickAddCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.sm + 4,
    height: 48,
    marginBottom: Spacing.lg,
    ...Elevation.level1,
  },
  quickAddInput: {
    flex: 1,
    marginHorizontal: 8,
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
  },
  quickAddBtn: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContainer: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: CulinaryColors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  countBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: Spacing.lg,
    gap: 8,
  },
  emptyTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
  },
  emptySubtitle: {
    ...Typography.bodyMd,
    color: CulinaryColors.outline,
    textAlign: 'center',
    lineHeight: 20,
  },
});
