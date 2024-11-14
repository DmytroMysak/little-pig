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
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  },
];
