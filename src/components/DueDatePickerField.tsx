import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export type PickerMode = 'date' | 'time';

export interface DueDatePickerFieldProps {
  mode: PickerMode;
  value: Date;
  onChange: (date: Date) => void;
  onRequestClose: () => void;
}

/**
 * Native (iOS/Android) due-date/time picker, wrapping
 * @react-native-community/datetimepicker. A `.web.tsx` sibling of this file
 * swaps in plain HTML date/time inputs on web — that library has no web
 * implementation, so importing it directly would break `expo export -p web`.
 */
export function DueDatePickerField({ mode, value, onChange, onRequestClose }: DueDatePickerFieldProps) {
  // iOS's inline date picker stays open until the user taps away; every
  // other case (Android popups, and time pickers on both platforms) closes
  // itself as soon as a value is picked.
  const keepOpenOnIOS = Platform.OS === 'ios' && mode === 'date';

  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={Platform.OS === 'ios' && mode === 'date' ? 'inline' : 'default'}
      onChange={(_, selected) => {
        if (!keepOpenOnIOS) onRequestClose();
        if (selected) onChange(selected);
      }}
    />
  );
}
