import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...rest }: Props) {
  const theme = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? (
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : theme.border,
            color: theme.textPrimary,
          },
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={[styles.error, { color: theme.danger }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.size.sm,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.md,
  },
  error: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.xs,
    marginTop: spacing.xs,
  },
});
