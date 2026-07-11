import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useTaskStore } from '@/store/useTaskStore';
import { Task } from '@/types';

/**
 * Surfaces the "gentle evening summary" described in the spec: unfinished
 * high-priority tasks due today, so the user can reschedule or wrap up
 * before midnight. The actual notification trigger is a daily-repeating OS
 * alarm (see notificationService.scheduleDailyEveningCheckIn) — this hook
 * computes what to *show* once the user opens the app around that time, and
 * also exposes the same data so a screen can render it proactively.
 */
export function useEndOfDayEnforcement() {
  const tasks = useTaskStore((s) => s.tasks);
  const getTasksForDate = useTaskStore((s) => s.getTasksForDate);
  const [unfinishedToday, setUnfinishedToday] = useState<Task[]>([]);
  const [shouldPromptReview, setShouldPromptReview] = useState(false);

  useEffect(() => {
    const today = getTasksForDate(new Date()).filter((t) => !t.isDone);
    const sorted = [...today].sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 };
      return rank[a.priority] - rank[b.priority];
    });
    setUnfinishedToday(sorted);

    const hour = new Date().getHours();
    setShouldPromptReview(hour >= 18 && sorted.length > 0);
  }, [tasks, getTasksForDate]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const kind = response.notification.request.content.data?.kind;
      if (kind === 'evening-checkin') {
        setShouldPromptReview(true);
      }
    });
    return () => sub.remove();
  }, []);

  return { unfinishedToday, shouldPromptReview, dismissReviewPrompt: () => setShouldPromptReview(false) };
}
