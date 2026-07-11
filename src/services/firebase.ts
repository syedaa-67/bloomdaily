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
} from 'firebase/auth';
// @ts-ignore -- getReactNativePersistence exists at runtime but is missing from some type defs
import { getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * BloomDaily runs fully in "Guest Mode" (local-only, private-by-default) if
 * no Firebase config is supplied — see .env.example. This flag lets the rest
 * of the app know whether cloud auth/sync is actually available.
 */
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
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      // initializeAuth throws if already called once (e.g. fast refresh) — fall back to getAuth
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

/**
 * NOTE on Google/Apple sign-in: these require native config (expo-auth-session
 * + your own OAuth client IDs for Google, and expo-apple-authentication +
 * capability entitlement for Apple) which can't be wired up without your own
 * Apple/Google developer credentials. The email/password flow above is fully
 * functional once you add Firebase keys; see README "Adding social sign-in"
 * for the exact packages and steps to add Google/Apple on top of this.
 */
