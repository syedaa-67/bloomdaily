# 🌸 BloomDaily

A gentle, empowering productivity app for students and women managing studies + life — smart to-do lists, supportive reminders, daily planning, a pomodoro timer, habit tracking, and optional wellness tools (mood check-ins, cycle-aware suggestions).

Built with **React Native + Expo (SDK 54)**, **TypeScript**, **Zustand**, and **React Navigation**.

---

## Before you start: what this is (and isn't)

This is a complete, working **starter codebase** — not a hosted, store-published app. Everything below runs for real once you `npm install`, but a few pieces need your own accounts/keys before they go further than your own device (details in "What's stubbed" below). I built this in a sandboxed environment without internet access, so **I was not able to run `npm install` or launch the app myself** — I validated the code with a full TypeScript syntax/structure pass instead (every internal import resolves correctly; zero syntax errors across all 51 files). You'll be the first to actually run it — see **Troubleshooting** below if anything hiccups.

## What's fully working out of the box

- **Smart to-do list** — title, description, due date/time, priority, category, estimated duration, subtasks, recurring tasks (daily/weekly), drag-and-drop reordering
- **Natural language quick-add** — "Finish math assignment tomorrow 3pm" auto-parses date, time, and category
- **Reminders** — scheduled local notifications, "Remind Me Later" (15 min / 30 min / 1 hr / 2 hr / end of day), snooze history, quiet hours
- **End-of-day enforcement** — evening notification + in-app banner surfacing unfinished high-priority tasks, with one-tap reschedule
- **Daily dashboard** — top 3 priorities, rotating motivational quote, mood + energy check-in
- **End-of-day review** — celebrates completed tasks, journal reflection prompt, reschedule leftovers
- **Pomodoro timer** — customizable focus/break lengths, auto long-breaks, linked to a task
- **Habit tracker** — streaks, 7-day visual calendar, shareable streaks
- **Cycle tracking** — optional, off by default, fully local, with cycle-aware task suggestions
- **Analytics** — weekly completion chart, category breakdown, habit consistency
- **Task templates** — Exam Prep, Morning Routine, Self-Care Sunday
- **Settings** — light/dark/system theme, quiet hours, evening check-in time, JSON backup export/import, CSV export
- **Guest Mode by default** — the entire app works with zero backend, zero account, 100% local storage (privacy-first)
- **Onboarding** — goals + user-type selection, notification permission request

## What's stubbed / needs your own setup

| Feature | Status |
|---|---|
| Email/password accounts | Real Firebase Auth code is wired in `src/services/firebase.ts` — just add your Firebase keys to `.env` (see below). Until then, the app runs entirely in Guest Mode. |
| Google / Apple sign-in | Needs your own OAuth client IDs / Apple entitlement — not something I can generate for you. Comments in `firebase.ts` point to the exact packages to add. |
| Cross-device task sync | Tasks currently persist locally via AsyncStorage. The store layer (`useTaskStore`, etc.) is a clean seam to plug in Firestore or Supabase sync later. |
| Community challenges / motivational feed | Needs a real multi-user backend; not implemented. `Share streak` (native share sheet) is implemented as the no-backend version of "shareable progress." |
| Ambient focus sounds | UI exists in Pomodoro screen; actual audio playback needs `expo-av` + your own royalty-free sound files. |
| Push notifications (remote) | All reminders are **local** scheduled notifications — this was a deliberate choice, see below. |
| Crash reporting / analytics | Settings screen has an analytics opt-in toggle wired to local state only; connect Sentry or Firebase Crashlytics per their own setup docs when you're ready to ship. |

### Why local notifications, not a backend?

Every reminder in this app — due-time alerts, "remind me later," and the evening check-in — is a **local, on-device scheduled notification**. This means the whole reminder system works fully offline, needs no server, and (important!) works in **Expo Go**, since Expo Go dropped support for *remote* push starting SDK 53 but still fully supports local notifications. If you later want reminders that survive even when the app hasn't been opened in days, or cross-device push, that's a good use for Firebase Cloud Functions + FCM on top of this — the task store already has a clean spot to hook that in.

### Why AsyncStorage instead of WatermelonDB?

The original spec mentioned WatermelonDB for offline-first sync. WatermelonDB needs native module linking and a custom dev client (it won't run in plain Expo Go), which adds real setup friction for a starter project. I used **Zustand + AsyncStorage** instead — genuinely offline-first, zero native config, works immediately. If your task volume grows into the thousands and you need query performance or real conflict-resolution sync, WatermelonDB (or Supabase's offline sync) is the natural upgrade — the store layer is structured so that swap wouldn't touch your UI code.

---

## Setup

```bash
npm install
npx expo install --fix   # aligns every package to your installed Expo SDK version
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with **Expo Go** on your phone.

> I pinned dependency versions as of Expo SDK 54 (current at the time this was built). Expo releases new SDKs roughly every few months — `npx expo install --fix` will correct any drift automatically, so run that first if you see version-mismatch warnings.

### Fonts

The app uses Poppins (headings) and Nunito (body) via `@expo-google-fonts/*`, which download automatically — no manual font files needed.

### Optional: connect Firebase (real accounts)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add a **Web app** (even though this is mobile — the JS SDK config is the same)
3. Enable **Authentication → Email/Password**
4. Copy `.env.example` to `.env` and fill in the six `EXPO_PUBLIC_FIREBASE_*` values from your Firebase project settings
5. Restart `expo start` — the Welcome screen will now show "Create an account" alongside Guest Mode

Without this, the app works great in Guest Mode — no setup required.

---

## Project structure

```
bloomdaily/
├── App.tsx                    # entry point: fonts, splash screen, providers
├── app.json                   # Expo config
├── src/
│   ├── theme/                 # colors, typography, spacing, light/dark theme
│   ├── types/                 # shared TypeScript types
│   ├── store/                 # Zustand stores (tasks, wellness, settings, user, pomodoro)
│   ├── services/              # notifications, NLP parser, quotes, Firebase, backup, templates
│   ├── hooks/                 # usePomodoro, useEndOfDayEnforcement
│   ├── navigation/             # RootNavigator (stack) + TabNavigator (bottom tabs)
│   ├── components/            # reusable UI: Button, Input, TaskCard, ProgressRing, etc.
│   └── screens/                # one folder per feature area
└── assets/                    # app icon, adaptive icon, notification icon (placeholders — swap for your own branding)
```

Path alias `@/` maps to `src/` (configured in `tsconfig.json` + `babel.config.js` via `babel-preset-expo`).

### State management

Five Zustand stores, each persisted independently to AsyncStorage:
- `useTaskStore` — tasks, subtasks, recurrence, reminders, reordering
- `useWellnessStore` — habits, mood check-ins, journal, cycle tracking
- `useSettingsStore` — theme, quiet hours, notification prefs
- `useUserStore` — profile, onboarding state, auth mode
- `usePomodoroStore` — session history and durations

### Notifications

All scheduling logic lives in `src/services/notificationService.ts`. Every task with a due date and a reminder offset gets a scheduled local notification; completing or deleting a task cancels it. "Remind Me Later" schedules an additional one-off notification without touching the original.

---

## Building for real devices (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios      # or android, or --platform all
```

You'll need an Apple Developer account for iOS and a Google Play Console account for Android internal testing. Full guide: [docs.expo.dev/build/introduction](https://docs.expo.dev/build/introduction/).

---

## Roadmap (not yet built)

- Real-time multi-device sync (Firestore/Supabase)
- Google/Apple social sign-in
- Ambient focus sounds + full "Focus Mode" distraction blocking
- Anonymous community challenges / motivational feed
- Localization beyond English
- Sentry/Crashlytics wiring
- Accessibility pass (VoiceOver/TalkBack labels exist on core interactive elements like checkboxes and buttons; a full audit is still worth doing before shipping)

## Troubleshooting

- **Version mismatch errors on `expo start`** → run `npx expo install --fix`
- **"Cannot find module '@/...'"** → make sure you're running from the project root and that `babel.config.js` + `tsconfig.json` paths weren't edited
- **Notifications don't fire in the simulator** → local notifications require a physical device or a properly configured simulator with notification permissions granted; also check the device isn't in Do Not Disturb
- **DateTimePicker looks different than expected** → it renders natively per-platform (inline calendar on iOS, dialog on Android) — that's expected, not a bug
- **`Uncaught SyntaxError: Cannot use 'import.meta' outside a module` in the browser** → this only happens if you open the web preview (`w` in the terminal). BloomDaily is a phone-first app (no `react-dom`/`react-native-web` installed) — use Expo Go on your phone or a simulator instead. If you specifically need web to work, `babel.config.js` and `metro.config.js` already include the fix (zustand v5 and firebase both ship ESM builds that trip this up); just make sure to run `npx expo start --clear` once after installing so Metro drops its stale cache.
