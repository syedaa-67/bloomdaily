import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '@/types';

/**
 * All reminders in BloomDaily are LOCAL, on-device scheduled notifications.
 * This is a deliberate choice: it means reminders work perfectly offline,
 * with zero backend, and (unlike remote push) they work in Expo Go too —
 * no development build required. See README for how to layer server-sent
 * push on top later (e.g. cross-device nudges) using expo-server-sdk.
 */

// expo-notifications does not support *scheduled* local notifications on
// web (only immediate ones, via the browser Notification API) — see
// https://docs.expo.dev/versions/latest/sdk/notifications/. Every reminder
// in this app is a scheduled one, so on web we skip scheduling entirely
// rather than let calls fail silently one by one. The rest of the app
// (tasks, habits, sync) works exactly the same either way — reminders are
// just a native-only enhancement.
const supportsScheduledNotifications = Platform.OS !== 'web';

if (supportsScheduledNotifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  if (!supportsScheduledNotifications) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'BloomDaily reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 150, 100, 150],
      lightColor: '#F2A6C1',
    });
  }
  return finalStatus === 'granted';
}

/** Cancel every notification previously scheduled for a task. */
export async function cancelTaskNotifications(task: Pick<Task, 'notificationIds'>) {
  if (!supportsScheduledNotifications) return;
  await Promise.all(task.notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
}

/**
 * Schedule the primary due-time reminder for a task, if it has a due date
 * and a reminder offset. Returns the new list of notification identifiers.
 */
export async function scheduleTaskReminder(task: Task): Promise<string[]> {
  if (!supportsScheduledNotifications) return [];
  await cancelTaskNotifications(task);

  if (!task.dueDate || task.isDone) return [];

  const offsetMinutes = task.reminderMinutesBefore ?? 0;
  const triggerDate = new Date(new Date(task.dueDate).getTime() - offsetMinutes * 60_000);
  if (triggerDate.getTime() <= Date.now()) return [];

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🌸 ${task.title}`,
      body: buildReminderBody(task),
      data: { taskId: task.id, kind: 'task-reminder' },
      categoryIdentifier: 'TASK_REMINDER',
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });

  return [id];
}

function buildReminderBody(task: Task): string {
  if (task.priority === 'High') return "This one's a priority — you've got this.";
  if (task.estimatedMinutes) return `About ${task.estimatedMinutes} min. Small steps count.`;
  return 'A gentle nudge from your future self.';
}

/** "Remind Me Later" quick options, in minutes. `null` means "end of day". */
export const SNOOZE_OPTIONS: { label: string; minutes: number | null }[] = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
  { label: 'End of day', minutes: null },
];

/** Schedule a one-off snooze notification and return its identifier. */
export async function scheduleSnooze(task: Task, minutesFromNow: number | null): Promise<string> {
  if (!supportsScheduledNotifications) return '';
  let triggerDate: Date;
  if (minutesFromNow === null) {
    triggerDate = new Date();
    triggerDate.setHours(20, 0, 0, 0); // 8pm "end of day" nudge
    if (triggerDate.getTime() <= Date.now()) triggerDate.setDate(triggerDate.getDate());
  } else {
    triggerDate = new Date(Date.now() + minutesFromNow * 60_000);
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `🌸 Still there? ${task.title}`,
      body: "Whenever you're ready — no pressure, just a gentle nudge.",
      data: { taskId: task.id, kind: 'snooze' },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
  });
}

/**
 * Schedule the recurring evening "End of Day" summary notification.
 * This is scheduled once (daily-repeating) rather than per task, and the
 * *content* is computed fresh each evening by useEndOfDayEnforcement via a
 * lightweight in-app check — the OS trigger just makes sure the user opens
 * the app around the right time. See hooks/useEndOfDayEnforcement.ts.
 */
export async function scheduleDailyEveningCheckIn(hour: number, minute: number): Promise<string> {
  if (!supportsScheduledNotifications) return '';
  await Notifications.cancelScheduledNotificationAsync(EVENING_CHECKIN_ID).catch(() => {});
  return Notifications.scheduleNotificationAsync({
    identifier: EVENING_CHECKIN_ID,
    content: {
      title: '🌙 Evening check-in',
      body: "Let's see what's left today — reschedule or wrap up before midnight.",
      data: { kind: 'evening-checkin' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export const EVENING_CHECKIN_ID = 'bloomdaily-evening-checkin';

export async function cancelDailyEveningCheckIn() {
  if (!supportsScheduledNotifications) return;
  await Notifications.cancelScheduledNotificationAsync(EVENING_CHECKIN_ID).catch(() => {});
}

/** Respect custom quiet hours by suppressing (not canceling) same-day reminders. */
export function isWithinQuietHours(
  date: Date,
  quietHours: { isEnabled: boolean; startHour: number; endHour: number }
): boolean {
  if (!quietHours.isEnabled) return false;
  const hour = date.getHours();
  const { startHour, endHour } = quietHours;
  if (startHour === endHour) return false;
  if (startHour < endHour) return hour >= startHour && hour < endHour;
  return hour >= startHour || hour < endHour; // wraps past midnight
}
