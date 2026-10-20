import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PreferencesService } from '@/storage/preferences';
import { StorageRepository } from '@/storage/database';
import { ApiService } from '@/services/api';
import { CulinaryColors, Typography, Radii, Spacing, Elevation } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [backendUrl, setBackendUrl] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    healthy?: boolean;
    model?: string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    PreferencesService.getBackendUrl().then(setBackendUrl);
  }, []);

  const handleSaveUrl = async () => {
    if (!backendUrl.trim()) return;
    await PreferencesService.setBackendUrl(backendUrl.trim());
    Alert.alert('Saved', 'Backend endpoint updated successfully.');
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);
    await PreferencesService.setBackendUrl(backendUrl.trim());
    const res = await ApiService.checkHealth();
    setTestingConnection(false);
    setConnectionStatus(res);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Sample Data',
      'This will refresh your local inventory and grocery list with the sample items from the Google Stitch design.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            StorageRepository.clearCompletedGroceryItems();
            StorageRepository.seedDataIfEmpty();
            Alert.alert('Done', 'Database refreshed with sample data.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={CulinaryColors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings &amp; Privacy</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Backend Endpoint Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="dns" size={20} color={CulinaryColors.primary} />
            <Text style={styles.cardTitle}>AI Backend Endpoint</Text>
          </View>
          <Text style={styles.cardDesc}>
            Configure the FastAPI server URL hosting the Gemma vision model. No hardcoded machine addresses.
          </Text>

          <TextInput
            style={styles.urlInput}
            value={backendUrl}
            onChangeText={setBackendUrl}
            placeholder="http://10.0.2.2:8000 or https://your-render-app.onrender.com"
            placeholderTextColor={CulinaryColors.outline}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
              <Text style={styles.saveBtnText}>Save URL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.testBtn}
              onPress={handleTestConnection}
              disabled={testingConnection}
            >
              {testingConnection ? (
                <ActivityIndicator size="small" color={CulinaryColors.onPrimary} />
              ) : (
                <>
                  <MaterialIcons name="bolt" size={16} color={CulinaryColors.onPrimary} />
                  <Text style={styles.testBtnText}>Test Connection</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Connection Result */}
          {connectionStatus && (
            <View
              style={[
                styles.statusBox,
                connectionStatus.healthy ? styles.statusBoxHealthy : styles.statusBoxError,
              ]}
            >
              <MaterialIcons
                name={connectionStatus.healthy ? 'check-circle' : 'error-outline'}
                size={18}
                color={
                  connectionStatus.healthy ? CulinaryColors.primary : CulinaryColors.error
                }
              />
              <Text
                style={[
                  styles.statusText,
                  connectionStatus.healthy
                    ? { color: CulinaryColors.primary }
                    : { color: CulinaryColors.error },
                ]}
              >
                {connectionStatus.healthy
                  ? `Connected! Model: ${connectionStatus.model || 'Gemma Vision Engine'}`
                  : `Offline: ${connectionStatus.message || 'Cannot reach endpoint'}. App will use calibrated offline culinary rules.`}
              </Text>
            </View>
          )}
        </View>

        {/* Privacy & Zero-Knowledge Architecture */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="security" size={20} color={CulinaryColors.primary} />
            <Text style={styles.cardTitle}>Privacy &amp; Data Rights</Text>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="check" size={18} color={CulinaryColors.primary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>No Account Required:</Text> All your inventory, grocery lists, and expiry alerts are persisted in local SQLite on your device.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="check" size={18} color={CulinaryColors.primary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Ephemeral AI Inference:</Text> Photos sent for Gemma vision processing are analyzed in-memory and never retained or sold.
            </Text>
          </View>

          <View style={styles.bulletRow}>
            <MaterialIcons name="check" size={18} color={CulinaryColors.primary} />
            <Text style={styles.bulletText}>
              <Text style={styles.bold}>Full Offline Independence:</Text> All core inventory and shopping features remain 100% operational even without network connectivity.
            </Text>
          </View>
        </View>

        {/* Local Storage Management */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="storage" size={20} color={CulinaryColors.primary} />
            <Text style={styles.cardTitle}>Local Storage Controls</Text>
          </View>
          <Text style={styles.cardDesc}>
            Manage your SQLite database and reset test data anytime.
          </Text>

          <TouchableOpacity style={styles.resetBtn} onPress={handleResetData}>
            <MaterialIcons name="restart-alt" size={18} color={CulinaryColors.primary} />
            <Text style={styles.resetBtnText}>Reload Stitch Sample Items</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resetBtn, { marginTop: 8 }]}
            onPress={() => router.push('/onboarding')}
          >
            <MaterialIcons name="explore" size={18} color={CulinaryColors.primary} />
            <Text style={styles.resetBtnText}>Revisit Welcome &amp; Onboarding</Text>
          </TouchableOpacity>
        </View>

        {/* Open Source & Hacktoberfest Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="military-tech" size={20} color={CulinaryColors.primary} />
            <Text style={styles.cardTitle}>Hacktoberfest 2026</Text>
          </View>
          <Text style={styles.hacktoberfestDesc}>
            FridgeFlow AI — Built for Open-Source AI Challenge (Week 3: Slow and Steady).
            Automating repetitive domestic kitchen tasks to eliminate food waste using open-weight Gemma models.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0 • React Native + Expo + FastAPI</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.sm,
    backgroundColor: CulinaryColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(32, 41, 35, 0.08)',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  container: {
    flex: 1,
    backgroundColor: CulinaryColors.surface,
  },
  contentContainer: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: CulinaryColors.surfaceContainerLowest,
    borderRadius: Radii.xl,
    padding: Spacing.md,
    ...Elevation.level1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: CulinaryColors.onSurface,
    fontWeight: '700',
  },
  cardDesc: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  urlInput: {
    backgroundColor: CulinaryColors.surfaceContainerLow,
    borderRadius: Radii.base,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...Typography.bodyMd,
    color: CulinaryColors.onSurface,
    marginBottom: Spacing.sm,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: CulinaryColors.surfaceContainerHigh,
    paddingVertical: 10,
    borderRadius: Radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.onSurface,
  },
  testBtn: {
    flex: 1,
    backgroundColor: CulinaryColors.primary,
    paddingVertical: 10,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  testBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.onPrimary,
    fontWeight: '700',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: Radii.base,
    marginTop: Spacing.sm,
  },
  statusBoxHealthy: {
    backgroundColor: 'rgba(205, 235, 196, 0.5)',
  },
  statusBoxError: {
    backgroundColor: 'rgba(255, 218, 214, 0.5)',
  },
  statusText: {
    ...Typography.bodySm,
    flex: 1,
    lineHeight: 18,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginVertical: 4,
  },
  bulletText: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    flex: 1,
    lineHeight: 18,
  },
  bold: {
    fontWeight: '700',
    color: CulinaryColors.onSurface,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: CulinaryColors.surfaceContainerLow,
    paddingVertical: 10,
    borderRadius: Radii.full,
    marginTop: 4,
  },
  resetBtnText: {
    ...Typography.labelMd,
    color: CulinaryColors.primary,
    fontWeight: '600',
  },
  hacktoberfestDesc: {
    ...Typography.bodySm,
    color: CulinaryColors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 6,
  },
  versionText: {
    ...Typography.labelSm,
    color: CulinaryColors.outline,
  },
});
