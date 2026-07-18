import { useEffect, useMemo, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useTaskStore } from '@/store/useTaskStore';

export function useEndOfDayEnforcement() {
  const tasks = useTaskStore((s) => s.tasks);
  const getTasksForDate = useTaskStore((s) => s.getTasksForDate);
  
  const unfinishedToday = useMemo(() => {
    const today = getTasksForDate(new Date()).filter((t) => !t.isDone);
    return [...today].sort((a, b) => {
      const rank = { High: 0, Medium: 1, Low: 2 };
      return rank[a.priority] - rank[b.priority];
    });
  }, [tasks, getTasksForDate]);

  const [shouldPromptReview, setShouldPromptReview] = useState(() => {
    const hour = new Date().getHours();
    return hour >= 18 && unfinishedToday.length > 0;
  });

  useEffect(() => {
    const hour = new Date().getHours();
    setShouldPromptReview(hour >= 18 && unfinishedToday.length > 0);
  }, [unfinishedToday]);

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
