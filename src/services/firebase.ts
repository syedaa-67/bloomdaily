import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendEmailVerification,
  User,
  browserLocalPersistence,
} from 'firebase/auth';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Add keys to .env or use Guest Mode.');
  }
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(config);
    try {
      if (Platform.OS === 'web') {
        auth = initializeAuth(app, { persistence: browserLocalPersistence });
      } else {
        const { getReactNativePersistence } = require('firebase/auth');
        auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
      }
    } catch {
      auth = getAuth(app);
    }
  }
  return auth!;
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
  await sendEmailVerification(user).catch(() => {});
  return user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  return user;
}

export async function signOutFirebase(): Promise<void> {
  await firebaseSignOut(getFirebaseAuth());
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) return () => {};
  return onAuthStateChanged(getFirebaseAuth(), callback);
}
