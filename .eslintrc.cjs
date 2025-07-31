/* eslint-env node */
module.exports = {
  languageOptions: {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      project: './tsconfig.json',
    },
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-async-promise-executor': 'off',
    'no-prototype-builtins': 'off',
    'no-shadow': 'error',
  },
};
