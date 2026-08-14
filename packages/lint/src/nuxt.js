import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import vueParser from 'vue-eslint-parser';
import base from './base.js';

// `eslint-plugin-vue` itself is NOT registered here — `withNuxt()` (from
// `@nuxt/eslint`'s generated `.nuxt/eslint.config.mjs`) already registers it.
// Declaring a second `vue` plugin instance in this array causes ESLint's flat
// config loader to throw "Different instances of plugin 'vue' found".
/** @type {import('eslint').Linter.Config[]} */
export const nuxtConfig = [
  ...base,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    files: ['*.vue', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
    },
  },
  {
    rules: {
      'vue/no-unused-vars': 'off',
      'vue/no-multiple-template-root': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],
    },
  },
];
