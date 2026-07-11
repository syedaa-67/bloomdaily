import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme/ThemeProvider';
import { typography } from '@/theme/theme';
import { TabParamList } from './types';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { TaskListScreen } from '@/screens/tasks/TaskListScreen';
import { PomodoroScreen } from '@/screens/pomodoro/PomodoroScreen';
import { HabitTrackerScreen } from '@/screens/habits/HabitTrackerScreen';
import { AnalyticsScreen } from '@/screens/analytics/AnalyticsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<keyof TabParamList, string> = {
  Dashboard: '🏡',
  Tasks: '📝',
  Pomodoro: '⏱️',
  Habits: '🌿',
  Analytics: '📊',
};

export function TabNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.primaryDark,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
        tabBarLabelStyle: { fontFamily: typography.fontFamily.bodyMedium, fontSize: 11 },
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{TAB_ICONS[route.name as keyof TabParamList]}</Text>,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Tasks" component={TaskListScreen} />
      <Tab.Screen name="Pomodoro" component={PomodoroScreen} />
      <Tab.Screen name="Habits" component={HabitTrackerScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}
