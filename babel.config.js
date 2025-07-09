module.exports = function (api) {
  api.cache(true);
  return {
    presets: [require.resolve('babel-preset-expo')],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
