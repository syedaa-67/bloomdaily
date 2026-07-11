import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { moodEmojis, radius, shadow, spacing, typography } from '@/theme/theme';
import { useWellnessStore } from '@/store/useWellnessStore';

export function MoodCheckIn() {
  const theme = useTheme();
  const logMoodCheckIn = useWellnessStore((s) => s.logMoodCheckIn);
  const existing = useWellnessStore((s) => s.getTodayMoodCheckIn());
  const [selectedMood, setSelectedMood] = useState<number | null>(existing?.moodIndex ?? null);
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(existing?.energyIndex ?? null);

  const submit = (mood: number, energy: number) => {
    setSelectedMood(mood);
    setSelectedEnergy(energy);
    logMoodCheckIn(mood, energy);
  };

  return (
    <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        {existing ? 'Thanks for checking in 🤍' : 'How are you feeling today?'}
      </Text>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Mood</Text>
      <View style={styles.row}>
        {moodEmojis.map((emoji, i) => (
          <Pressable
            key={`mood-${i}`}
            onPress={() => submit(i, selectedEnergy ?? i)}
            style={[
              styles.emojiButton,
              { backgroundColor: selectedMood === i ? theme.primarySoft : 'transparent' },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Energy</Text>
      <View style={styles.row}>
        {moodEmojis.map((_, i) => (
          <Pressable
            key={`energy-${i}`}
            onPress={() => submit(selectedMood ?? i, i)}
            style={[
              styles.energyPip,
              {
                backgroundColor: selectedEnergy !== null && i <= selectedEnergy ? theme.accent : theme.border,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  title: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginBottom: spacing.sm },
  label: { fontFamily: typography.fontFamily.bodyMedium, fontSize: typography.size.xs, marginBottom: 6, marginTop: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.xs },
  emojiButton: { padding: 8, borderRadius: radius.pill },
  emoji: { fontSize: 22 },
  energyPip: { flex: 1, height: 10, borderRadius: radius.pill },
});
