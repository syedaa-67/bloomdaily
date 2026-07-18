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
    // React Navigation's own TS setup docs require exactly this
    // empty-interface-extends shape for global param list augmentation; a
    // `type` alias can't be merged this way, so this isn't a candidate for
    // simplifying away.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
