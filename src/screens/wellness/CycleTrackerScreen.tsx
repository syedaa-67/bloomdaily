import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { format } from 'date-fns';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, shadow, spacing, typography } from '@/theme/theme';
import { useWellnessStore } from '@/store/useWellnessStore';

const FLOW_OPTIONS: Array<{ label: string; value: 'light' | 'medium' | 'heavy' }> = [
  { label: 'Light', value: 'light' },
  { label: 'Medium', value: 'medium' },
  { label: 'Heavy', value: 'heavy' },
];
const SYMPTOM_OPTIONS = ['Cramps', 'Headache', 'Fatigue', 'Bloating', 'Mood swings', 'Backache'];

export function CycleTrackerScreen() {
  const theme = useTheme();
  const cycleSettings = useWellnessStore((s) => s.cycleSettings);
  const setCycleSettings = useWellnessStore((s) => s.setCycleSettings);
  const logCycleDay = useWellnessStore((s) => s.logCycleDay);
  const currentPhase = useWellnessStore((s) => s.getCurrentCyclePhase());
  const suggestion = useWellnessStore((s) => s.getCycleAwareSuggestion());

  const [flow, setFlow] = useState<'light' | 'medium' | 'heavy' | null>(null);
  const [symptoms, setSymptoms] = useState<string[]>([]);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const logToday = () => {
    logCycleDay({ date: format(new Date(), 'yyyy-MM-dd'), flow, symptoms });
    setFlow(null);
    setSymptoms([]);
  };

  if (!cycleSettings.isEnabled) {
    return (
      <ScreenContainer>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>Cycle tracking</Text>
        <Text style={[styles.explainer, { color: theme.textSecondary }]}>
          Completely optional and completely private — this data lives only on your device and is never
          included in analytics. Turning it on lets BloomDaily gently adjust daily suggestions to your energy.
        </Text>
        <Button label="Turn on cycle tracking" onPress={() => setCycleSettings({ isEnabled: true })} fullWidth />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: theme.textPrimary }]}>Cycle tracking</Text>
        <Switch value={cycleSettings.isEnabled} onValueChange={(v) => setCycleSettings({ isEnabled: v })} />
      </View>

      {currentPhase ? (
        <View style={[styles.card, shadow.soft, { backgroundColor: theme.accentSoft }]}>
          <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyBold, marginBottom: 4 }}>
            Estimated phase: {currentPhase[0].toUpperCase() + currentPhase.slice(1)}
          </Text>
          {suggestion ? <Text style={{ color: theme.textSecondary, fontSize: typography.size.sm }}>{suggestion}</Text> : null}
        </View>
      ) : null}

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Cycle settings</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 4 }}>
          Average cycle length: {cycleSettings.averageCycleLength} days
        </Text>
        <Slider
          minimumValue={21}
          maximumValue={40}
          step={1}
          value={cycleSettings.averageCycleLength}
          onSlidingComplete={(v) => setCycleSettings({ averageCycleLength: Math.round(v) })}
          minimumTrackTintColor={theme.primary}
        />
        <Text style={{ color: theme.textSecondary, marginTop: spacing.sm, marginBottom: 4 }}>
          Average period length: {cycleSettings.averagePeriodLength} days
        </Text>
        <Slider
          minimumValue={2}
          maximumValue={10}
          step={1}
          value={cycleSettings.averagePeriodLength}
          onSlidingComplete={(v) => setCycleSettings({ averagePeriodLength: Math.round(v) })}
          minimumTrackTintColor={theme.primary}
        />
        <Pressable
          onPress={() => setCycleSettings({ lastPeriodStartDate: format(new Date(), 'yyyy-MM-dd') })}
          style={{ marginTop: spacing.sm }}
        >
          <Text style={{ color: theme.primaryDark, fontFamily: typography.fontFamily.bodyMedium }}>
            My period started today
          </Text>
        </Pressable>
      </View>

      <View style={[styles.card, shadow.soft, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Log today</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: spacing.xs }}>Flow</Text>
        <View style={styles.chipRow}>
          {FLOW_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setFlow(opt.value)}
              style={[
                styles.chip,
                { backgroundColor: flow === opt.value ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: flow === opt.value ? '#FFF' : theme.textPrimary }}>{opt.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ color: theme.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs }}>Symptoms</Text>
        <View style={styles.chipRow}>
          {SYMPTOM_OPTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => toggleSymptom(s)}
              style={[
                styles.chip,
                { backgroundColor: symptoms.includes(s) ? theme.primary : theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={{ color: symptoms.includes(s) ? '#FFF' : theme.textPrimary, fontSize: typography.size.xs }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        <Button label="Save today's log" onPress={logToday} fullWidth style={{ marginTop: spacing.md }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  heading: { fontFamily: typography.fontFamily.headingBold, fontSize: typography.size.xxl },
  explainer: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, lineHeight: 20, marginBottom: spacing.lg },
  card: { borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md },
  cardTitle: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.md, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
});
