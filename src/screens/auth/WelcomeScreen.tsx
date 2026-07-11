import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { palette, spacing, typography } from '@/theme/theme';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useUserStore } from '@/store/useUserStore';

export function WelcomeScreen() {
  const theme = useTheme();
  const isFirebaseAvailable = useUserStore((s) => s.isFirebaseAvailable);
  const startGuestProfile = useUserStore((s) => s.startGuestProfile);
  const signUp = useUserStore((s) => s.signUp);
  const signIn = useUserStore((s) => s.signIn);

  const [mode, setMode] = useState<'landing' | 'signup' | 'login'>('landing');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submitAccount = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') await signUp(email.trim(), password, name.trim());
      else await signIn(email.trim(), password);
    } catch (e: any) {
      setError(e?.message?.replace('Firebase: ', '') ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[palette.bloomLight, palette.lavenderLight, palette.cream]} style={styles.gradient}>
      <View style={styles.content}>
        <Text style={styles.logo}>🌸</Text>
        <Text style={[styles.appName, { color: theme.textPrimary }]}>BloomDaily</Text>
        <Text style={[styles.tagline, { color: theme.textSecondary }]}>
          A gentle, empowering space to organize your studies, your self-care, and everything in between.
        </Text>

        {mode === 'landing' ? (
          <View style={styles.actions}>
            <Input
              placeholder="What should we call you?"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
            <Button
              label="Start in Guest Mode"
              onPress={() => startGuestProfile(name.trim() || 'Friend')}
              fullWidth
            />
            <Text style={[styles.privacyNote, { color: theme.textMuted }]}>
              Guest Mode keeps everything private, on this device — no account needed.
            </Text>
            {isFirebaseAvailable ? (
              <>
                <Button
                  label="Create an account instead"
                  variant="ghost"
                  onPress={() => setMode('signup')}
                  fullWidth
                  style={{ marginTop: spacing.sm }}
                />
                <Button label="I already have an account" variant="ghost" onPress={() => setMode('login')} fullWidth />
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.actions}>
            {mode === 'signup' && (
              <Input placeholder="Your name" value={name} onChangeText={setName} autoCapitalize="words" />
            )}
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            {error ? <Text style={{ color: theme.danger, marginBottom: spacing.sm }}>{error}</Text> : null}
            <Button
              label={mode === 'signup' ? 'Create account' : 'Log in'}
              onPress={submitAccount}
              loading={loading}
              fullWidth
            />
            <Button label="Back" variant="ghost" onPress={() => setMode('landing')} fullWidth />
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.lg },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: spacing.sm },
  appName: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.display, textAlign: 'center' },
  tagline: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.md,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  actions: { gap: spacing.xs },
  privacyNote: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
});
