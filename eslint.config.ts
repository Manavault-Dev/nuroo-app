import { defineConfig } from 'eslint/config';

const expoConfig = require('eslint-config-expo/flat');

export default defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '__tests__/*'],
  },
]);
