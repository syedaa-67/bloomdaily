import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/theme/ThemeProvider';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { useUserStore } from '@/store/useUserStore';
import { WelcomeScreen } from '@/screens/auth/WelcomeScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { AddEditTaskScreen } from '@/screens/tasks/AddEditTaskScreen';
import { TaskDetailScreen } from '@/screens/tasks/TaskDetailScreen';
import { CalendarScreen } from '@/screens/calendar/CalendarScreen';
import { EndOfDayReviewScreen } from '@/screens/review/EndOfDayReviewScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { PrivacyScreen } from '@/screens/settings/PrivacyScreen';
import { CycleTrackerScreen } from '@/screens/wellness/CycleTrackerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const profile = useUserStore((s) => s.profile);

  const navigationTheme = {
    ...(theme.mode === 'dark' ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.surface,
      text: theme.textPrimary,
      border: theme.border,
      primary: theme.primary,
    },
  };

  const needsWelcome = !profile;
  const needsOnboarding = profile && !profile.onboardingComplete;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {needsWelcome ? (
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
        ) : needsOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="AddEditTask" component={AddEditTaskScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ presentation: 'card' }} />
            <Stack.Screen name="Calendar" component={CalendarScreen} />
            <Stack.Screen name="EndOfDayReview" component={EndOfDayReviewScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Privacy" component={PrivacyScreen} />
            <Stack.Screen name="CycleTracker" component={CycleTrackerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
