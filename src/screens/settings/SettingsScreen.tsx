import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useUserStore } from '@/store/useUserStore';
import { isFirebaseConfigured } from '@/services/firebase';
import { exportBackup, exportTasksAsCsv, importBackup } from '@/services/backupService';
import { ThemePreference } from '@/types';
import { RootStackParamList } from '@/navigation/types';

const THEME_OPTIONS: { label: string; value: ThemePreference }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, marginRight: spacing.sm }}>
        <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium }}>
          {label}
        </Text>
        {description ? (
          <Text style={{ color: theme.textMuted, fontSize: typography.size.xs, marginTop: 2 }}>
            {description}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function SettingsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const {
    themePreference,
    setThemePreference,
    quietHours,
    setQuietHours,
    eveningCheckInEnabled,
    setEveningCheckIn,
    analyticsOptIn,
    setAnalyticsOptIn,
  } = useSettingsStore();
  const profile = useUserStore((s) => s.profile);
  const signOut = useUserStore((s) => s.signOut);
  const [busy, setBusy] = useState<'export' | 'csv' | 'import' | null>(null);

  const handleExport = async () => {
    setBusy('export');
    await exportBackup().catch(() => Alert.alert('Export failed', 'Please try again.'));
    setBusy(null);
  };

  const handleCsv = async () => {
    setBusy('csv');
    await exportTasksAsCsv().catch(() => Alert.alert('Export failed', 'Please try again.'));
    setBusy(null);
  };

  const handleImport = async () => {
    setBusy('import');
    const result = await importBackup();
    setBusy(null);
    Alert.alert(result.success ? 'Success' : 'Import issue', result.message);
  };

  const confirmSignOut = () => {
    Alert.alert('Log out?', 'Your data stays safely on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <ScreenContainer>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Settings</Text>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Appearance</Text>
        <View style={styles.chipRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setThemePreference(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: themePreference === opt.value ? theme.primary : theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={{ color: themePreference === opt.value ? '#FFF' : theme.textPrimary }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Reminders</Text>
        <SettingsRow
          label="Evening check-in"
          description="A gentle nudge about unfinished tasks each evening"
        >
          <Switch value={eveningCheckInEnabled} onValueChange={(v) => setEveningCheckIn(v)} />
        </SettingsRow>
        <SettingsRow
          label="Quiet hours"
          description={`${quietHours.startHour}:00 – ${quietHours.endHour}:00`}
        >
          <Switch
            value={quietHours.isEnabled}
            onValueChange={(v) => setQuietHours({ ...quietHours, isEnabled: v })}
          />
        </SettingsRow>
      </View>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Wellness</Text>
        <Pressable onPress={() => navigation.navigate('CycleTracker')} style={styles.linkRow}>
          <Text style={{ color: theme.textPrimary }}>Cycle tracking</Text>
          <Text style={{ color: theme.textMuted }}>›</Text>
        </Pressable>
      </View>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Your data</Text>
        <SettingsRow
          label="Anonymous usage analytics"
          description="Helps us improve BloomDaily. Off by default — no personal or task content is ever sent."
        >
          <Switch value={analyticsOptIn} onValueChange={setAnalyticsOptIn} />
        </SettingsRow>
        <Button
          label="Export full backup (.json)"
          variant="secondary"
          onPress={handleExport}
          loading={busy === 'export'}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
        <Button
          label="Export tasks (.csv)"
          variant="secondary"
          onPress={handleCsv}
          loading={busy === 'csv'}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
        <Button
          label="Restore from backup"
          variant="ghost"
          onPress={handleImport}
          loading={busy === 'import'}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
        <Pressable onPress={() => navigation.navigate('Privacy')} style={styles.linkRow}>
          <Text style={{ color: theme.textPrimary }}>Privacy policy</Text>
          <Text style={{ color: theme.textMuted }}>›</Text>
        </Pressable>
      </View>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Account</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing.sm }}>
          {profile?.authMode === 'firebase' ? profile.email : 'Guest Mode (local only)'}
        </Text>
        {profile?.authMode === 'firebase' && isFirebaseConfigured ? (
          <Text style={{ color: theme.textMuted, fontSize: typography.size.xs, marginBottom: spacing.sm }}>
            ☁️ Synced — tasks and habits stay up to date across every device you sign into.
          </Text>
        ) : null}
        <Button label="Log out" variant="danger" onPress={confirmSignOut} fullWidth />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.size.xxl,
    marginBottom: spacing.md,
  },
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.size.md,
    marginBottom: spacing.sm,
  },
  chipRow: { flexDirection: 'row', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: spacing.xs,
  },
});
