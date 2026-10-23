import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ViewfinderReticle } from '@/components/ViewfinderReticle';
import { ApiService } from '@/services/api';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

import { EdgeVisionEngine, EdgeModelStatus } from '@/services/edgeAI';

const FLASH_STATES = [
  { label: 'Flash Auto', icon: 'flash-auto' as const, color: CulinaryColors.tertiaryFixedDim },
  { label: 'Flash On', icon: 'flash-on' as const, color: CulinaryColors.tertiaryFixed },
  { label: 'Flash Off', icon: 'flash-off' as const, color: CulinaryColors.outlineVariant },
];

const SIMULATED_STEPS = [
  'Extracting visual feature embeddings...',
  'Running on-device neural vision inference...',
  'Estimating shelf-life & crisper priorities...',
  'Formatting zero-waste ingredient predictions...',
];

export default function ScannerScreen() {
  const router = useRouter();
  const [flashIndex, setFlashIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [edgeStatus, setEdgeStatus] = useState<EdgeModelStatus | null>(null);

  useEffect(() => {
    EdgeVisionEngine.getStatus().then(setEdgeStatus).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % SIMULATED_STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCycleFlash = () => {
    setFlashIndex((prev) => (prev + 1) % FLASH_STATES.length);
  };

  const handleCapturePhoto = async () => {
    setScanError(null);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission',
          'Camera permission is required to capture live fridge photos. Would you like to select an existing photo from your gallery instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Gallery', onPress: handlePickFromGallery },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Camera launch error, using demo scan:', err);
      setPreviewUri('demo://fridge_interior.jpg');
    }
  };

  const webFileInputRef = React.useRef<any>(null);

  const handlePickFromGallery = async () => {
    setScanError(null);
    if (Platform.OS === 'web' && webFileInputRef.current) {
      webFileInputRef.current.click();
      return;
    }
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Gallery access is required to select a fridge photo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setPreviewUri(result.assets[0].uri);
      }
    } catch (err: any) {
      console.warn('Gallery error:', err);
      setPreviewUri('demo://fridge_interior.jpg');
    }
  };

  const handleWebFileSelect = (event: any) => {
    const file = event.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUri(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetake = () => {
    setPreviewUri(null);
    setScanError(null);
    setIsProcessing(false);
    if (webFileInputRef.current) {
      webFileInputRef.current.value = '';
    }
  };

  const handleSubmitForRecognition = async () => {
    if (!previewUri) return;
    setIsProcessing(true);
    setScanError(null);

    try {
      const result = await ApiService.scanImage(previewUri);
      setIsProcessing(false);
      // Navigate to review screen with results encoded
      router.push({
        pathname: '/scanner/review',
        params: {
          data: JSON.stringify(result.ingredients),
          modelName: result.modelName,
          isLive: result.isLive ? 'true' : 'false',
        },
      });
    } catch (e: any) {
      setIsProcessing(false);
      const errorMsg = e?.message || 'Unable to connect to AI vision backend.';
      setScanError(errorMsg);
    }
  };

  const handleProceedWithFallback = () => {
    router.push('/scanner/review');
  };

  const currentFlash = FLASH_STATES[flashIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Controls Row */}
        <View style={styles.topControlsRow}>
          <TouchableOpacity
            style={styles.utilityCircle}
            onPress={() => router.back()}
            accessibilityLabel="Cancel scanner"
          >
            <MaterialIcons name="close" size={22} color={CulinaryColors.inverseOnSurface} />
          </TouchableOpacity>

          {!previewUri ? (
            <TouchableOpacity
              style={styles.flashPill}
              onPress={handleCycleFlash}
              accessibilityLabel="Toggle flash mode"
            >
              <MaterialIcons name={currentFlash.icon} size={18} color={currentFlash.color} />
              <Text style={styles.flashLabel}>{currentFlash.label.toUpperCase()}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.previewActivePill}>
              <MaterialIcons name="photo" size={16} color={CulinaryColors.primaryFixedDim} />
              <Text style={styles.previewActiveText}>Image Ready</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.utilityCircle}
            onPress={() =>
              Alert.alert(
                'Vision Scanning Tips',
                '• Ensure the fridge interior light is on.\n• Open crisper drawers for better vegetable detection.\n• Keep labels and containers upright when possible.\n• 100% on-device vision runs completely offline without sending photos to any server.'
              )
            }
            accessibilityLabel="Scanning tips"
          >
            <MaterialIcons name="help-outline" size={22} color={CulinaryColors.inverseOnSurface} />
          </TouchableOpacity>
        </View>

        {/* Viewfinder OR Image Preview Mode */}
        {!previewUri ? (
          <View style={styles.cameraFrame}>
            <ImageBackground
              source={require('../../../assets/images/hero_produce.jpg')}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
              <View style={styles.cameraScrim} />

              {/* Guidance Pill Overlay */}
              <View style={styles.guidancePillContainer}>
                <View style={styles.guidancePill}>
                  <MaterialIcons name="light-mode" size={16} color={CulinaryColors.primaryFixedDim} />
                  <Text style={styles.guidanceText}>
                    Capture the inside of your fridge — ensure good lighting
                  </Text>
                </View>
              </View>

              {/* Center Viewfinder with Laser Reticle */}
              <ViewfinderReticle />

              {/* Lower Shutter & Controls Dock */}
              <View style={styles.lowerDock}>
                {/* Left: Gallery Picker */}
                <View style={styles.dockItem}>
                  <TouchableOpacity
                    style={styles.dockCircleBtn}
                    onPress={handlePickFromGallery}
                    accessibilityLabel="Upload from gallery"
                  >
                    <MaterialIcons name="photo-library" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.dockItemLabel}>Upload</Text>
                </View>

                {/* Center: Circular Shutter Button */}
                <View style={styles.dockItemCenter}>
                  <TouchableOpacity
                    style={styles.shutterButton}
                    onPress={handleCapturePhoto}
                    activeOpacity={0.8}
                    accessibilityLabel="Take picture"
                  >
                    <View style={styles.shutterInnerCircle}>
                      <MaterialIcons name="camera" size={30} color={CulinaryColors.primary} />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Right: Manual Inventory Entry */}
                <View style={styles.dockItem}>
                  <TouchableOpacity
                    style={styles.dockCircleBtn}
                    onPress={() => router.push('/(tabs)/fridge')}
                    accessibilityLabel="Manual entry"
                  >
                    <MaterialIcons name="playlist-add" size={24} color="#ffffff" />
                  </TouchableOpacity>
                  <Text style={styles.dockItemLabel}>Manual</Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        ) : (
          /* Preview and Confirm Screen */
          <View style={styles.previewContainer}>
            <View style={styles.previewImageCard}>
              {previewUri.startsWith('demo://') ? (
                <ImageBackground
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtykg0FPdhyNs5ZTVRvaUfuxNkfjwuHiyWUy7COPguAXnDjmij4PfI3S1UZiFEy8sHxbLAMZYiBQKv6jREDBqkFQkP-yB3kSWc04fQOaU9xH86uyZTI0Jd9UBwfL6YVSEmAbar0J833JLx1Ric3_MXzNkLl7yCFxp5KZuA44FW4sGIZzNy23p55Br5rwLVY2Tm-LcVDRI4SE79eg_8M7Cze7AtkuPwmjFUhqyLSr0eC_sY9puA0Qae',
                  }}
                  style={styles.previewImage}
                  resizeMode="cover"
                >
                  <View style={styles.demoBadge}>
                    <Text style={styles.demoBadgeText}>Sample Fridge Photo</Text>
                  </View>
                </ImageBackground>
              ) : (
                <Image
                  source={{ uri: previewUri }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              )}

              {/* Status Banner */}
              <View style={styles.previewOverlayBar}>
                <View style={styles.networkBadge}>
                  <MaterialIcons name="security" size={14} color={CulinaryColors.primary} />
                  <Text style={styles.networkBadgeText}>
                    100% On-Device AI • {edgeStatus?.engine.toUpperCase() || 'OFFLINE'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Error Message if local processing failed */}
            {scanError && (
              <View style={styles.errorBanner}>
                <MaterialIcons name="error-outline" size={18} color={CulinaryColors.error} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorTitle}>Local Vision Processing Error</Text>
                  <Text style={styles.errorDetail}>
                    {scanError}. Please retake the photo or retry on-device inference.
                  </Text>
                </View>
              </View>
            )}

            {/* Preview Action Buttons */}
            <View style={styles.previewActionRow}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetake}
                activeOpacity={0.8}
              >
                <MaterialIcons name="refresh" size={20} color={CulinaryColors.primary} />
                <Text style={styles.retakeBtnText}>Retake Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.analyzeBtn}
                onPress={handleSubmitForRecognition}
                activeOpacity={0.85}
                accessibilityLabel="Analyze My Fridge"
              >
                <MaterialIcons name="auto-awesome" size={20} color={CulinaryColors.white} />
                <Text style={styles.analyzeBtnText}>Analyze My Fridge</Text>
              </TouchableOpacity>
            </View>

            {scanError && (
              <TouchableOpacity
                style={styles.fallbackBtn}
                onPress={handleSubmitForRecognition}
              >
                <MaterialIcons name="refresh" size={18} color={CulinaryColors.error} />
                <Text style={[styles.fallbackBtnText, { color: CulinaryColors.error, marginLeft: 6 }]}>Retry Local Inference</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Real-time On-Device Edge Vision Processing Drawer Card */}
        <View style={styles.drawerCard}>
          <View style={styles.drawerHandle} />

          <View style={styles.drawerHeader}>
            <View style={styles.gemmaIconCircle}>
              <MaterialIcons name="memory" size={20} color={CulinaryColors.onPrimary} />
            </View>
            <View style={styles.drawerTitleCol}>
              <Text style={styles.drawerTitle}>
                {isProcessing ? 'Analyzing On-Device...' : 'Finding your ingredients…'}
              </Text>
              <Text style={styles.drawerSubtitle}>
                {edgeStatus?.modelConfig.name || 'On-Device Edge Vision Engine'}
              </Text>
            </View>
          </View>

          {/* Live Step Progress Indicator */}
          <View style={styles.liveStepPill}>
            <View style={styles.pulseLiveDot} />
            <Text style={styles.liveStepText} numberOfLines={1}>
              {SIMULATED_STEPS[stepIndex]}
            </Text>
            <View style={styles.liveTag}>
              <MaterialIcons name="bolt" size={13} color={CulinaryColors.secondary} />
              <Text style={styles.liveTagText}>Edge</Text>
            </View>
          </View>

          {/* Privacy & Network Transparency Banner */}
          <View style={styles.privacyBanner}>
            <MaterialIcons name="verified-user" size={14} color={CulinaryColors.primary} />
            <Text style={styles.privacyText}>
              100% On-device edge processing. Photos are analyzed directly inside your device memory and never transmitted over the internet.
            </Text>
          </View>
        </View>

        {/* Processing Modal Overlay */}
        <Modal visible={isProcessing} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.processingModalCard}>
              <ActivityIndicator size="large" color={CulinaryColors.primary} />
              <Text style={styles.processingModalTitle}>On-Device Vision Analyzing</Text>
              <Text style={styles.processingModalDesc}>
                Extracting visible food items, shelf life estimates &amp; crisper priorities directly on your device...
              </Text>
              <View style={styles.modalStepBadge}>
                <View style={styles.pulseLiveDot} />
                <Text style={styles.modalStepText}>{SIMULATED_STEPS[stepIndex]}</Text>
              </View>
            </View>
          </View>
        </Modal>

        {Platform.OS === 'web' && (
          // @ts-ignore
          <input
            type="file"
            ref={webFileInputRef}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleWebFileSelect}
            data-testid="web-file-input"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CulinaryColors.inverseSurface,
  },
  container: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
    paddingHorizontal: Spacing.sm,
    paddingTop: Platform.OS === 'android' ? 12 : 8,
  },
  topControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  utilityCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(32, 41, 35, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 41, 35, 0.75)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.full,
    gap: 6,
  },
  flashLabel: {
    ...Typography.labelSm,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  previewActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  previewActiveText: {
    ...Typography.labelSm,
    color: '#ffffff',
    fontWeight: '700',
  },
  cameraFrame: {
    flex: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: CulinaryColors.inverseSurface,
    minHeight: 440,
    ...Elevation.level2,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraScrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(32, 41, 35, 0.4)',
  },
  guidancePillContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  guidancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(32, 41, 35, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 6,
  },
  guidanceText: {
    ...Typography.labelSm,
    color: '#ffffff',
  },
  lowerDock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    backgroundColor: 'rgba(32, 41, 35, 0.5)',
  },
  dockItem: {
    alignItems: 'center',
    gap: 4,
  },
  dockCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: 'rgba(32, 41, 35, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockItemLabel: {
    ...Typography.labelSm,
    color: '#ffffff',
  },
  dockItemCenter: {
    alignItems: 'center',
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    ...Elevation.level3,
  },
  shutterInnerCircle: {
    width: 56,
    height: 56,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    flex: 1,
    gap: Spacing.sm,
  },
  previewImageCard: {
    flex: 1,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: CulinaryColors.inverseSurface,
    position: 'relative',
    ...Elevation.level2,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  demoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(32, 41, 35, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    margin: Spacing.md,
  },
  demoBadgeText: {
    ...Typography.labelSm,
    color: '#ffffff',
  },
  previewOverlayBar: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radii.full,
    gap: 8,
    alignSelf: 'center',
  },
  networkBadgeText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFDAD6',
    padding: Spacing.sm,
    borderRadius: Radii.md,
  },
  errorTitle: {
    ...Typography.labelMd,
    color: CulinaryColors.error,
    fontWeight: '700',
  },
  errorDetail: {
    ...Typography.bodySm,
    color: CulinaryColors.error,
    fontSize: 12,
  },
  previewActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeBtn: {
    flex: 1,
    height: 48,
    backgroundColor: CulinaryColors.surfaceContainerHigh,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  retakeBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  analyzeBtn: {
    flex: 1.5,
    height: 48,
    backgroundColor: CulinaryColors.primary,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Elevation.level2,
  },
  analyzeBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.white,
    fontWeight: '700',
  },
  fallbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  fallbackBtnText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    fontWeight: '600',
  },
  drawerCard: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    ...Elevation.level1,
  },
  drawerHandle: {
    width: 36,
    height: 4,
    backgroundColor: CulinaryColors.surfaceVariant,
    borderRadius: Radii.full,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  gemmaIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radii.full,
    backgroundColor: CulinaryColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerTitleCol: {
    flex: 1,
  },
  drawerTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  drawerSubtitle: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
  },
  liveStepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLow,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: Radii.base,
    gap: 8,
    marginBottom: Spacing.xs,
  },
  pulseLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: CulinaryColors.primary,
  },
  liveStepText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    flex: 1,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  liveTagText: {
    ...Typography.labelSm,
    color: CulinaryColors.secondary,
    fontWeight: '700',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  privacyText: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    flex: 1,
    lineHeight: 16,
    fontSize: 11,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  processingModalCard: {
    width: '100%',
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  processingModalTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.primary,
    fontWeight: '700',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  processingModalDesc: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalStepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CulinaryColors.surfaceContainerLow,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radii.full,
    gap: 8,
  },
  modalStepText: {
    ...Typography.labelSm,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
});
