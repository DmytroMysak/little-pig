import globals from 'globals';
import netlyConfig from '@netly/eslint-config-base';

export default [
  ...netlyConfig,
  {
    files: ['**/*.spec.ts'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
      sourceType: 'script',
    },
  },
];
