import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme/theme';

const SECTIONS: { title: string; body: string }[] = [
  {
    title: 'What stays on your device',
    body:
      'Your tasks, habits, mood check-ins, journal entries, and cycle logs are stored locally on your phone by default (Guest Mode). BloomDaily does not upload this data anywhere unless you explicitly create an account.',
  },
  {
    title: 'If you create an account',
    body:
      'Creating an account stores your email and a unique ID with our authentication provider so you can sign in again. Task and wellness data sync only if you turn that on in Settings — this starter app ships with local storage by default and sync as an opt-in extension point.',
  },
  {
    title: 'Cycle & mood data',
    body:
      'This is some of the most personal information you can track. It is off by default, stored only on your device, and never included in anonymous analytics. You can delete it at any time from Settings.',
  },
  {
    title: 'Anonymous analytics',
    body:
      'If you opt in, we collect anonymous, aggregated usage patterns (e.g. which screens are used) to improve the app — never task titles, journal text, or cycle details.',
  },
  {
    title: 'Notifications',
    body:
      'Reminders are scheduled locally on your device. BloomDaily does not need a server to know when to remind you, and no reminder content leaves your phone.',
  },
  {
    title: 'Your control',
    body:
      'You can export or delete all of your data at any time from Settings → Your data. There is no dark pattern here — deleting is as easy as adding.',
  },
];

export function PrivacyScreen() {
  const theme = useTheme();
  return (
    <ScreenContainer>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Privacy, plainly</Text>
      <Text style={[styles.intro, { color: theme.textSecondary }]}>
        We built BloomDaily privacy-first. Here&apos;s exactly what that means.
      </Text>
      {SECTIONS.map((section) => (
        <View key={section.title} style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{section.title}</Text>
          <Text style={[styles.sectionBody, { color: theme.textSecondary }]}>{section.body}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl, marginBottom: spacing.xs },
  intro: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: spacing.lg, lineHeight: 20 },
  sectionTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginBottom: spacing.xs },
  sectionBody: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, lineHeight: 20 },
});
