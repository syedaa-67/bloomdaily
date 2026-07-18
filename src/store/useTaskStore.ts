import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDays, isBefore, startOfDay } from 'date-fns';
import { Task, RecurrenceRule, Subtask, Priority, Category } from '@/types';
import { generateId } from '@/utils/id';
import {
  cancelTaskNotifications,
  scheduleSnooze,
  scheduleTaskReminder,
} from '@/services/notificationService';

export interface NewTaskInput {
  title: string;
  description?: string;
  dueDate: string | null;
  priority: Priority;
  category: Category;
  estimatedMinutes?: number;
  subtasks?: string[];
  recurrence?: RecurrenceRule;
  reminderMinutesBefore?: number | null;
  templateOrigin?: string;
}

interface TaskState {
  tasks: Task[];
  addTask: (input: NewTaskInput) => Promise<Task>;
  updateTask: (id: string, patch: Partial<NewTaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  removeSubtask: (taskId: string, subtaskId: string) => void;
  reorderTasks: (orderedIds: string[]) => void;
  snoozeTask: (taskId: string, minutes: number | null) => Promise<void>;
  rescheduleTask: (taskId: string, newDueDate: string | null) => Promise<void>;
  getTasksForDate: (date: Date) => Task[];
  getTopPrioritiesForToday: (limit?: number) => Task[];
  getOverdueUnfinished: () => Task[];
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: async (input) => {
        const task: Task = {
          id: generateId(),
          title: input.title.trim(),
          description: input.description?.trim() || undefined,
          dueDate: input.dueDate,
          priority: input.priority,
          category: input.category,
          estimatedMinutes: input.estimatedMinutes,
          subtasks: (input.subtasks ?? []).map((t) => ({ id: generateId(), title: t, isDone: false })),
          recurrence: input.recurrence ?? { type: 'none' },
          isDone: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          order: get().tasks.length,
          reminderMinutesBefore: input.reminderMinutesBefore ?? 0,
          snoozeHistory: [],
          notificationIds: [],
          templateOrigin: input.templateOrigin,
          updatedAt: new Date().toISOString(),
        };

        const notificationIds = await scheduleTaskReminder(task).catch(() => []);
        const finalTask = { ...task, notificationIds };
        set((state) => ({ tasks: [...state.tasks, finalTask] }));
        return finalTask;
      },

      updateTask: async (id, patch) => {
        const existing = get().tasks.find((t) => t.id === id);
        if (!existing) return;

        const merged: Task = {
          ...existing,
          ...patch,
          title: patch.title?.trim() ?? existing.title,
          description: patch.description?.trim() ?? existing.description,
          subtasks: patch.subtasks
            ? patch.subtasks.map((t) => ({ id: generateId(), title: t, isDone: false }))
            : existing.subtasks,
          recurrence: patch.recurrence ?? existing.recurrence,
        };

        const notificationIds = await scheduleTaskReminder(merged).catch(() => existing.notificationIds);
        const finalTask = { ...merged, notificationIds, updatedAt: new Date().toISOString() };

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? finalTask : t)),
        }));
      },

      deleteTask: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) await cancelTaskNotifications(task).catch(() => {});
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      toggleTaskDone: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        const nowDone = !task.isDone;

        if (nowDone) await cancelTaskNotifications(task).catch(() => {});

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  isDone: nowDone,
                  completedAt: nowDone ? new Date().toISOString() : null,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));

        if (nowDone && task.recurrence.type !== 'none' && task.dueDate) {
          const nextDue = computeNextOccurrence(new Date(task.dueDate), task.recurrence);
          if (nextDue) {
            await get().addTask({
              title: task.title,
              description: task.description,
              dueDate: nextDue.toISOString(),
              priority: task.priority,
              category: task.category,
              estimatedMinutes: task.estimatedMinutes,
              subtasks: task.subtasks.map((s) => s.title),
              recurrence: task.recurrence,
              reminderMinutesBefore: task.reminderMinutesBefore,
            });
          }
        }
      },

      toggleSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.map((s) => (s.id === subtaskId ? { ...s, isDone: !s.isDone } : s)),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      addSubtask: (taskId, title) => {
        if (!title.trim()) return;
        const newSub: Subtask = { id: generateId(), title: title.trim(), isDone: false };
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? { ...t, subtasks: [...t.subtasks, newSub], updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      removeSubtask: (taskId, subtaskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      reorderTasks: (orderedIds) => {
        set((state) => ({
          tasks: state.tasks.map((t) => {
            const newOrder = orderedIds.indexOf(t.id);
            return newOrder === -1 ? t : { ...t, order: newOrder, updatedAt: new Date().toISOString() };
          }),
        }));
      },

      snoozeTask: async (taskId, minutes) => {
        const task = get().tasks.find((t) => t.id === taskId);
        if (!task) return;
        const notifId = await scheduleSnooze(task, minutes).catch(() => null);
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  snoozeHistory: [...t.snoozeHistory, new Date().toISOString()],
                  notificationIds: notifId ? [...t.notificationIds, notifId] : t.notificationIds,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      rescheduleTask: async (taskId, newDueDate) => {
        await get().updateTask(taskId, { dueDate: newDueDate });
      },

      getTasksForDate: (date) => {
        const dayStart = startOfDay(date).getTime();
        const dayEnd = dayStart + 86_400_000;
        return get()
          .tasks.filter((t) => {
            if (!t.dueDate) return false;
            const due = new Date(t.dueDate).getTime();
            return due >= dayStart && due < dayEnd;
          })
          .sort((a, b) => a.order - b.order);
      },

      getTopPrioritiesForToday: (limit = 3) => {
        const today = get().getTasksForDate(new Date());
        const rank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
        return [...today]
          .filter((t) => !t.isDone)
          .sort((a, b) => rank[a.priority] - rank[b.priority] || a.order - b.order)
          .slice(0, limit);
      },

      getOverdueUnfinished: () => {
        const todayStart = startOfDay(new Date());
        return get().tasks.filter((t) => !t.isDone && t.dueDate && isBefore(new Date(t.dueDate), todayStart));
      },
    }),
    {
      name: 'bloomdaily-tasks',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function computeNextOccurrence(fromDate: Date, rule: RecurrenceRule): Date | null {
  switch (rule.type) {
    case 'daily':
      return addDays(fromDate, 1);
    case 'custom':
      return addDays(fromDate, Math.max(1, rule.everyNDays));
    case 'weekly': {
      if (!rule.daysOfWeek.length) return addDays(fromDate, 7);
      for (let i = 1; i <= 7; i++) {
        const candidate = addDays(fromDate, i);
        if (rule.daysOfWeek.includes(candidate.getDay())) return candidate;
      }
      return addDays(fromDate, 7);
    }
    default:
      return null;
  }
}