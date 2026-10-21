import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StorageRepository, formatFutureDate } from '@/storage/database';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';
import { RecognizedItemReview } from '@/types';

const INITIAL_REVIEW_ITEMS: RecognizedItemReview[] = [
  {
    id: 'spinach',
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
    id: 'eggs',
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
    id: 'yogurt',
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
    id: 'pepper',
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
    id: 'oatmilk',
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
    id: 'cheese',
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
];

export default function ReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    data?: string;
    modelName?: string;
    isLive?: string;
  }>();

  const isLive = params.isLive === 'true';
  const modelName = params.modelName || (isLive ? 'Bundled Vision Neural Model (Live)' : 'Calibrated Reference Profile');

  const [items, setItems] = useState<RecognizedItemReview[]>(() => {
    if (params.data) {
      try {
        const parsed = JSON.parse(params.data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.warn('Failed to parse scan params, using fallback');
      }
    }
    return INITIAL_REVIEW_ITEMS;
  });

  const [toastVisible, setToastVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newIngName, setNewIngName] = useState('');
  const [newIngCat, setNewIngCat] = useState('Produce');

  // Edit item state
  const [editingItem, setEditingItem] = useState<RecognizedItemReview | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Produce');
  const [editQuantity, setEditQuantity] = useState('1');
  const [editUnit, setEditUnit] = useState('item');
  const [editShelfLife, setEditShelfLife] = useState('5');

  const handleAdjustCount = (id: string, delta: number) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target && target.quantity + delta <= 0) {
        return prev.filter((it) => it.id !== id);
      }
      return prev.map((it) => {
        if (it.id === id) {
          const newQty = Math.max(1, Math.min(99, it.quantity + delta));
          return { ...it, quantity: newQty };
        }
        return it;
      });
    });
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleStartEdit = (item: RecognizedItemReview) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditQuantity(String(item.quantity));
    setEditUnit(item.unit);
    setEditShelfLife(String(item.estimated_shelf_life_days));
  };

  const handleSaveEdit = () => {
    if (!editingItem || !editName.trim()) return;
    const parsedQty = parseFloat(editQuantity) || 1;
    const parsedDays = parseInt(editShelfLife, 10) || 5;

    setItems((prev) =>
      prev.map((it) => {
        if (it.id === editingItem.id) {
          return {
            ...it,
            name: editName.trim(),
            category: editCategory,
            quantity: parsedQty,
            unit: editUnit.trim() || 'item',
            estimated_shelf_life_days: parsedDays,
            notes: `Best within ${parsedDays} days`,
            needs_review: false,
            flagged: false,
          };
        }
        return it;
      })
    );
    setEditingItem(null);
  };

  const handleConfirmItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return { ...it, needs_review: false, flagged: false };
        }
        return it;
      })
    );
  };

  const handleAddMissingItem = () => {
    if (!newIngName.trim()) return;
    const newItem: RecognizedItemReview = {
      id: 'custom-' + Date.now(),
      name: newIngName.trim(),
      category: newIngCat,
      confidence: 1.0,
      estimated_shelf_life_days: 5,
      quantity: 1,
      unit: 'item',
      needs_review: false,
      flagged: false,
      notes: 'Manually added during scan review',
    };
    setItems((prev) => [...prev, newItem]);
    setNewIngName('');
    setModalVisible(false);
  };

  const handleSaveToFridge = () => {
    // Bulk save items into SQLite
    const toSave = items.map((it) => ({
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unit: it.unit,
      expiryDate: formatFutureDate(it.estimated_shelf_life_days),
      confidence: it.confidence,
      source: 'ai_scan' as const,
      notes: it.notes,
    }));

    StorageRepository.bulkAddIngredients(toSave);

    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      router.replace('/(tabs)/fridge');
    }, 1800);
  };

  const needsReviewCount = items.filter((i) => i.needs_review || i.flagged).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={CulinaryColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Vision Review</Text>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="auto-awesome" size={18} color={CulinaryColors.onPrimary} />
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title & Intro Section */}
        <View style={styles.introSection}>
          <View style={[
            styles.scanCompleteBadge,
            isLive ? { backgroundColor: CulinaryColors.primaryFixed } : { backgroundColor: CulinaryColors.secondaryContainer }
          ]}>
            <MaterialIcons
              name={isLive ? "memory" : "bookmark-border"}
              size={14}
              color={isLive ? CulinaryColors.primary : CulinaryColors.onSecondaryContainer}
            />
            <Text style={[
              styles.scanCompleteText,
              isLive ? { color: CulinaryColors.primary } : { color: CulinaryColors.onSecondaryContainer }
            ]}>
              {isLive ? `ON-DEVICE AI: ${modelName.toUpperCase()}` : `REFERENCE PROFILE: ${modelName.toUpperCase()}`}
            </Text>
          </View>
          <Text style={styles.headline}>Here's what we found</Text>
          <Text style={styles.subheadline}>
            Review &amp; confirm on-device AI detections before saving to your fridge.
          </Text>
        </View>

        {/* Ambient Micro Info Card */}
        <View style={styles.tipCard}>
          <View style={styles.tipIconCircle}>
            <MaterialIcons name="security" size={18} color={CulinaryColors.primary} />
          </View>
          <View style={styles.tipTextCol}>
            <Text style={styles.tipTitle}>
              {isLive ? 'ON-DEVICE INFERENCE (ZERO CLOUD UPLOAD)' : 'OFFLINE CALIBRATION ACTIVE'}
            </Text>
            <Text style={styles.tipBody}>
              {isLive
                ? 'Processed locally inside your device memory with zero network egress. Model confidence is a raw visual similarity score (uncalibrated). Ambiguous or occluded items are flagged for your confirmation.'
                : 'Offline reference items loaded. On-device engine ready for local vision processing.'}
            </Text>
          </View>
        </View>

        {/* Summary Metric Pill Bar */}
        <View style={styles.metricsBar}>
          <View style={styles.metricsLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.metricsText}>{items.length} items detected</Text>
          </View>
          {needsReviewCount > 0 ? (
            <View style={styles.reviewPill}>
              <MaterialIcons name="priority-high" size={14} color={CulinaryColors.onTertiaryFixed} />
              <Text style={styles.reviewPillText}>{needsReviewCount} need review</Text>
            </View>
          ) : (
            <View style={[styles.reviewPill, { backgroundColor: CulinaryColors.secondaryContainer }]}>
              <MaterialIcons name="check" size={14} color={CulinaryColors.primary} />
              <Text style={[styles.reviewPillText, { color: CulinaryColors.primary }]}>
                All confirmed
              </Text>
            </View>
          )}
        </View>

        {/* Detected Items List */}
        <View style={styles.itemsList}>
          {items.map((item) => {
            const isFlagged = item.flagged;
            const needsReview = item.needs_review;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  needsReview && styles.itemCardReview,
                  isFlagged && styles.itemCardFlagged,
                ]}
              >
                {/* Accent line on right edge if review or flagged */}
                {isFlagged ? (
                  <View style={styles.flaggedAccentBar} />
                ) : needsReview ? (
                  <View style={styles.reviewAccentBar} />
                ) : null}

                <View style={styles.itemTopRow}>
                  <View style={styles.itemAvatar}>
                    <MaterialIcons
                      name={
                        item.category.includes('Produce')
                          ? 'eco'
                          : item.category.includes('Dairy')
                          ? 'egg'
                          : 'kitchen'
                      }
                      size={26}
                      color={CulinaryColors.primary}
                    />
                  </View>

                  <View style={styles.itemInfoCol}>
                    <View style={styles.nameAndConfidence}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.categoryLabel}>{item.category.toUpperCase()}</Text>
                        <Text style={styles.itemName}>{item.name}</Text>
                      </View>

                      {isFlagged ? (
                        <View style={styles.flaggedBadge}>
                          <MaterialIcons name="flag" size={12} color={CulinaryColors.onErrorContainer} />
                          <Text style={styles.flaggedBadgeText}>Flagged</Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.confBadge,
                            needsReview && { backgroundColor: CulinaryColors.tertiaryFixed },
                          ]}
                        >
                          <MaterialIcons
                            name={needsReview ? 'help-outline' : 'verified'}
                            size={12}
                            color={
                              needsReview
                                ? CulinaryColors.onTertiaryFixed
                                : CulinaryColors.onSecondaryContainer
                            }
                          />
                          <Text
                            style={[
                              styles.confBadgeText,
                              needsReview && { color: CulinaryColors.onTertiaryFixed },
                            ]}
                          >
                            {Math.round(item.confidence * 100)}%
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Shelf-Life Note */}
                    <View style={styles.shelfLifeRow}>
                      <MaterialIcons
                        name={isFlagged ? 'warning' : 'timer'}
                        size={14}
                        color={isFlagged ? CulinaryColors.error : CulinaryColors.tertiaryContainer}
                      />
                      <Text
                        style={[
                          styles.shelfLifeText,
                          isFlagged && { color: CulinaryColors.onErrorContainer, fontWeight: '600' },
                        ]}
                      >
                        {item.notes || `Best within ${item.estimated_shelf_life_days} days`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Bottom Stepper and Action Row */}
                <View style={styles.itemBottomRow}>
                  <View style={styles.qtyLabelGroup}>
                    <Text style={styles.qtyTextPrefix}>Qty:</Text>
                    <Text style={styles.qtyLabel}>{item.unit}</Text>
                  </View>

                  <View style={styles.actionsRightGroup}>
                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleStartEdit(item)}
                      accessibilityLabel={`Edit ${item.name}`}
                    >
                      <MaterialIcons name="edit" size={15} color={CulinaryColors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconActionBtn}
                      onPress={() => handleRemoveItem(item.id)}
                      accessibilityLabel={`Remove ${item.name}`}
                    >
                      <MaterialIcons name="delete-outline" size={17} color={CulinaryColors.error} />
                    </TouchableOpacity>

                    {needsReview || isFlagged ? (
                      <TouchableOpacity
                        style={styles.verifyBtn}
                        onPress={() => handleConfirmItem(item.id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.verifyBtnText}>Confirm</Text>
                        <MaterialIcons name="check" size={14} color={CulinaryColors.onPrimaryFixedVariant} />
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.stepperWrap}>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => handleAdjustCount(item.id, -1)}
                        >
                          <MaterialIcons name="remove" size={16} color={CulinaryColors.onSurface} />
                        </TouchableOpacity>
                        <Text style={styles.stepCount}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.stepBtn}
                          onPress={() => handleAdjustCount(item.id, 1)}
                        >
                          <MaterialIcons name="add" size={16} color={CulinaryColors.onSurface} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Add Missing Ingredient Action Card */}
        <TouchableOpacity
          style={styles.addMissingCard}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.addIconCircle}>
            <MaterialIcons name="add" size={20} color={CulinaryColors.primary} />
          </View>
          <Text style={styles.addMissingText}>Add Missing Ingredient</Text>
        </TouchableOpacity>

        {/* Delight Micro-Prompt */}
        <View style={styles.delightPrompt}>
          <MaterialIcons name="eco" size={20} color={CulinaryColors.secondary} />
          <Text style={styles.delightPromptText}>
            Adding these helps generate <Text style={styles.boldText}>zero-waste recipes</Text> with ingredients you already own.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Bottom Action Bar */}
      <View style={styles.bottomActionBar}>
        <TouchableOpacity style={styles.scanAgainBtn} onPress={() => router.back()}>
          <MaterialIcons name="photo-camera" size={20} color={CulinaryColors.onSurface} />
          <Text style={styles.scanAgainText}>Scan Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.confirmSaveBtn} onPress={handleSaveToFridge}>
          <Text style={styles.confirmSaveText}>Add {items.length} Items to Fridge</Text>
          <MaterialIcons name="arrow-forward" size={20} color={CulinaryColors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Toast Notification */}
      {toastVisible && (
        <View style={styles.toast}>
          <MaterialIcons name="check-circle" size={20} color={CulinaryColors.secondaryFixed} />
          <Text style={styles.toastText}>Ingredients saved to your Fridge!</Text>
        </View>
      )}

      {/* Add Missing Item Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add Missing Ingredient</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Carrots, Butter, Garlic"
              placeholderTextColor={CulinaryColors.outline}
              value={newIngName}
              onChangeText={setNewIngName}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddMissingItem}>
                <Text style={styles.modalAddText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Item Modal */}
      <Modal visible={Boolean(editingItem)} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Ingredient</Text>
            <Text style={styles.modalFieldLabel}>Ingredient Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Baby Spinach, Milk"
              placeholderTextColor={CulinaryColors.outline}
              value={editName}
              onChangeText={setEditName}
            />

            <View style={styles.modalRow2Col}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalFieldLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="1"
                  placeholderTextColor={CulinaryColors.outline}
                  value={editQuantity}
                  onChangeText={setEditQuantity}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.modalFieldLabel}>Unit</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="item, bag, bottle"
                  placeholderTextColor={CulinaryColors.outline}
                  value={editUnit}
                  onChangeText={setEditUnit}
                />
              </View>
            </View>

            <Text style={styles.modalFieldLabel}>Shelf-Life (Days)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="5"
              placeholderTextColor={CulinaryColors.outline}
              value={editShelfLife}
              onChangeText={setEditShelfLife}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingItem(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddBtn} onPress={handleSaveEdit}>
                <Text style={styles.modalAddText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.sm,
    backgroundColor: CulinaryColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(32, 41, 35, 0.08)',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  contentContainer: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  introSection: {
    marginBottom: Spacing.sm,
  },
  scanCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(205, 235, 196, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 6,
  },
  scanCompleteText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryContainer,
    fontWeight: '700',
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
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(225, 235, 225, 0.7)',
    borderRadius: Radii.lg,
    padding: Spacing.sm + 4,
    marginVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tipIconCircle: {
    width: 30,
    height: 30,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipTextCol: {
    flex: 1,
  },
  tipTitle: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
    fontWeight: '700',
  },
  tipBody: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    marginTop: 2,
    lineHeight: 18,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
    ...Elevation.level1,
  },
  metricsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CulinaryColors.primary,
  },
  metricsText: {
    ...Typography.labelLg,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  reviewPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.tertiaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  reviewPillText: {
    ...Typography.labelSm,
    color: CulinaryColors.onTertiaryFixed,
    fontWeight: '700',
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.sm + 4,
    position: 'relative',
    overflow: 'hidden',
    ...Elevation.level1,
  },
  itemCardReview: {
    borderColor: CulinaryColors.tertiaryFixedDim,
  },
  itemCardFlagged: {
    borderColor: CulinaryColors.errorContainer,
  },
  reviewAccentBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 4,
    backgroundColor: CulinaryColors.tertiaryFixedDim,
  },
  flaggedAccentBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 4,
    backgroundColor: CulinaryColors.errorContainer,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  itemAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radii.base,
    backgroundColor: CulinaryColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfoCol: {
    flex: 1,
  },
  nameAndConfidence: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  categoryLabel: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    letterSpacing: 0.5,
  },
  itemName: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  confBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(205, 235, 196, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 2,
  },
  confBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryContainer,
    fontWeight: '700',
  },
  flaggedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.errorContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 2,
  },
  flaggedBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.onErrorContainer,
    fontWeight: '700',
  },
  shelfLifeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  shelfLifeText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(236, 246, 237, 0.6)',
    marginHorizontal: -(Spacing.sm + 4),
    marginBottom: -(Spacing.sm + 4),
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 8,
    borderBottomLeftRadius: Radii.xl,
    borderBottomRightRadius: Radii.xl,
  },
  qtyLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyTextPrefix: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
  },
  qtyLabel: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurface,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.base,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurface,
    width: 20,
    textAlign: 'center',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.primaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 4,
  },
  verifyBtnText: {
    ...Typography.labelSm,
    color: CulinaryColors.onPrimaryFixedVariant,
    fontWeight: '700',
  },
  addMissingCard: {
    marginTop: Spacing.md,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    padding: Spacing.md,
    borderRadius: Radii.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Elevation.level1,
  },
  addIconCircle: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMissingText: {
    ...Typography.labelLg,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  delightPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLow,
    padding: Spacing.sm + 4,
    borderRadius: Radii.lg,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  delightPromptText: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
    color: CulinaryColors.onSurface,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(242, 252, 242, 0.98)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 41, 35, 0.08)',
    paddingHorizontal: Spacing.margin,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...Elevation.level3,
  },
  scanAgainBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scanAgainText: {
    ...Typography.labelLg,
    color: CulinaryColors.onSurface,
  },
  confirmSaveBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Elevation.level2,
  },
  confirmSaveText: {
    ...Typography.labelLg,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    bottom: 90,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBox: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    marginBottom: Spacing.sm,
  },
  modalInput: {
    backgroundColor: CulinaryColors.surfaceContainerLow,
    borderRadius: Radii.base,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
    marginBottom: Spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelText: {
    ...Typography.labelMd,
    color: CulinaryColors.outline,
  },
  modalAddBtn: {
    backgroundColor: CulinaryColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  modalAddText: {
    ...Typography.labelMd,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  actionsRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFieldLabel: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
    marginBottom: 4,
    fontWeight: '600',
  },
  modalRow2Col: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
