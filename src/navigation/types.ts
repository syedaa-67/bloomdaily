import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Dashboard: undefined;
  Tasks: undefined;
  Pomodoro: { taskId?: string } | undefined;
  Habits: undefined;
  Analytics: undefined;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Welcome: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  AddEditTask: { taskId?: string; prefillTitle?: string } | undefined;
  TaskDetail: { taskId: string };
  Calendar: undefined;
  EndOfDayReview: undefined;
  Settings: undefined;
  Privacy: undefined;
  CycleTracker: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
