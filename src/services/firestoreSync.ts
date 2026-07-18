import { getFirestore, doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { isFirebaseConfigured, getFirebaseApp } from './firebase';
import { Task, Habit } from '@/types';

export interface SyncedData {
  tasks: Task[];
  habits: Habit[];
  updatedAt: string;
}

function userDocRef(uid: string) {
  const db = getFirestore(getFirebaseApp());
  return doc(db, 'userData', uid);
}

export async function pullUserData(uid: string): Promise<SyncedData | null> {
  if (!isFirebaseConfigured) return null;
  const snap = await getDoc(userDocRef(uid));
  if (!snap.exists()) return null;
  return snap.data() as SyncedData;
}

export async function pushUserData(uid: string, data: { tasks: Task[]; habits: Habit[] }): Promise<void> {
  if (!isFirebaseConfigured) return;
  const payload: SyncedData = { ...data, updatedAt: new Date().toISOString() };
  await setDoc(userDocRef(uid), payload);
}

export function subscribeUserData(uid: string, onRemoteChange: (data: SyncedData) => void): Unsubscribe {
  if (!isFirebaseConfigured) return () => {};
  return onSnapshot(userDocRef(uid), (snap) => {
    if (snap.metadata.hasPendingWrites) return;
    if (!snap.exists()) return;
    const data = snap.data();
    if (data) {
      onRemoteChange(data as SyncedData);
    }
  });
}