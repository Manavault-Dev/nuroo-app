const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    settings: {
      'import/resolver': {
        alias: {
          map: [['@env', './env.d.ts']], // если ты используешь alias @env
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
  },
]);
