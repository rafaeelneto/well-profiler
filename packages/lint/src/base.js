import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier/recommended';

// eslint.config.js
// @ts-check

/** @type {import('eslint').Linter.Config[]} */
export default [
  js.configs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,
  prettier,
  {
    rules: {
      // style
      'linebreak-style': ['error', 'unix'],
      // The `.well` schema is snake_case on the wire, so code across the repo
      // reads and writes fields like `media_type` and `static_level` verbatim.
      camelcase: 'off',
      'prefer-template': ['error'],
      'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
      radix: ['error', 'as-needed'],
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // safety
      'no-use-before-define': 'off', // handled by TS version
      'no-undef': 'off', // TypeScript handles this
      'no-return-assign': ['error', 'always'],
      'prefer-promise-reject-errors': ['warn'],

      // imports
      'import-x/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', ts: 'never', tsx: 'never' },
      ],

      // prettier
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];
