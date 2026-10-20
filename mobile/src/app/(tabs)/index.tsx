import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';
import { StorageRepository } from '@/storage/database';
import { PreferencesService } from '@/storage/preferences';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';
import { Ingredient } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  useEffect(() => {
    PreferencesService.isOnboarded().then((onboarded) => {
      if (!onboarded) {
        router.replace('/onboarding');
        return;
      }
      StorageRepository.seedDataIfEmpty();
      const items = StorageRepository.getAllIngredients();
      setIngredients(items);
    });
  }, [isFocused]);

  const expiringCount = ingredients.filter(
    (i) => i.status === 'expiring_today' || i.status === 'use_soon'
  ).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header & Hacktoberfest Badge */}
        <View style={styles.brandRow}>
          <View style={styles.brandGroup}>
            <View style={styles.brandIconBox}>
              <MaterialIcons name="eco" size={20} color={CulinaryColors.onPrimary} />
            </View>
            <Text style={styles.brandName}>FridgeFlow</Text>
          </View>

          <View style={styles.hacktoberBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.hacktoberText}>Hacktoberfest 2026</Text>
          </View>
        </View>

        {/* Hero Visual Frame with Fresh Produce & Culinary Glow */}
        <View style={styles.heroCard}>
          <Image
            source={{
              uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAV_gNJgxN4mxiXWi0PngE4G6POFkMU4mWz0ImiAH_4chRo3iCI6Wwk4oEEU0c-00rod6qy6dBbW9eVYLByxszKWjnLTZ4mJEIA_1lnvNKQRtrVgwyaWtBIp2--JmeH0kYYrQmR6cQYCIU0lmlTtWNnSgPhKIwhe0cIKFbitgTpboSNJVmD8SM88nUdrCc3TykttwOeqTsV_8R7kXFFYF0WOEzY9zzZKWV3QFNlbpq7L5wRrxQ4Iw0y',
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <View style={styles.heroPill}>
              <MaterialIcons name="kitchen" size={16} color={CulinaryColors.primary} />
              <Text style={styles.heroPillText}>Zero Waste Assistant</Text>
              <View style={styles.activeTag}>
                <Text style={styles.activeTagText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Typography Block */}
        <View style={styles.typographyBlock}>
          <Text style={styles.headline}>Your fridge. Smarter.</Text>
          <Text style={styles.subheadline}>
            Know what you have. Discover what to cook. Waste less.
          </Text>
        </View>

        {/* Live Inventory Quick Metric Strip */}
        <View style={styles.metricsContainer}>
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(tabs)/fridge')}
            activeOpacity={0.8}
          >
            <Text style={styles.metricNumber}>{ingredients.length}</Text>
            <Text style={styles.metricLabel}>Items in Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.metricCard, expiringCount > 0 && styles.metricAlertCard]}
            onPress={() => router.push('/(tabs)/fridge')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.metricNumber,
                expiringCount > 0 && { color: CulinaryColors.warningCoralText },
              ]}
            >
              {expiringCount}
            </Text>
            <Text style={styles.metricLabel}>Use Soon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => router.push('/(tabs)/recipes')}
            activeOpacity={0.8}
          >
            <Text style={styles.metricNumber}>3</Text>
            <Text style={styles.metricLabel}>Ready Recipes</Text>
          </TouchableOpacity>
        </View>

        {/* Three Benefit Cards / Value Props */}
        <View style={styles.benefitCardsList}>
          {/* Card 1 */}
          <TouchableOpacity
            style={styles.benefitCard}
            onPress={() => router.push('/scanner')}
            activeOpacity={0.85}
          >
            <View style={styles.benefitIconBox}>
              <MaterialIcons name="document-scanner" size={22} color={CulinaryColors.primary} />
            </View>
            <View style={styles.benefitTextCol}>
              <View style={styles.benefitTitleRow}>
                <Text style={styles.benefitTitle}>Smart Scanning</Text>
                <View style={styles.instantTag}>
                  <Text style={styles.instantTagText}>Instant</Text>
                </View>
              </View>
              <Text style={styles.benefitBody}>
                Instant open-weight AI recognition of your ingredients from a single photo.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity
            style={styles.benefitCard}
            onPress={() => router.push('/(tabs)/recipes')}
            activeOpacity={0.85}
          >
            <View style={styles.benefitIconBox}>
              <MaterialIcons name="auto-awesome" size={22} color={CulinaryColors.primary} />
            </View>
            <View style={styles.benefitTextCol}>
              <View style={styles.benefitTitleRow}>
                <Text style={styles.benefitTitle}>Easy Meal Planning</Text>
                <View style={styles.crisperTag}>
                  <Text style={styles.crisperTagText}>Crisper-First</Text>
                </View>
              </View>
              <Text style={styles.benefitBody}>
                Personalized recipes tailored directly to what's already in your crisper.
              </Text>
            </View>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity
            style={styles.benefitCard}
            onPress={() => router.push('/(tabs)/fridge')}
            activeOpacity={0.85}
          >
            <View style={styles.benefitIconBox}>
              <MaterialIcons name="hourglass-top" size={22} color={CulinaryColors.primary} />
            </View>
            <View style={styles.benefitTextCol}>
              <View style={styles.benefitTitleRow}>
                <Text style={styles.benefitTitle}>Less Food Waste</Text>
                <View style={styles.trackedTag}>
                  <Text style={styles.trackedTagText}>Tracked</Text>
                </View>
              </View>
              <Text style={styles.benefitBody}>
                Smart expiry tracking so fresh produce never gets forgotten.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Interactive Call-to-Actions */}
        <View style={styles.ctaContainer}>
          {/* Primary CTA: 52dp height, Pill, Deep Forest Green */}
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => router.push('/scanner')}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryCtaText}>Scan Your Fridge</Text>
            <MaterialIcons name="arrow-forward" size={20} color={CulinaryColors.onPrimary} />
          </TouchableOpacity>

          {/* Secondary CTA */}
          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={() => router.push('/(tabs)/fridge')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="kitchen" size={18} color={CulinaryColors.primary} />
            <Text style={styles.secondaryCtaText}>View My Fridge Inventory</Text>
          </TouchableOpacity>
        </View>

        {/* Micro-caption */}
        <View style={styles.footerCaptionBox}>
          <MaterialIcons name="lock-open" size={14} color={CulinaryColors.outline} />
          <Text style={styles.footerCaptionText}>
            No account required • Powered by local open-weight AI
          </Text>
        </View>

        <View style={{ height: 24 }} />
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
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: Spacing.xl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.level1,
  },
  brandName: {
    ...Typography.headlineSm,
    color: CulinaryColors.primary,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  hacktoberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(205, 235, 196, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radii.full,
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CulinaryColors.primary,
  },
  hacktoberText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryFixed,
  },
  heroCard: {
    width: '100%',
    height: 200,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: CulinaryColors.surfaceContainerLow,
    marginBottom: Spacing.md,
    ...Elevation.level1,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    gap: 6,
    ...Elevation.level1,
  },
  heroPillText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
  },
  activeTag: {
    backgroundColor: CulinaryColors.secondaryFixed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  activeTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryFixed,
    fontSize: 10,
  },
  typographyBlock: {
    marginBottom: Spacing.md,
  },
  headline: {
    ...Typography.headlineLg,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  subheadline: {
    ...Typography.bodyLg,
    color: CulinaryColors.onSurfaceVariant,
    marginTop: 4,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.lg,
    alignItems: 'center',
    ...Elevation.level1,
  },
  metricAlertCard: {
    backgroundColor: 'rgba(255, 218, 214, 0.4)',
  },
  metricNumber: {
    ...Typography.headlineMd,
    color: CulinaryColors.primary,
    fontWeight: '700',
  },
  metricLabel: {
    ...Typography.labelSm,
    color: CulinaryColors.onSurfaceVariant,
    marginTop: 2,
  },
  benefitCardsList: {
    gap: 10,
    marginBottom: Spacing.lg,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    padding: Spacing.md,
    borderRadius: Radii.xl,
    gap: Spacing.md,
    ...Elevation.level1,
  },
  benefitIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  benefitTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  instantTag: {
    backgroundColor: 'rgba(205, 235, 196, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  instantTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.onSecondaryContainer,
  },
  crisperTag: {
    backgroundColor: 'rgba(255, 223, 158, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  crisperTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.onTertiaryFixedVariant,
  },
  trackedTag: {
    backgroundColor: 'rgba(181, 239, 209, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  trackedTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.onPrimaryFixedVariant,
  },
  benefitBody: {
    ...Typography.bodyMd,
    color: CulinaryColors.onSurfaceVariant,
    lineHeight: 20,
  },
  ctaContainer: {
    gap: 12,
  },
  primaryCta: {
    width: '100%',
    height: 52,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Elevation.level2,
  },
  primaryCtaText: {
    ...Typography.labelLg,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  secondaryCta: {
    width: '100%',
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(225, 235, 225, 0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryCtaText: {
    ...Typography.labelLg,
    color: CulinaryColors.primary,
  },
  footerCaptionBox: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerCaptionText: {
    ...Typography.bodySm,
    color: CulinaryColors.outline,
  },
});
