const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Some dependencies (notably zustand v5 and firebase) ship a modern ESM
// build that uses `import.meta`, which Hermes/Metro's web bundle output
// can't execute. Forcing Metro to prefer each package's CommonJS build
// avoids the "Cannot use 'import.meta' outside a module" crash on web.
// (Native builds via Expo Go / EAS are unaffected either way.)
config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
