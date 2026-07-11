import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { format, subDays } from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/theme/ThemeProvider';
import { categoryColors, radius, shadow, spacing, typography } from '@/theme/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { useWellnessStore } from '@/store/useWellnessStore';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 140;
const BAR_GAP = 8;

export function AnalyticsScreen() {
  const theme = useTheme();
  const tasks = useTaskStore((s) => s.tasks);
  const habits = useWellnessStore((s) => s.habits);

  const last7Days = useMemo(() => Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i)), []);

  const dailyCompletion = useMemo(() => {
    return last7Days.map((day) => {
      const key = day.toDateString();
      const dayTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === key);
      const done = dayTasks.filter((t) => t.isDone).length;
      return { day, total: dayTasks.length, done };
    });
  }, [tasks, last7Days]);

  const totalTasksThisWeek = dailyCompletion.reduce((sum, d) => sum + d.total, 0);
  const totalDoneThisWeek = dailyCompletion.reduce((sum, d) => sum + d.done, 0);
  const completionRate = totalTasksThisWeek > 0 ? Math.round((totalDoneThisWeek / totalTasksThisWeek) * 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    tasks
      .filter((t) => t.isDone)
      .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + 1));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [tasks]);

  const maxDaily = Math.max(1, ...dailyCompletion.map((d) => d.total));
  const barWidth = (CHART_WIDTH - BAR_GAP * 6) / 7;

  if (tasks.length === 0) {
    return (
      <ScreenContainer>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>Your progress</Text>
        <EmptyState emoji="📊" title="Nothing to show yet" message="Complete a few tasks and check back — your trends will appear here." />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Your progress</Text>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>This week</Text>
        <Text style={[styles.bigStat, { color: theme.primaryDark }]}>{completionRate}%</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          {totalDoneThisWeek} of {totalTasksThisWeek} tasks completed
        </Text>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} style={{ marginTop: spacing.md }}>
          {dailyCompletion.map((d, i) => {
            const totalHeight = (d.total / maxDaily) * (CHART_HEIGHT - 24);
            const doneHeight = d.total > 0 ? (d.done / d.total) * totalHeight : 0;
            const x = i * (barWidth + BAR_GAP);
            return (
              <React.Fragment key={d.day.toISOString()}>
                <Rect
                  x={x}
                  y={CHART_HEIGHT - 24 - totalHeight}
                  width={barWidth}
                  height={totalHeight}
                  rx={6}
                  fill={theme.border}
                />
                <Rect
                  x={x}
                  y={CHART_HEIGHT - 24 - doneHeight}
                  width={barWidth}
                  height={doneHeight}
                  rx={6}
                  fill={theme.primary}
                />
              </React.Fragment>
            );
          })}
        </Svg>
        <View style={styles.dayLabelsRow}>
          {dailyCompletion.map((d) => (
            <Text key={d.day.toISOString()} style={[styles.dayLabel, { color: theme.textMuted, width: barWidth }]}>
              {format(d.day, 'EEEEE')}
            </Text>
          ))}
        </View>
      </View>

      {categoryBreakdown.length > 0 ? (
        <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Completed by category</Text>
          {categoryBreakdown.map(([category, count]) => {
            const max = categoryBreakdown[0][1];
            const widthPct = (count / max) * 100;
            return (
              <View key={category} style={styles.categoryRow}>
                <Text style={[styles.categoryLabel, { color: theme.textPrimary }]}>{category}</Text>
                <View style={[styles.categoryTrack, { backgroundColor: theme.background }]}>
                  <View
                    style={[
                      styles.categoryFill,
                      { width: `${widthPct}%`, backgroundColor: categoryColors[category] ?? theme.primary },
                    ]}
                  />
                </View>
                <Text style={[styles.categoryCount, { color: theme.textMuted }]}>{count}</Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {habits.length > 0 ? (
        <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Habit consistency (7 days)</Text>
          {habits.map((habit) => {
            const doneCount = last7Days.filter((d) => habit.completedDates.includes(format(d, 'yyyy-MM-dd'))).length;
            return (
              <View key={habit.id} style={styles.categoryRow}>
                <Text style={[styles.categoryLabel, { color: theme.textPrimary }]}>
                  {habit.emoji} {habit.name}
                </Text>
                <View style={[styles.categoryTrack, { backgroundColor: theme.background }]}>
                  <View style={[styles.categoryFill, { width: `${(doneCount / 7) * 100}%`, backgroundColor: theme.accent }]} />
                </View>
                <Text style={[styles.categoryCount, { color: theme.textMuted }]}>{doneCount}/7</Text>
              </View>
            );
          })}
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl, marginBottom: spacing.md },
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginBottom: spacing.xs },
  bigStat: { fontFamily: typography.fontFamily.headingBold, fontSize: 40 },
  statLabel: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm },
  dayLabelsRow: { flexDirection: 'row', gap: BAR_GAP, marginTop: 4 },
  dayLabel: { textAlign: 'center', fontFamily: typography.fontFamily.body, fontSize: 11 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  categoryLabel: { width: 100, fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.xs },
  categoryTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  categoryFill: { height: '100%', borderRadius: 4 },
  categoryCount: { width: 30, textAlign: 'right', fontFamily: typography.fontFamily.body, fontSize: typography.size.xs },
});
