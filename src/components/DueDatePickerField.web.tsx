import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/theme';
import type { PickerMode } from './DueDatePickerField';

export interface DueDatePickerFieldProps {
  mode: PickerMode;
  value: Date;
  onChange: (date: Date) => void;
  onRequestClose: () => void;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Web build of the due-date/time picker. @react-native-community/datetimepicker
 * has no web implementation, so this renders a plain HTML
 * <input type="date"|"time"> instead — same value contract as the native
 * version (`onChange` fires with a full Date, `onRequestClose` dismisses it).
 */
export function DueDatePickerField({ mode, value, onChange, onRequestClose }: DueDatePickerFieldProps) {
  const theme = useTheme();

  const htmlValue =
    mode === 'date'
      ? `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
      : `${pad(value.getHours())}:${pad(value.getMinutes())}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!raw) return;
    const next = new Date(value);
    if (mode === 'date') {
      const [y, m, d] = raw.split('-').map(Number);
      next.setFullYear(y, m - 1, d);
    } else {
      const [h, min] = raw.split(':').map(Number);
      next.setHours(h, min);
    }
    onChange(next);
  };

  return (
    <View style={{ marginBottom: spacing.md }}>
      <input
        type={mode}
        value={htmlValue}
        autoFocus
        onChange={handleChange}
        onBlur={onRequestClose}
        style={{
          fontSize: 16,
          padding: '10px 12px',
          borderRadius: radius.md,
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.surface,
          color: theme.textPrimary,
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
        }}
      />
    </View>
  );
}
