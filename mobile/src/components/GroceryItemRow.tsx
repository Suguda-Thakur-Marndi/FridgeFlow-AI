import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GroceryItem } from '@/types';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

interface GroceryItemRowProps {
  item: GroceryItem;
  onToggle: (id: string, checked: boolean) => void;
  onQuantityChange: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}

export const GroceryItemRow: React.FC<GroceryItemRowProps> = ({
  item,
  onToggle,
  onQuantityChange,
  onDelete,
}) => {
  return (
    <View
      style={[
        styles.rowContainer,
        item.checked && styles.rowChecked,
      ]}
    >
      {/* Checkbox & Item Details */}
      <TouchableOpacity
        style={styles.labelSection}
        onPress={() => onToggle(item.id, !item.checked)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.checkboxVisual,
            item.checked && styles.checkboxVisualChecked,
          ]}
        >
          {item.checked && (
            <MaterialIcons name="check" size={16} color={CulinaryColors.onPrimary} />
          )}
        </View>

        <View style={styles.textColumn}>
          <Text
            style={[
              styles.itemTitle,
              item.checked && styles.itemTitleChecked,
            ]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {item.recipeOrigin ? (
            <View style={styles.tagRow}>
              <View style={styles.recipeTag}>
                <MaterialIcons
                  name="local-dining"
                  size={12}
                  color={CulinaryColors.primary}
                  style={{ marginRight: 3 }}
                />
                <Text style={styles.recipeTagText}>{item.recipeOrigin}</Text>
              </View>
            </View>
          ) : item.checked ? (
            <Text style={styles.checkedSubtext}>In basket</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Stepper Controls & Delete */}
      <View style={styles.controlsSection}>
        {!item.checked && (
          <View style={styles.stepperPill}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onQuantityChange(item.id, -1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.stepperSign}>−</Text>
            </TouchableOpacity>

            <Text style={styles.stepperQty}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => onQuantityChange(item.id, 1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={styles.stepperSign}>+</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Delete item"
        >
          <MaterialIcons name="delete-outline" size={20} color={CulinaryColors.outline} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.lg,
    padding: Spacing.sm + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    ...Elevation.level1,
  },
  rowChecked: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    elevation: 0,
    shadowOpacity: 0,
  },
  labelSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxVisual: {
    width: 24,
    height: 24,
    borderRadius: Radii.base,
    backgroundColor: CulinaryColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  checkboxVisualChecked: {
    backgroundColor: CulinaryColors.primary,
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
    fontWeight: '500',
  },
  itemTitleChecked: {
    color: CulinaryColors.outline,
    textDecorationLine: 'line-through',
  },
  checkedSubtext: {
    ...Typography.labelSm,
    color: CulinaryColors.outline,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  recipeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(205, 235, 196, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  recipeTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryContainer,
    fontWeight: '500',
  },
  controlsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLow,
    borderRadius: Radii.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stepperBtn: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperSign: {
    fontSize: 16,
    fontWeight: '700',
    color: CulinaryColors.secondary,
    lineHeight: 18,
  },
  stepperQty: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurface,
    paddingHorizontal: 6,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 4,
  },
});
