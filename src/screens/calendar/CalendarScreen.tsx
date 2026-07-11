import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { RootStackParamList } from '@/navigation/types';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function CalendarScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const tasks = useTaskStore((s) => s.tasks);
  const getTasksForDate = useTaskStore((s) => s.getTasksForDate);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth));
    const end = endOfWeek(endOfMonth(visibleMonth));
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, number>();
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      const key = new Date(t.dueDate).toDateString();
      map.set(key, (map.get(key) ?? 0) + 1);
    });
    return map;
  }, [tasks]);

  const selectedTasks = getTasksForDate(selectedDate);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => setVisibleMonth((m) => subMonths(m, 1))}>
          <Text style={{ color: theme.textPrimary, fontSize: 20 }}>‹</Text>
        </Pressable>
        <Text style={[styles.monthLabel, { color: theme.textPrimary }]}>{format(visibleMonth, 'MMMM yyyy')}</Text>
        <Pressable onPress={() => setVisibleMonth((m) => addMonths(m, 1))}>
          <Text style={{ color: theme.textPrimary, fontSize: 20 }}>›</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((d, i) => (
          <Text key={`${d}-${i}`} style={[styles.weekdayLabel, { color: theme.textMuted }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const inMonth = isSameMonth(day, visibleMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          const count = tasksByDay.get(day.toDateString()) ?? 0;
          return (
            <Pressable key={day.toISOString()} style={styles.dayCell} onPress={() => setSelectedDate(day)}>
              <View
                style={[
                  styles.dayCircle,
                  isSelected && { backgroundColor: theme.primary },
                  !isSelected && isToday && { borderWidth: 1.5, borderColor: theme.primary },
                ]}
              >
                <Text
                  style={{
                    color: isSelected ? '#FFF' : inMonth ? theme.textPrimary : theme.textMuted,
                    fontFamily: typography.fontFamily.bodyMedium,
                  }}
                >
                  {format(day, 'd')}
                </Text>
              </View>
              {count > 0 ? <View style={[styles.dot, { backgroundColor: isSelected ? theme.primary : theme.accent }]} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{format(selectedDate, 'EEEE, MMM d')}</Text>
      {selectedTasks.length === 0 ? (
        <EmptyState emoji="📅" title="Nothing scheduled" message="This day is wide open." />
      ) : (
        selectedTasks.map((task) => (
          <TaskCard key={task.id} task={task} onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })} />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.sm, marginBottom: spacing.md },
  monthLabel: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.lg },
  weekdayRow: { flexDirection: 'row', marginBottom: spacing.xs },
  weekdayLabel: { flex: 1, textAlign: 'center', fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, alignItems: 'center', marginBottom: spacing.xs },
  dayCircle: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 3 },
  sectionTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
});
