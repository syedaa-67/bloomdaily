import React from 'react';
import { Pressable, StyleSheet, Text, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  style,
  icon,
}: Props) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.primary
      : variant === 'danger'
      ? theme.danger
      : variant === 'secondary'
      ? theme.primarySoft
      : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? '#FFFFFF'
      : variant === 'secondary'
      ? theme.primaryDark
      : theme.textPrimary;

  const borderColor = variant === 'ghost' ? theme.border : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled || loading}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' && styles.small,
        {
          backgroundColor,
          borderColor,
          borderWidth: variant === 'ghost' ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: textColor, fontSize: size === 'sm' ? typography.size.sm : typography.size.md },
              icon ? { marginLeft: spacing.sm } : undefined,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontFamily: typography.fontFamily.bodyBold,
  },
});
