import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius } from '@/constants/theme';
import { PreferencesService } from '@/storage/preferences';

export default function OnboardingScreen() {
  const router = useRouter();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleGetStarted = async () => {
    await PreferencesService.setOnboarded(true);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header Pill & Badge */}
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <View style={styles.brandIconWrapper}>
              <MaterialIcons name="eco" size={22} color={Colors.white} />
            </View>
            <Text style={styles.brandTitle}>FridgeFlow</Text>
          </View>

          <View style={styles.hacktoberfestBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.hacktoberfestText}>Hacktoberfest 2026</Text>
          </View>
        </View>

        {/* Hero Visual Frame */}
        <View style={styles.heroFrame}>
          <Image
            source={require('../../assets/images/hero_produce.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          {/* Ambient Overlay Tag */}
          <View style={styles.scrimOverlay}>
            <View style={styles.scrimBadge}>
              <MaterialIcons name="kitchen" size={16} color={Colors.primary} />
              <Text style={styles.scrimTitle}>Zero Waste Assistant</Text>
              <View style={styles.activePill}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Typography Headline Block */}
        <View style={styles.headlineBlock}>
          <Text style={styles.mainHeadline}>Your fridge. Smarter.</Text>
          <Text style={styles.subHeadline}>
            Know what you have. Discover what to cook. Waste less.
          </Text>
        </View>

        {/* Value Prop Benefit Cards */}
        <View style={styles.cardsContainer}>
          {/* Card 1: Smart Scanning */}
          <View style={styles.benefitCard}>
            <View style={styles.cardIconBox}>
              <MaterialIcons name="document-scanner" size={22} color={Colors.primary} />
            </View>
            <View style={styles.cardTextBox}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Smart Scanning</Text>
                <View style={[styles.cardTag, { backgroundColor: '#CDEBC4' }]}>
                  <Text style={[styles.cardTagText, { color: Colors.forestGreen }]}>Instant</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>
                Instant open-weight AI recognition of your ingredients from a single photo.
              </Text>
            </View>
          </View>

          {/* Card 2: Crisper-First Meal Planning */}
          <View style={styles.benefitCard}>
            <View style={styles.cardIconBox}>
              <MaterialIcons name="auto-awesome" size={22} color={Colors.primary} />
            </View>
            <View style={styles.cardTextBox}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Easy Meal Planning</Text>
                <View style={[styles.cardTag, { backgroundColor: '#FFDF9E' }]}>
                  <Text style={[styles.cardTagText, { color: '#694E00' }]}>Crisper-First</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>
                Personalized recipes tailored directly to what's already in your crisper.
              </Text>
            </View>
          </View>

          {/* Card 3: Less Food Waste */}
          <View style={styles.benefitCard}>
            <View style={styles.cardIconBox}>
              <MaterialIcons name="hourglass-top" size={22} color={Colors.primary} />
            </View>
            <View style={styles.cardTextBox}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Less Food Waste</Text>
                <View style={[styles.cardTag, { backgroundColor: '#B5EFD1' }]}>
                  <Text style={[styles.cardTagText, { color: Colors.forestGreen }]}>Tracked</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>
                Smart expiry tracking so fresh produce never gets forgotten.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleGetStarted}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setShowHowItWorks(true)}
            activeOpacity={0.8}
          >
            <MaterialIcons name="play-circle" size={18} color={Colors.primary} />
            <Text style={styles.secondaryBtnText}>How it works</Text>
          </TouchableOpacity>
        </View>

        {/* Micro-caption */}
        <View style={styles.microCaptionRow}>
          <MaterialIcons name="lock-outline" size={13} color={Colors.mutedGrayGreen} />
          <Text style={styles.microCaptionText}>
            No account required to start • Powered by local open-weight AI
          </Text>
        </View>
      </ScrollView>

      {/* How It Works Modal */}
      <Modal
        visible={showHowItWorks}
        transparent
        animationType="fade"
        onRequestClose={() => setShowHowItWorks(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleBox}>
                <MaterialIcons name="auto-awesome" size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>How FridgeFlow Works</Text>
              </View>
              <TouchableOpacity onPress={() => setShowHowItWorks(false)}>
                <MaterialIcons name="close" size={22} color={Colors.charcoal} />
              </TouchableOpacity>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <View style={styles.stepTextBox}>
                <Text style={styles.stepTitle}>Snap or Pick a Photo</Text>
                <Text style={styles.stepDesc}>
                  Take a quick shot of your open fridge or crisper drawer.
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <View style={styles.stepTextBox}>
                <Text style={styles.stepTitle}>Gemma Vision Identifies</Text>
                <Text style={styles.stepDesc}>
                  Open-weight AI highlights ingredients with confidence scores for your review.
                </Text>
              </View>
            </View>

            <View style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <View style={styles.stepTextBox}>
                <Text style={styles.stepTitle}>Cook Waste-Free</Text>
                <Text style={styles.stepDesc}>
                  Get instant recipes prioritizing items expiring soonest.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: Spacing.md }]}
              onPress={() => setShowHowItWorks(false)}
            >
              <Text style={styles.primaryBtnText}>Got it, let's go!</Text>
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
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.forestGreen,
    letterSpacing: -0.3,
  },
  hacktoberfestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#CDEBC4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.forestGreen,
  },
  hacktoberfestText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#092008',
  },
  heroFrame: {
    position: 'relative',
    width: '100%',
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceContainerLow,
    marginBottom: Spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  scrimOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  scrimBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  scrimTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.forestGreen,
  },
  activePill: {
    backgroundColor: '#CDEBC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.forestGreen,
  },
  headlineBlock: {
    marginBottom: Spacing.lg,
  },
  mainHeadline: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.forestGreen,
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subHeadline: {
    fontSize: 15,
    color: Colors.mutedGrayGreen,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 10,
    marginBottom: Spacing.xl,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextBox: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.forestGreen,
  },
  cardTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.mutedGrayGreen,
    lineHeight: 18,
  },
  ctaContainer: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: Colors.forestGreen,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: Colors.forestGreen,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
  },
  secondaryBtn: {
    height: 48,
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.forestGreen,
  },
  microCaptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.xs,
  },
  microCaptionText: {
    fontSize: 11,
    color: Colors.mutedGrayGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalHeaderTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.forestGreen,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: Spacing.md,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  stepTextBox: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: Colors.mutedGrayGreen,
    lineHeight: 17,
  },
});
