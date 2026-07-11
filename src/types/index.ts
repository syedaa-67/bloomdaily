export type Priority = 'High' | 'Medium' | 'Low';

export type Category =
  | 'Study'
  | 'Self-care'
  | 'Errands'
  | 'Health'
  | 'Work'
  | 'Social'
  | 'Other';

export type RecurrenceRule =
  | { type: 'none' }
  | { type: 'daily' }
  | { type: 'weekly'; daysOfWeek: number[] } // 0 = Sunday
  | { type: 'custom'; everyNDays: number };

export interface Subtask {
  id: string;
  title: string;
  isDone: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string | null; // ISO string
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  subtasks: Subtask[];
  recurrence: RecurrenceRule;
  isDone: boolean;
  completedAt?: string | null;
  createdAt: string;
  order: number;
  reminderMinutesBefore?: number | null;
  snoozeHistory: string[]; // ISO timestamps of each "remind me later" tap
  notificationIds: string[]; // scheduled expo-notifications identifiers
  templateOrigin?: string;
}

export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  tasks: Array<Pick<Task, 'title' | 'category' | 'priority' | 'estimatedMinutes'>>;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  createdAt: string;
  completedDates: string[]; // 'yyyy-MM-dd'
  targetDaysPerWeek: number;
}

export interface MoodCheckIn {
  id: string;
  date: string; // 'yyyy-MM-dd'
  moodIndex: number; // 0-4, see moodEmojis
  energyIndex: number; // 0-4
  note?: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  date: string; // 'yyyy-MM-dd'
  prompt: string;
  response: string;
  createdAt: string;
}

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';

export interface CycleLogEntry {
  id: string;
  date: string; // 'yyyy-MM-dd'
  flow?: 'light' | 'medium' | 'heavy' | null;
  symptoms: string[];
  note?: string;
}

export interface CycleSettings {
  isEnabled: boolean;
  averageCycleLength: number; // days
  averagePeriodLength: number; // days
  lastPeriodStartDate: string | null; // 'yyyy-MM-dd'
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface QuietHours {
  isEnabled: boolean;
  startHour: number; // 0-23
  endHour: number; // 0-23
}

export interface UserProfile {
  id: string;
  displayName: string;
  goals: string[]; // e.g. 'Balance study & life', 'Build habits'
  userType: 'student' | 'professional' | 'both' | 'other';
  onboardingComplete: boolean;
  authMode: 'guest' | 'firebase';
  email?: string | null;
  createdAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string | null;
  focusMinutes: number;
  breakMinutes: number;
  completedFocusBlocks: number;
  startedAt: string;
}
