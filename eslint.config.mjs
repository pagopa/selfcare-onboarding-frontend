import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import prettier from 'eslint-config-prettier/flat';
import functional from 'eslint-plugin-functional';
import importPlugin from 'eslint-plugin-import';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/',
    'build/',
    'coverage/',
    'locales/locales.ts',
    '**/__tests__/**',
    'e2e/',
    'definitions/*',
    'src/vite-env.d.ts',
    'Dangerfile.ts',
    'src/reportWebVitals.ts',
    'index.d.ts',
    'src/api/generated/**',
    'openApi/**',
  ]),
  {
    // ESLint 8 behaviour: many existing directives are stale, clean them up before enabling
    linterOptions: {
      reportUnusedDisableDirectives: 'off',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      react.configs.flat.recommended,
      prettier,
    ],
    plugins: {
      '@stylistic': stylistic,
      'react-hooks': reactHooks,
      import: importPlugin,
      functional,
      sonarjs,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'no-case-declarations': 'off',
      'no-inner-declarations': 'off',
      'prefer-const': 'error',
      curly: 'error',
      '@stylistic/spaced-comment': ['error', 'always', { block: { balanced: true } }],
      radix: 'error',
      'one-var': ['error', 'never'],
      'object-shorthand': 'error',
      'no-var': 'error',
      'no-param-reassign': 'error',
      'no-underscore-dangle': 'error',
      'no-undef-init': 'error',
      'no-throw-literal': 'error',
      'no-new-wrappers': 'error',
      'no-eval': 'error',
      'no-console': 0, // TODO ['error', { 'allow': ['error', 'warn'] }],
      'no-caller': 'error',
      'no-bitwise': 'error',
      eqeqeq: ['error', 'smart'],
      'max-classes-per-file': ['error', 1],
      'guard-for-in': 'error',
      complexity: 'error',
      'arrow-body-style': 'error',
      'import/order': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      // Enable if we want to enforce the return type for all the functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      // TODO: added for compatibility. Removing this line we have to remove all the any usage in the code
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'error',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': ['error'],
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@stylistic/semi': ['error'],
      '@typescript-eslint/unified-signatures': 'error',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
      'react-hooks/rules-of-hooks': 'warn',
      'functional/no-let': 'error',
      'functional/immutable-data': 'error',
      // Same rules as the sonarjs 0.x "recommended" preset: since v1 it enables ~300 rules
      ...Object.fromEntries(
        [
          'cognitive-complexity',
          'max-switch-cases',
          'no-all-duplicated-branches',
          'no-collapsible-if',
          'no-collection-size-mischeck',
          'no-duplicated-branches',
          'no-element-overwrite',
          'no-empty-collection',
          'no-extra-arguments',
          'no-gratuitous-expressions',
          'no-identical-conditions',
          'no-identical-expressions',
          'no-identical-functions',
          'no-ignored-return',
          'no-nested-switch',
          'no-redundant-boolean',
          'no-redundant-jump',
          'no-same-line-conditional',
          'no-unused-collection',
          'no-use-of-empty-return-value',
          'no-useless-catch',
          'non-existent-operator',
          'prefer-immediate-return',
          'prefer-object-literal',
          'prefer-single-boolean-return',
          'prefer-while',
        ].map((rule) => [`sonarjs/${rule}`, 'error'])
      ),
      // Replaces sonarjs/no-one-iteration-loop, removed in sonarjs v1
      'no-unreachable-loop': 'error',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-template-literals': 'warn',
      '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
]);
