import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

export interface BottomTabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string }>;
  };
  descriptors: Record<string, { options?: { tabBarAccessibilityLabel?: string } }>;
  navigation?: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
  navigateToTab?: (routeKey: string) => void;
  [key: string]: any;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = (props) => {
  const { state, descriptors, navigation, navigateToTab } = props;
  const insets = useSafeAreaInsets();

  const getTabConfig = (routeName: string): { label: string; icon: keyof typeof MaterialIcons.glyphMap } => {
    switch (routeName) {
      case 'index':
        return { label: 'Home', icon: 'home' };
      case 'fridge':
        return { label: 'My Fridge', icon: 'kitchen' };
      case 'recipes':
        return { label: 'Recipes', icon: 'menu-book' };
      case 'shopping':
        return { label: 'Shopping', icon: 'shopping-bag' };
      default:
        return { label: routeName, icon: 'circle' };
    }
  };

  return (
    <View
      style={[
        styles.barContainer,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const options = descriptors[route.key]?.options || {};
          const isFocused = state.index === index;
          const { label, icon } = getTabConfig(route.name);

          const onPress = () => {
            if (navigation?.emit) {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            } else if (navigateToTab) {
              navigateToTab(route.key);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel || label}
              testID={`tab-${route.name}`}
              onPress={onPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {/* Sage Pill Active Indicator */}
              <View
                style={[
                  styles.iconPill,
                  isFocused && styles.iconPillActive,
                ]}
              >
                <MaterialIcons
                  name={icon}
                  size={24}
                  color={isFocused ? CulinaryColors.primaryContainer : CulinaryColors.outline}
                />
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(32, 41, 35, 0.08)',
    ...Elevation.level2,
  },
  tabRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xs,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: 60,
    height: 32,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  iconPillActive: {
    backgroundColor: 'rgba(168, 197, 160, 0.35)',
  },
  tabLabel: {
    ...Typography.labelSm,
    marginTop: 2,
  },
  tabLabelActive: {
    color: CulinaryColors.primaryContainer,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: CulinaryColors.outline,
    fontWeight: '500',
  },
});
