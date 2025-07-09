const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const importPlugin = require('eslint-plugin-import');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: importPlugin,
    settings: {
      'import/resolver': {
        alias: {
          map: [['@env', './env.d.ts']],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
  },
]);
