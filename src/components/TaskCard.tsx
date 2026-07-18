import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View, Modal } from 'react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { Task } from '@/types';
import { PriorityBadge, CategoryTag } from './Badges';
import { useTaskStore } from '@/store/useTaskStore';
import { SNOOZE_OPTIONS } from '@/services/notificationService';

interface Props {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: Props) {
  const theme = useTheme();
  const toggleTaskDone = useTaskStore((s) => s.toggleTaskDone);
  const snoozeTask = useTaskStore((s) => s.snoozeTask);
  const [snoozeVisible, setSnoozeVisible] = useState(false);

  const doneSubtasks = task.subtasks.filter((s) => s.isDone).length;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, shadow.soft, { backgroundColor: theme.card, opacity: task.isDone ? 0.6 : 1 }]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.isDone }}
        accessibilityLabel={`Mark "${task.title}" as ${task.isDone ? 'not done' : 'done'}`}
        hitSlop={10}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          toggleTaskDone(task.id);
        }}
        style={[
          styles.checkbox,
          { borderColor: theme.primary, backgroundColor: task.isDone ? theme.primary : 'transparent' },
        ]}
      >
        {task.isDone ? <Text style={styles.checkmark}>✓</Text> : null}
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.title,
            { color: theme.textPrimary, textDecorationLine: task.isDone ? 'line-through' : 'none' },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          <CategoryTag category={task.category} />
        </View>

        <View style={styles.metaRow}>
          {task.dueDate ? (
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {format(new Date(task.dueDate), 'h:mm a')}
            </Text>
          ) : null}
          {task.subtasks.length > 0 ? (
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {doneSubtasks}/{task.subtasks.length} subtasks
            </Text>
          ) : null}
          {task.estimatedMinutes ? (
            <Text style={[styles.metaText, { color: theme.textMuted }]}>~{task.estimatedMinutes} min</Text>
          ) : null}
        </View>
      </View>

      {!task.isDone ? (
        <Pressable
          accessibilityLabel="Remind me later"
          hitSlop={10}
          onPress={() => setSnoozeVisible(true)}
          style={styles.snoozeButton}
        >
          <Text style={{ fontSize: 16 }}>⏰</Text>
        </Pressable>
      ) : null}

      <Modal visible={snoozeVisible} transparent animationType="fade" onRequestClose={() => setSnoozeVisible(false)}>
        <Pressable style={[styles.overlay, { backgroundColor: theme.overlay }]} onPress={() => setSnoozeVisible(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>Remind me later</Text>
            <Text style={[styles.sheetSubtitle, { color: theme.textSecondary }]}>
              No pressure — just choose when you&apos;d like a gentle nudge.
            </Text>
            {SNOOZE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.label}
                onPress={() => {
                  snoozeTask(task.id, opt.minutes);
                  setSnoozeVisible(false);
                }}
                style={({ pressed }) => [
                  styles.snoozeOption,
                  { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: { color: '#FFF', fontSize: 14, fontFamily: typography.fontFamily.bodyBold },
  title: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.size.md, marginBottom: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4, alignItems: 'center' },
  metaText: { fontFamily: typography.fontFamily.body, fontSize: typography.size.xs },
  snoozeButton: { padding: spacing.xs },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { padding: spacing.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.lg, marginBottom: 4 },
  sheetSubtitle: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: spacing.md },
  snoozeOption: {
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
