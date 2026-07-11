import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typography } from '@/theme/theme';
import { Button } from './Button';

interface Props {
  emoji?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🌱', title, message, actionLabel, onAction }: Props) {
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>{message}</Text>
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.md }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emoji: { fontSize: 44, marginBottom: spacing.sm },
  title: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.lg, marginBottom: spacing.xs },
  message: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
