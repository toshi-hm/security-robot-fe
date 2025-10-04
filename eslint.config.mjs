import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { includeIgnoreFile } from '@eslint/compat'
import tseslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import eslintPluginImport from 'eslint-plugin-import'
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended'
import eslintPluginVue from 'eslint-plugin-vue'
import vueParser from 'vue-eslint-parser'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const gitignorePath = path.resolve(__dirname, '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  {
    languageOptions: {
      ecmaVersion: 13,
      sourceType: 'module',
    },
  },
  ...eslintPluginVue.configs['flat/recommended'],
  eslintPluginPrettier,
  {
    // Apply the following plugins/rules to Vue files
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: tsParser,
      },
    },
    plugins: {
      import: eslintPluginImport,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Import order rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'index', 'sibling', 'parent', 'object', 'type'],
          pathGroups: [
            {
              pattern: '#app',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '{pinia,#imports}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'internal',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // Nuxt auto-imports handling
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',

      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',
      'vue/block-order': [
        'error',
        {
          order: ['script', 'template', 'style'],
        },
      ],
      'vue/no-empty-component-block': 'warn',
      'vue/padding-line-between-blocks': ['error', 'always'],

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  {
    // Apply the following plugins/rules to TS/JS files
    files: ['**/*.js', '**/*.ts', '**/*.mjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      import: eslintPluginImport,
      '@typescript-eslint': tseslint,
    },
    rules: {
      // Import order rules
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'index', 'sibling', 'parent', 'object', 'type'],
          pathGroups: [
            {
              pattern: '#app',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '{pinia,#imports}',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'internal',
            },
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin', 'object'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off', // Nuxt auto-imports handling
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',

      // Vue specific rules
      'vue/multi-word-component-names': 'off',
      'vue/require-default-prop': 'off',

      // TypeScript rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: false,
        },
      ],

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
]
