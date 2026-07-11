import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useTaskStore } from '@/store/useTaskStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Category, Priority, RecurrenceRule } from '@/types';
import { RootStackParamList } from '@/navigation/types';

const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
const CATEGORIES: Category[] = ['Study', 'Self-care', 'Errands', 'Health', 'Work', 'Social', 'Other'];
const REMINDER_OPTIONS = [
  { label: 'At due time', value: 0 },
  { label: '10 min before', value: 10 },
  { label: '30 min before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: 'No reminder', value: -1 },
];
const RECURRENCE_OPTIONS: Array<{ label: string; value: RecurrenceRule['type'] }> = [
  { label: 'Does not repeat', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
];

export function AddEditTaskScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'AddEditTask'>>();
  const editingId = route.params?.taskId;

  const tasks = useTaskStore((s) => s.tasks);
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const defaultReminder = useSettingsStore((s) => s.defaultReminderMinutesBefore);

  const editingTask = useMemo(() => tasks.find((t) => t.id === editingId), [tasks, editingId]);

  const [title, setTitle] = useState(editingTask?.title ?? route.params?.prefillTitle ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [dueDate, setDueDate] = useState<Date | null>(editingTask?.dueDate ? new Date(editingTask.dueDate) : null);
  const [priority, setPriority] = useState<Priority>(editingTask?.priority ?? 'Medium');
  const [category, setCategory] = useState<Category>(editingTask?.category ?? 'Other');
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    editingTask?.estimatedMinutes ? String(editingTask.estimatedMinutes) : ''
  );
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>(editingTask?.subtasks.map((s) => s.title) ?? []);
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceRule['type']>(editingTask?.recurrence.type ?? 'none');
  const [reminderMinutes, setReminderMinutes] = useState(
    editingTask?.reminderMinutesBefore === null ? -1 : editingTask?.reminderMinutesBefore ?? defaultReminder
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0;

  const addSubtaskDraft = () => {
    if (!subtaskDraft.trim()) return;
    setSubtasks((prev) => [...prev, subtaskDraft.trim()]);
    setSubtaskDraft('');
  };

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const recurrence: RecurrenceRule =
      recurrenceType === 'weekly'
        ? { type: 'weekly', daysOfWeek: dueDate ? [dueDate.getDay()] : [new Date().getDay()] }
        : recurrenceType === 'daily'
        ? { type: 'daily' }
        : { type: 'none' };

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate ? dueDate.toISOString() : null,
      priority,
      category,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : undefined,
      subtasks,
      recurrence,
      reminderMinutesBefore: reminderMinutes === -1 ? null : reminderMinutes,
    };

    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await addTask(payload);
    }
    setSaving(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: theme.textSecondary, fontFamily: typography.fontFamily.bodyMedium }}>Cancel</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{editingTask ? 'Edit task' : 'New task'}</Text>
        <Pressable onPress={handleSave} disabled={!canSave || saving}>
          <Text
            style={{
              color: canSave ? theme.primaryDark : theme.textMuted,
              fontFamily: typography.fontFamily.bodyBold,
            }}
          >
            Save
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input placeholder="Task title" value={title} onChangeText={setTitle} autoFocus />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Due date & time</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={[styles.pickerButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textPrimary }}>{dueDate ? format(dueDate, 'MMM d, yyyy') : 'Pick a date'}</Text>
          </Pressable>
          <Pressable
            onPress={() => setShowTimePicker(true)}
            style={[styles.pickerButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textPrimary }}>{dueDate ? format(dueDate, 'h:mm a') : 'Pick a time'}</Text>
          </Pressable>
          {dueDate ? (
            <Pressable onPress={() => setDueDate(null)} style={styles.clearButton}>
              <Text style={{ color: theme.danger }}>Clear</Text>
            </Pressable>
          ) : null}
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) {
                const base = dueDate ?? new Date();
                base.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                setDueDate(new Date(base));
              }
            }}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={dueDate ?? new Date()}
            mode="time"
            display="default"
            onChange={(_, selected) => {
              setShowTimePicker(false);
              if (selected) {
                const base = dueDate ?? new Date();
                base.setHours(selected.getHours(), selected.getMinutes());
                setDueDate(new Date(base));
              }
            }}
          />
        )}

        <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <Pressable
              key={p}
              onPress={() => setPriority(p)}
              style={[
                styles.chip,
                { backgroundColor: priority === p ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: priority === p ? '#FFF' : theme.textPrimary }}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
        <View style={styles.chipRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c}
              onPress={() => setCategory(c)}
              style={[
                styles.chip,
                { backgroundColor: category === c ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: category === c ? '#FFF' : theme.textPrimary }}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <Input
          placeholder="Estimated duration (minutes)"
          value={estimatedMinutes}
          onChangeText={(v) => setEstimatedMinutes(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Reminder</Text>
        <View style={styles.chipRow}>
          {REMINDER_OPTIONS.map((opt) => (
            <Pressable
              key={opt.label}
              onPress={() => setReminderMinutes(opt.value)}
              style={[
                styles.chip,
                { backgroundColor: reminderMinutes === opt.value ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: reminderMinutes === opt.value ? '#FFF' : theme.textPrimary, fontSize: typography.size.xs }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Repeat</Text>
        <View style={styles.chipRow}>
          {RECURRENCE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setRecurrenceType(opt.value)}
              style={[
                styles.chip,
                { backgroundColor: recurrenceType === opt.value ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: recurrenceType === opt.value ? '#FFF' : theme.textPrimary, fontSize: typography.size.xs }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={[styles.label, { color: theme.textSecondary }]}>Subtasks</Text>
        {subtasks.map((s, i) => (
          <View key={`${s}-${i}`} style={styles.subtaskRow}>
            <Text style={{ color: theme.textPrimary, flex: 1 }}>• {s}</Text>
            <Pressable onPress={() => setSubtasks((prev) => prev.filter((_, idx) => idx !== i))}>
              <Text style={{ color: theme.danger }}>Remove</Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.row}>
          <TextInput
            value={subtaskDraft}
            onChangeText={setSubtaskDraft}
            placeholder="Add a subtask"
            placeholderTextColor={theme.textMuted}
            style={[styles.subtaskInput, { borderColor: theme.border, color: theme.textPrimary }]}
            onSubmitEditing={addSubtaskDraft}
          />
          <Button label="Add" size="sm" variant="secondary" onPress={addSubtaskDraft} />
        </View>

        <Button
          label={editingTask ? 'Save changes' : 'Create task'}
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
          fullWidth
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  headerTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.sm, marginBottom: spacing.xs, marginTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  pickerButton: { borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 12 },
  clearButton: { paddingHorizontal: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  subtaskInput: { flex: 1, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10 },
});
