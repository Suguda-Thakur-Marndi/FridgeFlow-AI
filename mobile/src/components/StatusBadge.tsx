import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CulinaryColors, Typography, Radii, Spacing } from '@/constants/theme';
import { ExpiryStatus } from '@/types';

interface StatusBadgeProps {
  status: ExpiryStatus | 'flagged' | 'confidence' | 'category';
  label?: string;
  confidence?: number;
  daysRemaining?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  confidence,
  daysRemaining,
}) => {
  let bgColor: string = CulinaryColors.secondaryContainer;
  let textColor: string = CulinaryColors.primary;
  let iconName: keyof typeof MaterialIcons.glyphMap = 'check';
  let text = label || '';

  switch (status) {
    case 'expiring_today':
      bgColor = 'rgba(217, 108, 95, 0.2)';
      textColor = CulinaryColors.warningCoralText;
      iconName = 'warning';
      text = label || 'Expiring Today';
      break;

    case 'use_soon':
      bgColor = 'rgba(233, 185, 73, 0.25)';
      textColor = CulinaryColors.tertiaryContainer;
      iconName = 'timer';
      text = label || (daysRemaining !== undefined ? `Best within ${daysRemaining} days` : 'Use Soon');
      break;

    case 'fresh':
      bgColor = 'rgba(168, 197, 160, 0.25)';
      textColor = CulinaryColors.primary;
      iconName = 'event-available';
      text = label || (daysRemaining !== undefined ? `${daysRemaining} days left` : 'Freshly Added');
      break;

    case 'expired':
      bgColor = CulinaryColors.errorContainer;
      textColor = CulinaryColors.onErrorContainer;
      iconName = 'error-outline';
      text = label || 'Expired';
      break;

    case 'flagged':
      bgColor = CulinaryColors.errorContainer;
      textColor = CulinaryColors.onErrorContainer;
      iconName = 'flag';
      text = label || 'Flagged';
      break;

    case 'confidence':
      const confPct = Math.round((confidence ?? 0.9) * 100);
      const isUncertain = confPct < 85;
      bgColor = isUncertain ? CulinaryColors.tertiaryFixed : 'rgba(205, 235, 196, 0.7)';
      textColor = isUncertain ? CulinaryColors.onTertiaryFixed : CulinaryColors.onSecondaryContainer;
      iconName = isUncertain ? 'help-outline' : 'verified';
      text = `${confPct}%`;
      break;

    case 'category':
      bgColor = CulinaryColors.surfaceContainer;
      textColor = CulinaryColors.secondary;
      iconName = 'label';
      text = label || 'Item';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <MaterialIcons name={iconName} size={13} color={textColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    ...Typography.labelSm,
    fontWeight: '600',
  },
});
