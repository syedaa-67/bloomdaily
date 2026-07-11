import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { parseNaturalLanguageTask } from '@/services/naturalLanguageParser';
import { useTaskStore } from '@/store/useTaskStore';

export function QuickAddBar() {
  const theme = useTheme();
  const addTask = useTaskStore((s) => s.addTask);
  const [value, setValue] = useState('');

  const preview = useMemo(() => (value.trim() ? parseNaturalLanguageTask(value) : null), [value]);

  const handleSubmit = async () => {
    if (!value.trim()) return;
    const parsed = parseNaturalLanguageTask(value);
    await addTask({
      title: parsed.title,
      dueDate: parsed.dueDate ? parsed.dueDate.toISOString() : null,
      priority: parsed.priority ?? 'Medium',
      category: parsed.category ?? 'Other',
    });
    setValue('');
  };

  return (
    <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
      <View style={styles.row}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder='Try "Finish math assignment tomorrow 3pm"'
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.textPrimary }]}
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!value.trim()}
          style={[styles.addButton, { backgroundColor: theme.primary, opacity: value.trim() ? 1 : 0.4 }]}
        >
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </View>
      {preview ? (
        <Text style={[styles.previewText, { color: theme.textMuted }]}>
          {preview.dueDate ? format(preview.dueDate, "EEE, MMM d 'at' h:mm a") : 'No date detected'}
          {preview.priority ? ` · ${preview.priority} priority` : ''}
          {preview.category ? ` · ${preview.category}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.sm, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 10,
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 20, fontFamily: typography.fontFamily.bodyBold, marginTop: -2 },
  previewText: { fontFamily: typography.fontFamily.body, fontSize: typography.size.xs, marginTop: 4, marginLeft: spacing.sm },
});
