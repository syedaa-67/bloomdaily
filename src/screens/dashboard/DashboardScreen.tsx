import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/components/ScreenContainer';
import { QuickAddBar } from '@/components/QuickAddBar';
import { TaskCard } from '@/components/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { MoodCheckIn } from '@/components/MoodCheckIn';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, typography, radius } from '@/theme/theme';
import { useTaskStore } from '@/store/useTaskStore';
import { useUserStore } from '@/store/useUserStore';
import { useWellnessStore } from '@/store/useWellnessStore';
import { getQuoteForDate } from '@/services/quotes';
import { useEndOfDayEnforcement } from '@/hooks/useEndOfDayEnforcement';
import { RootStackParamList } from '@/navigation/types';

function getGreeting(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const profile = useUserStore((s) => s.profile);
  
  // 1. Grab stable calculation methods from stores
  const getTopPrioritiesForToday = useTaskStore((s) => s.getTopPrioritiesForToday);
  const getCycleAwareSuggestion = useWellnessStore((s) => s.getCycleAwareSuggestion);
  
  // 2. Subscribe to raw states to invalidate the cache during data mutations
  const tasks = useTaskStore((s) => s.tasks);
  const cycleSettings = useWellnessStore((s) => s.cycleSettings);
  const cycleLogs = useWellnessStore((s) => s.cycleLogs);

  // 3. Keep cache values correctly bound to data changes
  const topPriorities = useMemo(() => {
    return getTopPrioritiesForToday(3);
  }, [tasks, getTopPrioritiesForToday]);

  const cycleSuggestion = useMemo(() => {
    return getCycleAwareSuggestion();
  }, [cycleSettings, cycleLogs, getCycleAwareSuggestion]);

  const { shouldPromptReview, unfinishedToday } = useEndOfDayEnforcement();

  const quote = getQuoteForDate();
  const greeting = getGreeting(new Date().getHours());

  return (
    <ScreenContainer>
      <View style={styles.topRow}>
        <Text style={[styles.greeting, { color: theme.textPrimary }]}>
          {greeting}, {profile?.displayName ?? 'friend'} 🌸
        </Text>
        <View style={styles.topRowIcons}>
          <Pressable onPress={() => navigation.navigate('Calendar')} hitSlop={10} style={{ marginRight: spacing.md }}>
            <Text style={{ fontSize: 20 }}>📅</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
            <Text style={{ fontSize: 20 }}>⚙️</Text>
          </Pressable>
        </View>
      </View>
      <Text style={[styles.quote, { color: theme.textSecondary }]}>{quote}</Text>

      {shouldPromptReview ? (
        <Pressable
          onPress={() => navigation.navigate('EndOfDayReview')}
          style={[styles.reviewBanner, { backgroundColor: theme.primarySoft }]}
        >
          <Text style={{ color: theme.primaryDark, fontFamily: typography.fontFamily.bodyBold }}>
            🌙 {unfinishedToday.length} task{unfinishedToday.length === 1 ? '' : 's'} left today
          </Text>
          <Text style={{ color: theme.primaryDark, fontFamily: typography.fontFamily.body, fontSize: typography.size.xs }}>
            Tap to review, reschedule, or celebrate what&apos;s done.
          </Text>
        </Pressable>
      ) : null}

      {cycleSuggestion ? (
        <View style={[styles.suggestionCard, { backgroundColor: theme.accentSoft }]}>
          <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.sm }}>
            💜 {cycleSuggestion}
          </Text>
        </View>
      ) : null}

      <QuickAddBar />
      <MoodCheckIn />

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today&apos;s top priorities</Text>
      {topPriorities.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Nothing pinned yet"
          message="Add a task above, or head to your full list to plan today."
          actionLabel="View all tasks"
          onAction={() => navigation.navigate('Main', { screen: 'Tasks' })}
        />
      ) : (
        topPriorities.map((task) => (
          <TaskCard key={task.id} task={task} onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })} />
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  topRowIcons: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  greeting: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl, flex: 1, marginRight: spacing.sm },
  quote: {
    fontFamily: typography.fontFamily.body,
    fontStyle: 'italic',
    fontSize: typography.size.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  reviewBanner: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  suggestionCard: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.size.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});