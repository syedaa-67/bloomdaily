const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const { defineConfig } = require('eslint/config');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: [
      'dist/*', 
      'node_modules/*', 
      '.expo/*', 
      'android/*', 
      'ios/*',
      'web-build/*',
      'build/*'
    ],
  },
  {
    files: ['jest.setup.js'],
    languageOptions: {
      globals: { jest: 'readonly' },
    },
  },
  {
    rules: {
      // BloomDaily leans on `console.warn` for best-effort error paths
      // (notifications, sync, backup) that intentionally never throw.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // These eslint-plugin-import rules re-resolve every import through a
      // separate TS-aware resolver that's had version-compat issues across
      // the flat-config ecosystem, and they're redundant here anyway —
      // `tsc --noEmit` (run in CI right alongside this) already catches
      // unresolved imports and bad exports with full type information.
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'off',
    },
  },
]);