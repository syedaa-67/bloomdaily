const jestExpoPreset = require('jest-expo/jest-preset');

module.exports = {
  ...jestExpoPreset,
  // Jest replaces (rather than merges) a root-level `setupFiles` / `transform`
  // / `transformIgnorePatterns` over whatever the preset defines — so
  // anything added here has to spread the preset's original value first, or
  // we'd silently lose jest-expo's own React Native environment setup.
  setupFiles: [...jestExpoPreset.setupFiles, './jest.setup.js'],
  transformIgnorePatterns: [
    // Same allow-list as jest-expo's default, with firebase/@firebase added —
    // the modular Firebase v9+ SDK ships as ESM and needs Babel
    // transformation just like the RN/Expo packages already listed here.
    '/node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|standard-navigation|firebase|@firebase))',
    ...jestExpoPreset.transformIgnorePatterns.slice(1),
  ],
  transform: {
    ...jestExpoPreset.transform,
    // @firebase/util ships a `.mjs` file that the default `\.[jt]sx?$`
    // pattern above doesn't match — without this it hits Jest's raw
    // (untransformed) ESM parser and fails on the bare `export` keyword.
    '^.+\\.mjs$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/.expo/', '/android/', '/ios/'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
};
