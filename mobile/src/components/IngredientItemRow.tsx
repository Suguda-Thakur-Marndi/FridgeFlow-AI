import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ingredient } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

interface IngredientItemRowProps {
  ingredient: Ingredient;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onEdit?: (ingredient: Ingredient) => void;
  onDelete?: (id: string) => void;
}

export const IngredientItemRow: React.FC<IngredientItemRowProps> = ({
  ingredient,
  onUpdateQuantity,
  onEdit,
  onDelete,
}) => {
  const getCategoryIcon = (category: string): keyof typeof MaterialIcons.glyphMap => {
    const c = category.toLowerCase();
    if (c.includes('produce') || c.includes('veg') || c.includes('fruit')) return 'eco';
    if (c.includes('dairy') || c.includes('egg') || c.includes('milk')) return 'egg';
    if (c.includes('meat') || c.includes('seafood') || c.includes('fish')) return 'set-meal';
    if (c.includes('pantry') || c.includes('dry')) return 'kitchen';
    return 'restaurant';
  };

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        {/* Leading Category Avatar */}
        <View style={styles.leadingIconBox}>
          <MaterialIcons
            name={getCategoryIcon(ingredient.category)}
            size={24}
            color={CulinaryColors.primary}
          />
        </View>

        {/* Info Column */}
        <View style={styles.infoColumn}>
          <View style={styles.categoryAndBadgeRow}>
            <Text style={styles.categoryText}>{ingredient.category.toUpperCase()}</Text>
            {ingredient.confidence !== undefined && (
              <StatusBadge status="confidence" confidence={ingredient.confidence} />
            )}
          </View>

          <Text style={styles.nameText} numberOfLines={1}>
            {ingredient.name}
          </Text>

          {/* Expiry Countdown Chip */}
          <View style={styles.expiryRow}>
            <StatusBadge
              status={ingredient.status}
              daysRemaining={ingredient.daysRemaining}
            />
          </View>
        </View>
      </View>

      {/* Bottom Stepper and Actions Row */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyContainer}>
          <Text style={styles.qtyPrefix}>Qty:</Text>
          <Text style={styles.qtyValue}>
            {ingredient.quantity} {ingredient.unit}
          </Text>
        </View>

        <View style={styles.actionsRight}>
          {onUpdateQuantity && (
            <View style={styles.stepperGroup}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onUpdateQuantity(ingredient.id, -1)}
                accessibilityLabel="Decrease quantity"
              >
                <MaterialIcons name="remove" size={16} color={CulinaryColors.onSurface} />
              </TouchableOpacity>

              <Text style={styles.stepperCount}>{ingredient.quantity}</Text>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => onUpdateQuantity(ingredient.id, 1)}
                accessibilityLabel="Increase quantity"
              >
                <MaterialIcons name="add" size={16} color={CulinaryColors.onSurface} />
              </TouchableOpacity>
            </View>
          )}

          {onEdit && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => onEdit(ingredient)}
              accessibilityLabel="Edit item"
            >
              <MaterialIcons name="edit" size={16} color={CulinaryColors.outline} />
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => onDelete(ingredient.id)}
              accessibilityLabel="Delete item"
            >
              <MaterialIcons name="delete-outline" size={16} color={CulinaryColors.warningCoral} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    ...Elevation.level1,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm + 2,
  },
  leadingIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.lg,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  categoryAndBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  categoryText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    letterSpacing: 0.5,
  },
  nameText: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  expiryRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs + 2,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 41, 35, 0.08)',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qtyPrefix: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
  },
  qtyValue: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurface,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.base,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCount: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurface,
    width: 20,
    textAlign: 'center',
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
