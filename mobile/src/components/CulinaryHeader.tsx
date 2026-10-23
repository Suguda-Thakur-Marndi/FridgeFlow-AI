import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CulinaryColors, Typography, Radii, Spacing } from '@/constants/theme';

interface CulinaryHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const CulinaryHeader: React.FC<CulinaryHeaderProps> = ({
  title,
  subtitle = 'FridgeFlow AI',
  showBack = false,
  onBack,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 12 : 8) }]}>
      <View style={styles.contentRow}>
        <View style={styles.leftGroup}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <MaterialIcons name="arrow-back" size={24} color={CulinaryColors.onSurface} />
            </TouchableOpacity>
          ) : (
            <View style={styles.brandIconCircle}>
              <MaterialIcons name="eco" size={20} color={CulinaryColors.onPrimary} />
            </View>
          )}

          <View style={styles.textColumn}>
            {subtitle ? <Text style={styles.subtitle}>{subtitle.toUpperCase()}</Text> : null}
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
          </View>
        </View>

        <View style={styles.rightGroup}>
          {rightAction ? (
            rightAction
          ) : (
            <TouchableOpacity
              style={styles.settingsIconCircle}
              onPress={() => router.push('/settings')}
              activeOpacity={0.7}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <MaterialIcons name="settings" size={20} color={CulinaryColors.onPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(242, 252, 242, 0.95)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(32, 41, 35, 0.08)',
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.margin,
  },
  contentRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: Spacing.xs,
  },
  brandIconCircle: {
    width: 34,
    height: 34,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.full,
    marginLeft: -Spacing.xs,
    marginRight: Spacing.xs,
  },
  textColumn: {
    justifyContent: 'center',
    flexShrink: 1,
  },
  subtitle: {
    ...Typography.labelSm,
    fontSize: 10,
    color: CulinaryColors.secondary,
    letterSpacing: 0.5,
  },
  title: {
    ...Typography.headlineSm,
    fontSize: 18,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
