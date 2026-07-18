import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Button } from '@/components/Button';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, typography } from '@/theme/theme';
import { useUserStore } from '@/store/useUserStore';
import { UserProfile } from '@/types';
import { ensureNotificationPermissions } from '@/services/notificationService';

const GOAL_OPTIONS = [
  'Balance studies & life',
  'Build consistent habits',
  'Stop procrastinating',
  'Protect self-care time',
  'Feel less overwhelmed',
  'Track my wellness',
];

const USER_TYPES: { label: string; value: UserProfile['userType'] }[] = [
  { label: 'Student', value: 'student' },
  { label: 'Professional', value: 'professional' },
  { label: 'Both', value: 'both' },
  { label: 'Something else', value: 'other' },
];

export function OnboardingScreen() {
  const theme = useTheme();
  const completeOnboarding = useUserStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [userType, setUserType] = useState<UserProfile['userType']>('student');

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
  };

  const finish = async () => {
    await ensureNotificationPermissions().catch(() => {});
    completeOnboarding(selectedGoals, userType);
  };

  return (
    <ScreenContainer>
      {step === 0 ? (
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>What brings you here?</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>Pick as many as you like.</Text>
          <View style={styles.chipWrap}>
            {GOAL_OPTIONS.map((goal) => {
              const selected = selectedGoals.includes(goal);
              return (
                <Pressable
                  key={goal}
                  onPress={() => toggleGoal(goal)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.primary : theme.surface,
                      borderColor: selected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? '#FFF' : theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium }}>
                    {goal}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button label="Continue" onPress={() => setStep(1)} fullWidth style={{ marginTop: spacing.xl }} />
        </View>
      ) : (
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>How would you describe yourself?</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            This just helps us tailor suggestions — nothing is shared.
          </Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            {USER_TYPES.map((opt) => {
              const selected = userType === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setUserType(opt.value)}
                  style={[
                    styles.option,
                    { backgroundColor: selected ? theme.primarySoft : theme.surface, borderColor: selected ? theme.primary : theme.border },
                  ]}
                >
                  <Text style={{ color: theme.textPrimary, fontFamily: typography.fontFamily.bodyMedium }}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>
          <Button label="Enable gentle reminders & begin" onPress={finish} fullWidth style={{ marginTop: spacing.xl }} />
          <Button label="Back" variant="ghost" onPress={() => setStep(0)} fullWidth />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: typography.fontFamily.heading, fontSize: typography.size.xl, marginBottom: spacing.xs },
  subheading: { fontFamily: typography.fontFamily.body, fontSize: typography.size.sm, marginBottom: spacing.lg },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1 },
  option: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1 },
});
