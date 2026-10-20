import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

interface RecipeCardProps {
  recipe: Recipe;
  onAddMissingToGrocery?: (missingItems: string[], recipeTitle: string) => void;
  onCookRecipe?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onAddMissingToGrocery,
  onCookRecipe,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [addedMissing, setAddedMissing] = useState(false);

  const handleAddMissing = () => {
    if (onAddMissingToGrocery && recipe.missing_ingredients.length > 0) {
      onAddMissingToGrocery(recipe.missing_ingredients, recipe.title);
      setAddedMissing(true);
      setTimeout(() => setAddedMissing(false), 3000);
    }
  };

  const isFullMatch = recipe.match_percentage === 100;

  return (
    <View style={styles.cardContainer}>
      {/* Recipe Hero Image with Overlay Badges */}
      <View style={styles.imageWrapper}>
        {recipe.image_url ? (
          <Image source={{ uri: recipe.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="restaurant" size={48} color={CulinaryColors.secondary} />
          </View>
        )}

        {/* Affinity Match Pill */}
        <View
          style={[
            styles.matchPill,
            { backgroundColor: isFullMatch ? CulinaryColors.primary : CulinaryColors.tertiaryFixed },
          ]}
        >
          <MaterialIcons
            name={isFullMatch ? 'verified' : 'pie-chart'}
            size={14}
            color={isFullMatch ? CulinaryColors.secondaryFixed : CulinaryColors.onTertiaryFixed}
          />
          <Text
            style={[
              styles.matchPillText,
              { color: isFullMatch ? CulinaryColors.onPrimary : CulinaryColors.onTertiaryFixed },
            ]}
          >
            {isFullMatch ? '100% Fridge Match • Zero Waste' : `${recipe.match_percentage}% Match`}
          </Text>
        </View>

        {/* Prep Specs Overlay */}
        <View style={styles.specsOverlay}>
          <View style={styles.specItem}>
            <MaterialIcons name="timer" size={13} color="#ffffff" />
            <Text style={styles.specText}>{recipe.prep_time_minutes}m</Text>
          </View>
          <Text style={styles.specBullet}>•</Text>
          <View style={styles.specItem}>
            <MaterialIcons name="group" size={13} color="#ffffff" />
            <Text style={styles.specText}>{recipe.servings} serv</Text>
          </View>
          <Text style={styles.specBullet}>•</Text>
          <Text style={styles.specText}>{recipe.difficulty}</Text>
        </View>
      </View>

      {/* Card Content & Action Bar */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleColumn}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.description}>{recipe.description}</Text>
          </View>
        </View>

        {/* In-Stock Items Utilization */}
        <View style={styles.inStockContainer}>
          <View style={styles.inStockHeader}>
            <MaterialIcons name="check-circle" size={15} color={CulinaryColors.primary} />
            <Text style={styles.inStockHeaderText}>
              Uses {recipe.in_stock_ingredients.length} fridge items
            </Text>
          </View>
          <View style={styles.ingredientChipsRow}>
            {recipe.in_stock_ingredients.map((ing, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Missing Ingredients Alert Box OR Zero Missing Alert */}
        {recipe.missing_ingredients.length > 0 ? (
          <View style={styles.missingAlertBox}>
            <View style={styles.missingTextColumn}>
              <View style={styles.missingLabelRow}>
                <MaterialIcons name="inventory-2" size={14} color={CulinaryColors.onErrorContainer} />
                <Text style={styles.missingLabel}>
                  Missing ({recipe.missing_ingredients.length} items):
                </Text>
              </View>
              <Text style={styles.missingItemsList}>
                {recipe.missing_ingredients.join(', ')}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.addToCartBtn,
                addedMissing && { backgroundColor: CulinaryColors.secondaryContainer },
              ]}
              onPress={handleAddMissing}
              activeOpacity={0.8}
            >
              <MaterialIcons
                name={addedMissing ? 'check' : 'add-shopping-cart'}
                size={14}
                color={CulinaryColors.primary}
              />
              <Text style={styles.addToCartText}>
                {addedMissing ? 'Added!' : 'Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.zeroMissingBanner}>
            <MaterialIcons name="task-alt" size={16} color={CulinaryColors.primary} />
            <Text style={styles.zeroMissingText}>
              0 missing ingredients! You're ready to cook right now.
            </Text>
          </View>
        )}

        {/* Primary CTA: Start Cooking / View Recipe */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <MaterialIcons name="restaurant" size={18} color={CulinaryColors.onPrimary} />
          <Text style={styles.actionBtnText}>
            {isFullMatch ? 'Start Cooking' : 'View Recipe'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recipe Instructions Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{recipe.title}</Text>
                <Text style={styles.modalSubtitle}>
                  {recipe.prep_time_minutes} mins • {recipe.servings} servings • {recipe.category}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <MaterialIcons name="close" size={24} color={CulinaryColors.onSurface} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionHeader}>Required Ingredients</Text>
              <View style={styles.ingredientsList}>
                {recipe.in_stock_ingredients.map((item, idx) => (
                  <View key={`in-${idx}`} style={styles.modalIngRow}>
                    <MaterialIcons name="check" size={16} color={CulinaryColors.primary} />
                    <Text style={styles.modalIngText}>{item} (In fridge)</Text>
                  </View>
                ))}
                {recipe.missing_ingredients.map((item, idx) => (
                  <View key={`miss-${idx}`} style={styles.modalIngRow}>
                    <MaterialIcons name="close" size={16} color={CulinaryColors.error} />
                    <Text style={[styles.modalIngText, { color: CulinaryColors.error }]}>
                      {item} (Missing)
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionHeader}>Step-by-Step Instructions</Text>
              {recipe.instructions.map((step, idx) => (
                <View key={idx} style={styles.stepRow}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}

              <View style={{ height: 32 }} />
            </ScrollView>

            <TouchableOpacity
              style={styles.modalFinishBtn}
              onPress={() => {
                setModalVisible(false);
                if (onCookRecipe) onCookRecipe(recipe);
              }}
            >
              <MaterialIcons name="done" size={20} color={CulinaryColors.onPrimary} />
              <Text style={styles.modalFinishBtnText}>Mark as Cooked (Update Inventory)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Elevation.level1,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: CulinaryColors.surfaceContainer,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLow,
  },
  matchPill: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radii.full,
    gap: 4,
    ...Elevation.level1,
  },
  matchPillText: {
    ...Typography.labelSm,
    fontWeight: '700',
  },
  specsOverlay: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(32, 41, 35, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    gap: 6,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  specText: {
    ...Typography.labelSm,
    color: '#ffffff',
  },
  specBullet: {
    color: CulinaryColors.outlineVariant,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  description: {
    ...Typography.bodySm,
    color: CulinaryColors.secondary,
    marginTop: 2,
  },
  inStockContainer: {
    backgroundColor: CulinaryColors.surfaceContainerLow,
    borderRadius: Radii.md,
    padding: Spacing.sm,
    gap: 6,
  },
  inStockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inStockHeaderText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  ingredientChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  chipText: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurface,
    fontWeight: '500',
  },
  missingAlertBox: {
    backgroundColor: 'rgba(255, 218, 214, 0.45)',
    borderRadius: Radii.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missingTextColumn: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  missingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missingLabel: {
    ...Typography.labelSm,
    color: CulinaryColors.onErrorContainer,
    fontWeight: '600',
  },
  missingItemsList: {
    ...Typography.bodySm,
    color: CulinaryColors.onErrorContainer,
    fontWeight: '500',
    marginTop: 2,
  },
  addToCartBtn: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    ...Elevation.level1,
  },
  addToCartText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  zeroMissingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(205, 235, 196, 0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radii.md,
  },
  zeroMissingText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    flex: 1,
  },
  actionBtn: {
    height: 48,
    backgroundColor: CulinaryColors.primary,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    ...Elevation.level1,
  },
  actionBtnText: {
    ...Typography.labelLg,
    color: CulinaryColors.onPrimary,
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
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.headlineLg,
    color: CulinaryColors.onSurface,
  },
  modalSubtitle: {
    ...Typography.bodySm,
    color: CulinaryColors.secondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScroll: {
    marginVertical: Spacing.sm,
  },
  sectionHeader: {
    ...Typography.labelLg,
    color: CulinaryColors.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  ingredientsList: {
    gap: 6,
  },
  modalIngRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalIngText: {
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    gap: 10,
  },
  stepNumCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    ...Typography.labelSm,
    color: CulinaryColors.onPrimary,
  },
  stepText: {
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
    flex: 1,
    lineHeight: 22,
  },
  modalFinishBtn: {
    height: 48,
    backgroundColor: CulinaryColors.primary,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.sm,
  },
  modalFinishBtnText: {
    ...Typography.labelLg,
    color: CulinaryColors.onPrimary,
  },
});
