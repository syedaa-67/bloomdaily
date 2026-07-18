# 🌸 BloomDaily

![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-informational)
![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/license-MIT-green)

A gentle, empowering productivity app for students and women managing studies + life — smart to-do lists, supportive reminders, daily planning, a pomodoro timer, habit tracking, and optional wellness tools (mood check-ins, cycle-aware suggestions).

Built with **React Native + Expo (SDK 54)**, **TypeScript**, **Zustand**, **React Navigation**, and **Firebase** (optional, for accounts + cloud sync). Runs on iOS, Android, and web from one codebase.

> **Live demo:** _add your Vercel URL here once deployed — see [Web build and deployment](#web-build-and-deployment)._

---

## Where this project stands

This started as an AI-scaffolded starter codebase and has since had a full engineering pass on top: real cloud sync, a working web build, a linting/formatting/testing pipeline, and CI, all verified by actually installing dependencies and running the app's tooling end-to-end (not just a syntax read-through). Everything below has been checked with `npm ci`, `tsc --noEmit`, `eslint`, `jest`, and a real `expo export -p web` — all currently green. Along the way a couple of real, pre-existing issues turned up and got fixed (see [Bugs found along the way](#bugs-found-along-the-way)) — worth knowing about if you're reviewing this as a portfolio piece.

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
- **Cross-device cloud sync** — optional; once signed in, tasks and habits stay in sync across every device on the account (see [Cloud sync](#cloud-sync) for how it works and its trade-offs)
- **Guest Mode by default** — the entire app works with zero backend, zero account, 100% local storage (privacy-first)
- **Onboarding** — goals + user-type selection, notification permission request
- **Web build** — one codebase runs on iOS, Android, _and_ the browser (deployable to Vercel or any static host)

## What still needs your own setup

| Feature                                  | Status                                                                                                                                                                                                                                            |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email/password accounts + cloud sync     | Real Firebase Auth + Firestore sync code is wired in `src/services/firebase.ts` and `src/services/syncEngine.ts` — just add your Firebase keys to `.env` (see below). Until then, the app runs entirely in Guest Mode with no cloud calls at all. |
| Google / Apple sign-in                   | Needs your own OAuth client IDs / Apple entitlement — not something that can be generated for you. Comments in `firebase.ts` point to the exact packages to add.                                                                                  |
| Community challenges / motivational feed | Needs a real multi-user backend; not implemented. `Share streak` (native share sheet) is implemented as the no-backend version of "shareable progress."                                                                                           |
| Ambient focus sounds                     | UI exists in Pomodoro screen; actual audio playback needs `expo-av` + your own royalty-free sound files.                                                                                                                                          |
| Push notifications (remote)              | All reminders are **local** scheduled notifications — this was a deliberate choice, see below.                                                                                                                                                    |
| Crash reporting / analytics              | Settings screen has an analytics opt-in toggle wired to local state only; connect Sentry or Firebase Crashlytics per their own setup docs when you're ready to ship.                                                                              |

### Why local notifications, not a backend?

Every reminder in this app — due-time alerts, "remind me later," and the evening check-in — is a **local, on-device scheduled notification**. This means the whole reminder system works fully offline, needs no server, and works in **Expo Go**. On web, scheduled local notifications aren't supported by the platform at all (browsers only support one-off/immediate notifications) — the app detects this and simply skips scheduling there rather than letting calls fail silently; every other feature works the same on web as on mobile.

### Why AsyncStorage instead of WatermelonDB?

The original spec mentioned WatermelonDB for offline-first sync. WatermelonDB needs native module linking and a custom dev client (it won't run in plain Expo Go), which adds real setup friction for a starter project. **Zustand + AsyncStorage** is genuinely offline-first, needs zero native config, and works immediately — with the new cloud sync layer on top for when you do want cross-device continuity.

---

## Cloud sync

Once someone signs in with Firebase (as opposed to Guest Mode), `src/services/syncEngine.ts` keeps their `tasks` and `habits` in sync with a single Firestore document at `userData/{uid}`.

**How it works:**

1. On sign-in, local and remote data are merged item-by-item, newest `updatedAt` wins per task/habit, and nothing already on either side gets silently dropped.
2. From then on, local edits push the whole tasks+habits array up (debounced ~1.2s so rapid edits don't spam Firestore), and a live listener pulls down changes made on another device.

**The honest trade-off:** this is "one document, last-write-wins" sync, not a full multi-device CRDT. It's built for the common case — using the app on one device, then picking it up on another — not two devices being edited at the exact same second. That's a deliberate, documented scope choice for a personal productivity app, not an oversight; see the comments in `firestoreSync.ts` for the full reasoning.

**Suggested Firestore security rules** (lock each user to their own document):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userData/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

---

## Setup

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, `w` for web, or scan the QR code with **Expo Go** on your phone.

> **Note:** this repo ships a `.npmrc` with `legacy-peer-deps=true`. It's there for one specific, known reason — see [Bugs found along the way](#bugs-found-along-the-way) — not a general "ignore all peer conflicts" habit. If you ever remove it, `npm install` will surface the same jest-tooling peer warning again; it's safe to override.

### Fonts

The app uses Poppins (headings) and Nunito (body) via `@expo-google-fonts/*`, which download automatically — no manual font files needed.

### Optional: connect Firebase (real accounts + sync)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Add a **Web app** (even though this is mobile — the JS SDK config is the same)
3. Enable **Authentication → Email/Password** and **Firestore Database**
4. Paste the suggested security rules above into Firestore's Rules tab
5. Copy `.env.example` to `.env` and fill in the six `EXPO_PUBLIC_FIREBASE_*` values from your Firebase project settings
6. Restart `expo start` — the Welcome screen will now show "Create an account" alongside Guest Mode, and signed-in accounts sync automatically

Without this, the app works great in Guest Mode — no setup required, and no network calls are made.

---

## Web build and deployment

The app runs on web via `react-native-web`, using Metro's static SPA export (not `expo-router`'s server rendering — this app uses classic React Navigation).

```bash
npm run build:web       # exports a static site to ./dist
npx serve dist          # preview it locally
```

**Deploying to Vercel:** `vercel.json` is already configured (`npm run build:web` as the build command, `dist` as the output directory, with SPA rewrites so client-side routes don't 404 on refresh). Connect the repo in Vercel and it should deploy with no extra configuration.

A couple of native-only pieces are automatically swapped out for web-friendly equivalents, rather than just crashing:

- The due-date/time picker uses native HTML `<input type="date">`/`<input type="time">` on web instead of `@react-native-community/datetimepicker` (which has no web build) — see `src/components/DueDatePickerField.web.tsx`.
- Scheduled local notifications are skipped on web (the browser doesn't support them) rather than throwing.

---

## Project structure

```
bloomdaily/
├── App.tsx                    # entry point: fonts, splash screen, providers, sync resume
├── app.json                   # Expo config (incl. web output settings)
├── vercel.json                # static SPA deploy config for Vercel
├── eslint.config.js           # flat ESLint config (eslint-config-expo + Prettier)
├── jest.config.js             # jest-expo preset + firebase/AsyncStorage setup
├── jest.setup.js               # native-module mocks for logic-layer tests
├── .github/workflows/ci.yml   # typecheck, lint, test, and web-export CI
├── .husky/pre-commit           # runs lint-staged before each commit
├── src/
│   ├── theme/                 # colors, typography, spacing, light/dark theme
│   ├── types/                 # shared TypeScript types
│   ├── store/                 # Zustand stores (tasks, wellness, settings, user, pomodoro) + tests
│   ├── services/              # notifications, NLP parser, quotes, Firebase, Firestore sync, backup + tests
│   ├── hooks/                 # usePomodoro, useEndOfDayEnforcement
│   ├── navigation/             # RootNavigator (stack) + TabNavigator (bottom tabs)
│   ├── components/            # reusable UI: Button, Input, TaskCard, ProgressRing, DueDatePickerField, etc.
│   └── screens/                # one folder per feature area
└── assets/                    # app icon, adaptive icon, notification icon (placeholders — swap for your own branding)
```

Path alias `@/` maps to `src/` (configured in `tsconfig.json` + `babel.config.js` via `babel-preset-expo`).

### State management

Five Zustand stores, each persisted independently to AsyncStorage:

- `useTaskStore` — tasks, subtasks, recurrence, reminders, reordering
- `useWellnessStore` — habits, mood check-ins, journal, cycle tracking
- `useSettingsStore` — theme, quiet hours, notification prefs
- `useUserStore` — profile, onboarding state, auth mode, kicks off/stops cloud sync
- `usePomodoroStore` — session history and durations

### Notifications

All scheduling logic lives in `src/services/notificationService.ts`. Every task with a due date and a reminder offset gets a scheduled local notification; completing or deleting a task cancels it. "Remind Me Later" schedules an additional one-off notification without touching the original. On web, scheduling is a deliberate no-op (see [Web build and deployment](#web-build-and-deployment)).

---

## Testing

```bash
npm test          # run the suite once
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run format     # prettier --write . (only run this deliberately — see note below)
```

Tests cover the logic layer — store CRUD operations, `updatedAt` stamping, and the sync engine's merge logic (`mergeById`) — using `jest-expo` with AsyncStorage and native Expo modules (notifications, file system, sharing) mocked out, so tests are fast and don't need a simulator. Component-level tests with React Native Testing Library aren't set up yet; that's a reasonable next step if the UI layer grows more complex (see [Roadmap](#roadmap)).

> **A note on formatting:** Prettier + a `.prettierrc` are configured, and `lint-staged` runs `prettier --write` automatically on whatever you touch in a commit — but the pre-existing codebase hasn't been bulk-reformatted, to avoid burying this session's real changes under a repo-wide cosmetic diff. Running `npm run format` once, as its own dedicated commit, is a good first move if you want the whole tree consistent.

## Code quality tooling

- **ESLint** (flat config, `eslint-config-expo`) + **Prettier**, wired together via `eslint-config-prettier` so they don't fight each other
- **Husky + lint-staged** — every commit auto-lints and formats whatever's staged (set up automatically by `npm install`'s `prepare` script, once you're inside a git repo)
- **GitHub Actions CI** (`.github/workflows/ci.yml`) — runs typecheck, lint, and tests on every push/PR, plus a separate job that does a real `expo export -p web` as a build sanity check

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

## Bugs found along the way

Two real, pre-existing issues turned up while getting everything running end-to-end for the first time, worth flagging since they'd have blocked _any_ build, not just the new work:

1. **`babel-preset-expo` was referenced in `babel.config.js` but never listed as a dependency.** Without it, the project couldn't have bundled for iOS, Android, _or_ web — a clean `npm install` would leave Metro unable to transform any JSX/TS at all. It's now in `devDependencies`.
2. **`jest-expo@57` currently depends on tooling (`@react-native/jest-preset@0.86`) that expects `react@^19.2.3`**, one minor ahead of the `react@19.1.0` that this project's actual `react-native@0.81.4` expects. It's a test-tooling-only mismatch (the app's real React version is untouched), resolved via the `.npmrc` mentioned in Setup. Also, `jest-expo@57.0.2`'s own dependency tree is still pinned to Jest 29 internals, so `jest`/`@types/jest` are pinned to `29.7.0`/`29.5.14` here rather than the newer Jest 30 — bumping those independently will break the test runner until `jest-expo` catches up upstream.

## Roadmap

- Google/Apple social sign-in
- Ambient focus sounds + full "Focus Mode" distraction blocking
- Anonymous community challenges / motivational feed
- Component-level tests (React Native Testing Library) alongside the existing store/service logic tests
- Localization beyond English
- Sentry/Crashlytics wiring
- Accessibility pass (VoiceOver/TalkBack labels exist on core interactive elements like checkboxes and buttons; a full audit is still worth doing before shipping)

## Troubleshooting

- **Version mismatch errors on `expo start`** → run `npx expo install --fix`
- **"Cannot find module '@/...'"** → make sure you're running from the project root and that `babel.config.js` + `tsconfig.json` paths weren't edited
- **Notifications don't fire in the simulator** → local notifications require a physical device or a properly configured simulator with notification permissions granted; also check the device isn't in Do Not Disturb
- **DateTimePicker looks different than expected** → it renders natively per-platform (inline calendar on iOS, dialog on Android), and as plain HTML inputs on web — that's expected, not a bug
- **`npm ci`/`npm install` fails with an ERESOLVE error** → make sure `.npmrc` (with `legacy-peer-deps=true`) is present at the project root; see [Bugs found along the way](#bugs-found-along-the-way)
- **Jest fails with a `jest-mock`/`clearMocksOnScope` type error** → this means `jest` got bumped past `29.x` independently of `jest-expo`; pin it back to `29.7.0` until `jest-expo` supports Jest 30
