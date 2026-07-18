import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { addDays } from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { useWellnessStore } from '@/store/useWellnessStore';
import { getPromptForDate } from '@/services/quotes';
import { RootStackParamList } from '@/navigation/types';

export function EndOfDayReviewScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasks = useTaskStore((s) => s.tasks);
  const getTasksForDate = useTaskStore((s) => s.getTasksForDate);
  const rescheduleTask = useTaskStore((s) => s.rescheduleTask);
  const addJournalEntry = useWellnessStore((s) => s.addJournalEntry);

  // getTasksForDate returns a fresh array every call, so it has to be
  // stabilized against the actual store state (`tasks`) before anything
  // downstream can usefully memoize off of it.
  const todayTasks = useMemo(() => {
    // getTasksForDate closes over the store's own `tasks` internally, so this
    // call doesn't read `tasks` directly — but it must still be a dependency
    // so the memo invalidates whenever the store's tasks actually change.
    void tasks;
    return getTasksForDate(new Date());
  }, [tasks, getTasksForDate]);
  const completed = useMemo(() => todayTasks.filter((t) => t.isDone), [todayTasks]);
  const unfinished = useMemo(
    () => [...todayTasks.filter((t) => !t.isDone)].sort((a, b) => (a.priority === 'High' ? -1 : 1)),
    [todayTasks]
  );

  const prompt = getPromptForDate();
  const [reflection, setReflection] = useState('');
  const [rescheduled, setRescheduled] = useState<Set<string>>(new Set());

  const rescheduleToTomorrow = async (taskId: string, currentDue: string | null) => {
    const base = currentDue ? new Date(currentDue) : new Date();
    const tomorrow = addDays(base, 1);
    await rescheduleTask(taskId, tomorrow.toISOString());
    setRescheduled((prev) => new Set(prev).add(taskId));
  };

  const saveReflection = () => {
    if (reflection.trim()) addJournalEntry(prompt, reflection.trim());
    navigation.goBack();
  };

  return (
    <ScreenContainer>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Evening check-in 🌙</Text>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
          🎉 You completed {completed.length} task{completed.length === 1 ? '' : 's'} today
        </Text>
        {completed.slice(0, 5).map((t) => (
          <Text key={t.id} style={[styles.doneItem, { color: theme.textSecondary }]}>
            ✓ {t.title}
          </Text>
        ))}
        {completed.length === 0 ? (
          <Text style={[styles.doneItem, { color: theme.textSecondary }]}>
            That&apos;s okay — tomorrow is a fresh page.
          </Text>
        ) : null}
      </View>

      {unfinished.length > 0 ? (
        <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Still open today</Text>
          {unfinished.map((t) => (
            <View key={t.id} style={styles.unfinishedRow}>
              <Text style={{ color: theme.textPrimary, flex: 1 }}>{t.title}</Text>
              {rescheduled.has(t.id) ? (
                <Text style={{ color: theme.success, fontSize: typography.size.xs }}>Moved to tomorrow</Text>
              ) : (
                <Pressable onPress={() => rescheduleToTomorrow(t.id, t.dueDate)}>
                  <Text
                    style={{
                      color: theme.primaryDark,
                      fontSize: typography.size.xs,
                      fontFamily: typography.fontFamily.bodyBold,
                    }}
                  >
                    Move to tomorrow
                  </Text>
                </Pressable>
              )}
            </View>
          ))}
        </View>
      ) : null}

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>A moment to reflect</Text>
        <Text style={[styles.promptText, { color: theme.textSecondary }]}>{prompt}</Text>
        <Input
          placeholder="Write a line or two…"
          value={reflection}
          onChangeText={setReflection}
          multiline
          numberOfLines={3}
          style={{ height: 80, textAlignVertical: 'top' }}
        />
      </View>

      <Button label="Done for today" onPress={saveReflection} fullWidth />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.size.xxl,
    marginBottom: spacing.md,
  },
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.size.md,
    marginBottom: spacing.sm,
  },
  doneItem: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: 4 },
  unfinishedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  promptText: {
    fontFamily: typography.fontFamily.body,
    fontStyle: 'italic',
    fontSize: typography.size.sm,
    marginBottom: spacing.sm,
  },
});
