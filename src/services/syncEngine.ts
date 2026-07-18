import { useTaskStore } from '@/store/useTaskStore';
import { useWellnessStore } from '@/store/useWellnessStore';
import { Task, Habit } from '@/types';
import { isFirebaseConfigured } from './firebase';
import { pullUserData, pushUserData, subscribeUserData } from './firestoreSync';

const DEBOUNCE_MS = 1200;

let currentUid: string | null = null;
let unsubscribeRemote: (() => void) | null = null;
let unsubscribeLocalTasks: (() => void) | null = null;
let unsubscribeLocalHabits: (() => void) | null = null;
let pushTimer: ReturnType<typeof setTimeout> | null = null;
let applyingRemote = false;

/**
 * Union-merge two arrays of the same record type by id: whichever side has
 * the newer `updatedAt` wins for records present in both; records that only
 * exist on one side are kept. This runs once, when sync first turns on for
 * an account (sign-in, sign-up, or app relaunch while already signed in) —
 * it's what stops a first-time sync from silently deleting whichever side
 * has less data.
 */
export function mergeById<T extends { id: string; updatedAt: string }>(local: T[], remote: T[]): T[] {
  const byId = new Map<string, T>();
  for (const item of local) byId.set(item.id, item);
  for (const item of remote) {
    const existing = byId.get(item.id);
    if (!existing || new Date(item.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

function schedulePush() {
  if (applyingRemote || !currentUid) return;
  const uid = currentUid;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    const tasks = useTaskStore.getState().tasks;
    const habits = useWellnessStore.getState().habits;
    pushUserData(uid, { tasks, habits }).catch(() => {
      // Best-effort: if this push fails (offline, etc.) the next local edit
      // will schedule another one, and the live listener will still pick up
      // whatever the last successful write was.
    });
  }, DEBOUNCE_MS);
}

function applyRemote(tasks: Task[], habits: Habit[]) {
  applyingRemote = true;
  useTaskStore.setState({ tasks });
  useWellnessStore.setState({ habits });
  applyingRemote = false;
}

/**
 * Start syncing tasks + habits for a signed-in user. Safe to call on every
 * app launch / sign-in — it no-ops if already syncing this exact uid, and
 * does nothing at all if Firebase isn't configured (Guest Mode).
 */
export async function startSync(uid: string): Promise<void> {
  if (!isFirebaseConfigured) return;
  if (currentUid === uid) return;
  stopSync();
  currentUid = uid;

  const remote = await pullUserData(uid).catch(() => null);
  const localTasks = useTaskStore.getState().tasks;
  const localHabits = useWellnessStore.getState().habits;

  if (remote) {
    const mergedTasks = mergeById(localTasks, remote.tasks);
    const mergedHabits = mergeById(localHabits, remote.habits);
    applyRemote(mergedTasks, mergedHabits);
    await pushUserData(uid, { tasks: mergedTasks, habits: mergedHabits }).catch(() => {});
  } else if (localTasks.length || localHabits.length) {
    // Nothing in the cloud yet — seed it from whatever's on this device.
    await pushUserData(uid, { tasks: localTasks, habits: localHabits }).catch(() => {});
  }

  unsubscribeRemote = subscribeUserData(uid, (data) => {
    applyRemote(data.tasks, data.habits);
  });

  unsubscribeLocalTasks = useTaskStore.subscribe(() => schedulePush());
  unsubscribeLocalHabits = useWellnessStore.subscribe(() => schedulePush());
}

/** Stop syncing (call on sign-out). Leaves local data exactly as it is. */
export function stopSync(): void {
  unsubscribeRemote?.();
  unsubscribeLocalTasks?.();
  unsubscribeLocalHabits?.();
  if (pushTimer) clearTimeout(pushTimer);
  unsubscribeRemote = null;
  unsubscribeLocalTasks = null;
  unsubscribeLocalHabits = null;
  pushTimer = null;
  currentUid = null;
}

export function isSyncing(): boolean {
  return currentUid !== null;
}
