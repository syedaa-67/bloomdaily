import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ProgressRing } from '@/components/ProgressRing';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { palette, radius, spacing, typography } from '@/theme/theme';
import { usePomodoro } from '@/hooks/usePomodoro';
import { usePomodoroStore } from '@/store/usePomodoroStore';
import { useTaskStore } from '@/store/useTaskStore';
import { TabParamList } from '@/navigation/types';

const AMBIENT_OPTIONS: { label: string; value: 'none' | 'rain' | 'lofi' | 'whitenoise' }[] = [
  { label: 'None', value: 'none' },
  { label: '🌧️ Rain', value: 'rain' },
  { label: '🎧 Lo-fi', value: 'lofi' },
  { label: '⚪ White noise', value: 'whitenoise' },
];

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

const PHASE_LABEL: Record<string, string> = {
  idle: 'Ready when you are',
  focus: 'Focus time',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

export function PomodoroScreen() {
  const theme = useTheme();
  const route = useRoute<RouteProp<TabParamList, 'Pomodoro'>>();
  const taskId = route.params?.taskId ?? null;

  const tasks = useTaskStore((s) => s.tasks);
  const linkedTask = useMemo(() => tasks.find((t) => t.id === taskId), [tasks, taskId]);

  // Isolated store subscribers to eliminate global slice updates
  const focusMinutes = usePomodoroStore((s) => s.focusMinutes);
  const breakMinutes = usePomodoroStore((s) => s.breakMinutes);
  const longBreakMinutes = usePomodoroStore((s) => s.longBreakMinutes);
  const sessionsUntilLongBreak = usePomodoroStore((s) => s.sessionsUntilLongBreak);
  const setDurations = usePomodoroStore((s) => s.setDurations);

  const { phase, secondsLeft, isRunning, completedBlocks, progress, start, pause, reset, skip } =
    usePomodoro(taskId);

  const ringColor = phase === 'focus' ? palette.bloom : palette.sage;

  return (
    <ScreenContainer>
      <Text style={[styles.heading, { color: theme.textPrimary }]}>Focus mode</Text>
      {linkedTask ? (
        <Text style={[styles.linkedTask, { color: theme.textSecondary }]}>
          Working on: {linkedTask.title}
        </Text>
      ) : (
        <Text style={[styles.linkedTask, { color: theme.textMuted }]}>No task linked — just focusing 🌿</Text>
      )}

      <View style={styles.ringWrap}>
        <ProgressRing progress={progress} size={240} strokeWidth={16} color={ringColor}>
          <Text style={[styles.timerText, { color: theme.textPrimary }]}>{formatTime(secondsLeft)}</Text>
          <Text style={[styles.phaseText, { color: theme.textSecondary }]}>{PHASE_LABEL[phase]}</Text>
        </ProgressRing>
      </View>

      <Text style={[styles.blocksText, { color: theme.textMuted }]}>
        {completedBlocks} focus block{completedBlocks === 1 ? '' : 's'} completed today
      </Text>

      <View style={styles.controlsRow}>
        {isRunning ? (
          <Button label="Pause" onPress={pause} variant="secondary" />
        ) : (
          <Button label={phase === 'idle' ? 'Start focusing' : 'Resume'} onPress={start} />
        )}
        <Button label="Skip" onPress={skip} variant="ghost" />
        <Button label="Reset" onPress={reset} variant="ghost" />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Session lengths</Text>
      <View style={styles.durationRow}>
        {[15, 25, 45, 60].map((min) => (
          <Pressable
            key={min}
            onPress={() => setDurations(min, breakMinutes, longBreakMinutes, sessionsUntilLongBreak)}
            style={[
              styles.durationChip,
              {
                backgroundColor: focusMinutes === min ? theme.primary : theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <Text style={{ color: focusMinutes === min ? '#FFF' : theme.textPrimary }}>{min} min</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ambient sound</Text>
      <View style={styles.durationRow}>
        {AMBIENT_OPTIONS.map((opt) => (
          <View
            key={opt.value}
            style={[styles.durationChip, { borderColor: theme.border, backgroundColor: theme.surface }]}
          >
            <Text style={{ color: theme.textSecondary, fontSize: typography.size.sm }}>{opt.label}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.note, { color: theme.textMuted }]}>
        Ambient audio needs a bundled sound file (expo-av) — drop your own .mp3s into assets/sounds and wire
        them up here; left as a hook point to keep this starter lightweight.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: typography.fontFamily.headingBold,
    fontSize: typography.size.xxl,
    textAlign: 'center',
  },
  linkedTask: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  ringWrap: { alignItems: 'center', marginVertical: spacing.lg },
  timerText: { fontFamily: typography.fontFamily.headingBold, fontSize: 44 },
  phaseText: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.sm, marginTop: 4 },
  blocksText: {
    textAlign: 'center',
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.sm,
    marginBottom: spacing.lg,
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: typography.fontFamily.heading,
    fontSize: typography.size.md,
    marginBottom: spacing.sm,
  },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  durationChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  note: {
    fontFamily: typography.fontFamily.body,
    fontSize: typography.size.xs,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
});