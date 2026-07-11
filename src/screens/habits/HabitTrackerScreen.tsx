import React, { useState } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { format, subDays } from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { EmptyState } from '@/components/EmptyState';
import { StreakBadge } from '@/components/Badges';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { useWellnessStore } from '@/store/useWellnessStore';
import { Category } from '@/types';

const HABIT_EMOJIS = ['💧', '📚', '🧘', '🏃', '🥗', '😴', '✍️', '🌱'];
const CATEGORIES: Category[] = ['Study', 'Self-care', 'Health', 'Work', 'Other'];
const LAST_7_DAYS = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));

export function HabitTrackerScreen() {
  const theme = useTheme();
  const habits = useWellnessStore((s) => s.habits);
  const addHabit = useWellnessStore((s) => s.addHabit);
  const removeHabit = useWellnessStore((s) => s.removeHabit);
  const toggleHabitToday = useWellnessStore((s) => s.toggleHabitToday);
  const getHabitStreak = useWellnessStore((s) => s.getHabitStreak);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(HABIT_EMOJIS[0]);
  const [category, setCategory] = useState<Category>('Health');

  const submit = () => {
    if (!name.trim()) return;
    addHabit(name.trim(), emoji, category, 7);
    setName('');
    setShowForm(false);
  };

  const shareStreak = (habitName: string, emoji: string, streak: number) => {
    Share.share({
      message: `${emoji} ${streak} day streak on "${habitName}" — building this one day at a time with BloomDaily 🌸`,
    }).catch(() => {});
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>Habits</Text>
        <Pressable onPress={() => setShowForm((v) => !v)} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Text style={styles.addButtonText}>{showForm ? '×' : '+'}</Text>
        </Pressable>
      </View>

      {showForm ? (
        <View style={[styles.formCard, shadow.soft, { backgroundColor: theme.card }]}>
          <Input placeholder="Habit name, e.g. Drink water" value={name} onChangeText={setName} />
          <View style={styles.emojiRow}>
            {HABIT_EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={[styles.emojiChip, { backgroundColor: emoji === e ? theme.primarySoft : 'transparent' }]}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.emojiRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.categoryChip,
                  { backgroundColor: category === c ? theme.primary : theme.surface, borderColor: theme.border },
                ]}
              >
                <Text style={{ color: category === c ? '#FFF' : theme.textPrimary, fontSize: typography.size.xs }}>{c}</Text>
              </Pressable>
            ))}
          </View>
          <Button label="Add habit" onPress={submit} fullWidth />
        </View>
      ) : null}

      {habits.length === 0 && !showForm ? (
        <EmptyState
          emoji="🌿"
          title="No habits yet"
          message="Start with one small, doable habit — consistency beats intensity."
          actionLabel="Add your first habit"
          onAction={() => setShowForm(true)}
        />
      ) : (
        habits.map((habit) => {
          const streak = getHabitStreak(habit.id);
          const doneToday = habit.completedDates.includes(format(new Date(), 'yyyy-MM-dd'));
          return (
            <View key={habit.id} style={[styles.habitCard, shadow.soft, { backgroundColor: theme.card }]}>
              <View style={styles.habitHeader}>
                <Text style={styles.habitEmoji}>{habit.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.habitName, { color: theme.textPrimary }]}>{habit.name}</Text>
                  <StreakBadge count={streak} />
                </View>
                <Pressable
                  onPress={() => toggleHabitToday(habit.id)}
                  style={[
                    styles.todayCheckbox,
                    { borderColor: theme.primary, backgroundColor: doneToday ? theme.primary : 'transparent' },
                  ]}
                >
                  {doneToday ? <Text style={{ color: '#FFF' }}>✓</Text> : null}
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {LAST_7_DAYS.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  const done = habit.completedDates.includes(key);
                  return (
                    <View key={key} style={styles.weekDay}>
                      <Text style={[styles.weekDayLabel, { color: theme.textMuted }]}>{format(day, 'EEEEE')}</Text>
                      <View
                        style={[
                          styles.weekDot,
                          { backgroundColor: done ? theme.primary : theme.border },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.cardFooter}>
                <Pressable onPress={() => removeHabit(habit.id)}>
                  <Text style={{ color: theme.textMuted, fontSize: typography.size.xs }}>Remove habit</Text>
                </Pressable>
                {streak > 0 ? (
                  <Pressable onPress={() => shareStreak(habit.name, habit.emoji, streak)}>
                    <Text style={{ color: theme.primaryDark, fontSize: typography.size.xs, fontFamily: typography.fontFamily.bodyBold }}>
                      Share streak
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  heading: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl },
  addButton: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#FFF', fontSize: 20, fontFamily: typography.fontFamily.bodyBold, marginTop: -2 },
  formCard: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  emojiChip: { padding: 8, borderRadius: radius.pill },
  categoryChip: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1 },
  habitCard: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  habitHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  habitEmoji: { fontSize: 28 },
  habitName: { fontFamily: typography.fontFamily.bodyBold, fontSize: typography.size.md, marginBottom: 4 },
  todayCheckbox: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', gap: 4 },
  weekDayLabel: { fontFamily: typography.fontFamily.body, fontSize: 10 },
  weekDot: { width: 18, height: 18, borderRadius: 9 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
});
