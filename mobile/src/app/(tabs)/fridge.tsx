import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeIsFocused } from '@/hooks/useSafeIsFocused';
import { useRouter } from 'expo-router';
import { StorageRepository, formatFutureDate } from '@/storage/database';
import { IngredientItemRow } from '@/components/IngredientItemRow';
import { CulinaryHeader } from '@/components/CulinaryHeader';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';
import { Ingredient } from '@/types';

const CATEGORIES = ['All', 'Expiring Soon', 'Produce', 'Dairy & Egg', 'Pantry'];

export default function FridgeScreen() {
  const router = useRouter();
  const isFocused = useSafeIsFocused();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Modal State for Manual Add / Edit
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Produce');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formUnit, setFormUnit] = useState('item');
  const [formDays, setFormDays] = useState('5');
  const [formNotes, setFormNotes] = useState('');

  const loadData = () => {
    const items = StorageRepository.getAllIngredients();
    setIngredients(items);
  };

  useEffect(() => {
    loadData();
  }, [isFocused]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('Produce');
    setFormQuantity('1');
    setFormUnit('item');
    setFormDays('5');
    setFormNotes('');
    setModalVisible(true);
  };

  const handleOpenEditModal = (item: Ingredient) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormQuantity(item.quantity.toString());
    setFormUnit(item.unit);
    setFormDays(item.daysRemaining > 0 ? item.daysRemaining.toString() : '3');
    setFormNotes(item.notes || '');
    setModalVisible(true);
  };

  const handleSaveModal = () => {
    if (!formName.trim()) {
      Alert.alert('Validation Error', 'Please enter an ingredient name.');
      return;
    }

    const qty = Math.max(0.1, parseFloat(formQuantity) || 1.0);
    const days = Math.max(0, parseInt(formDays, 10) || 5);
    const expDate = formatFutureDate(days);

    if (editingItem) {
      StorageRepository.updateIngredient(editingItem.id, {
        name: formName.trim(),
        category: formCategory,
        quantity: qty,
        unit: formUnit.trim() || 'item',
        expiryDate: expDate,
        notes: formNotes.trim(),
      });
    } else {
      StorageRepository.addIngredient({
        name: formName.trim(),
        category: formCategory,
        quantity: qty,
        unit: formUnit.trim() || 'item',
        expiryDate: expDate,
        confidence: 1.0,
        source: 'manual',
        notes: formNotes.trim(),
      });
    }

    setModalVisible(false);
    loadData();
  };

  const handleDeleteItem = (id: string) => {
    Alert.alert(
      'Remove Ingredient',
      'Are you sure you want to remove this item from your fridge?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            StorageRepository.deleteIngredient(id);
            loadData();
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    const item = ingredients.find((i) => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    StorageRepository.updateIngredient(id, { quantity: newQty });
    loadData();
  };

  // Filtered List
  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeCategory === 'All') return true;
    if (activeCategory === 'Expiring Soon') {
      return item.status === 'expiring_today' || item.status === 'use_soon';
    }
    return item.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const expiringList = ingredients.filter(
    (i) => i.status === 'expiring_today' || i.status === 'use_soon'
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <CulinaryHeader
        title="My Fridge"
        subtitle="Inventory"
        rightAction={
          <View style={styles.headerActionsRow}>
            <TouchableOpacity
              style={styles.headerRecipeBtn}
              onPress={() => router.push('/(tabs)/recipes')}
              accessibilityLabel="Go to Recipes"
            >
              <MaterialIcons name="menu-book" size={19} color={CulinaryColors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerAddBtn}
              onPress={handleOpenAddModal}
              accessibilityLabel="Add ingredient"
            >
              <MaterialIcons name="add" size={20} color={CulinaryColors.onPrimary} />
              <Text style={styles.headerAddBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Urgent Crisper Alert Banner */}
        {expiringList.length > 0 && (
          <View style={styles.crisperBanner}>
            <View style={styles.crisperIconBox}>
              <MaterialIcons name="eco" size={18} color={CulinaryColors.primary} />
            </View>
            <View style={styles.crisperTextCol}>
              <View style={styles.crisperTitleRow}>
                <Text style={styles.crisperTitle}>Crisper-First Attention</Text>
                <View style={styles.urgentBadge}>
                  <Text style={styles.urgentBadgeText}>
                    {expiringList.length} items expiring soon
                  </Text>
                </View>
              </View>
              <Text style={styles.crisperBody}>
                {expiringList.map((i) => `${i.name} (${i.daysRemaining}d left)`).join(', ')}
              </Text>
              <TouchableOpacity
                style={styles.crisperRecipeBtn}
                onPress={() => router.push('/(tabs)/recipes')}
                accessibilityLabel="Find recipes using expiring items"
                activeOpacity={0.8}
              >
                <MaterialIcons name="restaurant" size={15} color={CulinaryColors.primary} />
                <Text style={styles.crisperRecipeBtnText}>Find Recipes with Expiring Items</Text>
                <MaterialIcons name="arrow-forward" size={15} color={CulinaryColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Cook with My Fridge Hero Action Card */}
        {ingredients.length > 0 && (
          <TouchableOpacity
            style={styles.cookHeroCard}
            onPress={() => router.push('/(tabs)/recipes')}
            activeOpacity={0.88}
            accessibilityLabel="Cook with fridge ingredients"
          >
            <View style={styles.cookHeroLeft}>
              <View style={styles.cookHeroIconCircle}>
                <MaterialIcons name="restaurant-menu" size={20} color={CulinaryColors.onPrimary} />
              </View>
              <View style={styles.cookHeroTextCol}>
                <Text style={styles.cookHeroTitle}>Cook from Fridge</Text>
                <Text style={styles.cookHeroSubtitle} numberOfLines={1}>
                  {ingredients.length} items ready • Zero-waste
                </Text>
              </View>
            </View>
            <View style={styles.cookHeroBtn}>
              <Text style={styles.cookHeroBtnText}>Recipes</Text>
              <MaterialIcons name="arrow-forward" size={14} color={CulinaryColors.onPrimary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <MaterialIcons name="search" size={20} color={CulinaryColors.outline} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search ingredients in your fridge..."
            placeholderTextColor={CulinaryColors.outline}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="cancel" size={18} color={CulinaryColors.outline} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips Carousel */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveCategory(cat)}
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
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* List of Ingredients */}
        <View style={styles.listContainer}>
          {filteredIngredients.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="kitchen" size={48} color={CulinaryColors.outlineVariant} />
              <Text style={styles.emptyTitle}>No ingredients found</Text>
              <Text style={styles.emptySubtitle}>
                Scan your fridge with AI or add items manually to track your fresh food.
              </Text>
              <View style={styles.emptyBtnRow}>
                <TouchableOpacity
                  style={styles.emptyScanBtn}
                  onPress={() => router.push('/scanner')}
                >
                  <MaterialIcons name="document-scanner" size={18} color={CulinaryColors.onPrimary} />
                  <Text style={styles.emptyScanBtnText}>Scan with AI</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.emptyRecipeBtn}
                  onPress={() => router.push('/(tabs)/recipes')}
                >
                  <MaterialIcons name="menu-book" size={18} color={CulinaryColors.primary} />
                  <Text style={styles.emptyRecipeBtnText}>Browse Recipes</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            filteredIngredients.map((item) => (
              <IngredientItemRow
                key={item.id}
                ingredient={item}
                onUpdateQuantity={handleUpdateQuantity}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteItem}
              />
            ))
          )}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Add / Edit Ingredient Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Edit Ingredient' : 'Add Ingredient'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={CulinaryColors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Ingredient Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Baby Spinach, Farm Eggs"
                placeholderTextColor={CulinaryColors.outline}
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryPickerRow}>
                {['Produce', 'Dairy & Egg', 'Meat & Seafood', 'Pantry'].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.catPickerBtn,
                      formCategory === c && styles.catPickerBtnActive,
                    ]}
                    onPress={() => setFormCategory(c)}
                  >
                    <Text
                      style={[
                        styles.catPickerText,
                        formCategory === c && styles.catPickerTextActive,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={formQuantity}
                    onChangeText={setFormQuantity}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. bag, tub, whole"
                    value={formUnit}
                    onChangeText={setFormUnit}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Estimated Shelf Life (Days from today)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={formDays}
                onChangeText={setFormDays}
              />

              <Text style={styles.inputLabel}>Culinary Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Opened yesterday, organic"
                value={formNotes}
                onChangeText={setFormNotes}
              />
            </ScrollView>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveModal}>
              <MaterialIcons name="save" size={20} color={CulinaryColors.onPrimary} />
              <Text style={styles.saveBtnText}>Save to Fridge</Text>
            </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  contentContainer: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerRecipeBtn: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: CulinaryColors.secondaryContainer,
    ...Elevation.level1,
  },
  headerRecipeBtnText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  headerAddBtn: {
    backgroundColor: CulinaryColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    ...Elevation.level1,
  },
  headerAddBtnText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  crisperBanner: {
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
  crisperTextCol: {
    flex: 1,
  },
  crisperTitleRow: {
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
  urgentBadge: {
    backgroundColor: 'rgba(217, 108, 95, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  urgentBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.warningCoralText,
    fontSize: 10,
  },
  crisperBody: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    lineHeight: 18,
  },
  crisperRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    marginTop: 8,
    borderWidth: 1,
    borderColor: CulinaryColors.primaryFixedDim,
    ...Elevation.level1,
  },
  crisperRecipeBtnText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  cookHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.sm + 2,
    borderWidth: 1,
    borderColor: CulinaryColors.secondaryContainer,
    ...Elevation.level1,
  },
  cookHeroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 4,
  },
  cookHeroIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cookHeroTextCol: {
    flex: 1,
  },
  cookHeroTitle: {
    ...Typography.labelMd,
    fontSize: 13,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  cookHeroSubtitle: {
    ...Typography.bodySm,
    color: CulinaryColors.outline,
    fontSize: 11,
    marginTop: 1,
  },
  cookHeroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CulinaryColors.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.full,
    flexShrink: 0,
  },
  cookHeroBtnText: {
    ...Typography.labelSm,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
    fontSize: 11,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.sm + 4,
    height: 48,
    marginBottom: Spacing.sm,
    ...Elevation.level1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
  },
  chipsScroll: {
    marginHorizontal: -Spacing.margin,
    marginBottom: Spacing.md,
  },
  chipsContainer: {
    paddingHorizontal: Spacing.margin,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainer,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
  },
  chipActive: {
    backgroundColor: CulinaryColors.primary,
  },
  chipText: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurfaceVariant,
  },
  chipTextActive: {
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  listContainer: {
    gap: 2,
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
  emptyScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CulinaryColors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.full,
    marginTop: 12,
  },
  emptyScanBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.onPrimary,
  },
  emptyBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  emptyRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: CulinaryColors.secondaryContainer,
    marginTop: 12,
  },
  emptyRecipeBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  fabRecipe: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: CulinaryColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: Radii.full,
    ...Elevation.level3,
    zIndex: 99,
  },
  fabRecipeText: {
    ...Typography.labelMd,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(32, 41, 35, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  modalForm: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    marginBottom: 4,
    marginTop: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: CulinaryColors.surfaceContainerLow,
    borderRadius: Radii.base,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
  },
  inputRow: {
    flexDirection: 'row',
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  catPickerBtn: {
    backgroundColor: CulinaryColors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  catPickerBtnActive: {
    backgroundColor: CulinaryColors.primary,
  },
  catPickerText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
  },
  catPickerTextActive: {
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  saveBtn: {
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    ...Typography.labelLg,
    color: CulinaryColors.onPrimary,
  },
});
