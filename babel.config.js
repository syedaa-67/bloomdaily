module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]],
    plugins: [
      // Reanimated plugin MUST be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
