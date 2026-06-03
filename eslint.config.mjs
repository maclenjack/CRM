import eslintJS from '@eslint/js';
import eslintMarkdown from '@eslint/markdown';
import eslintConfigNextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigNextTypescript from 'eslint-config-next/typescript';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import esLintPluginCompat from 'eslint-plugin-compat';
import eslintPluginJest from 'eslint-plugin-jest';
import eslintPluginPlaywright from 'eslint-plugin-playwright';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginSecurity from 'eslint-plugin-security';
import eslintPluginSonar from 'eslint-plugin-sonarjs';
import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import typescriptEslint from 'typescript-eslint';

export default typescriptEslint.config([
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      '.agents/**',
      'types/cache-life.d.ts',
      'types/routes.d.ts',
      'types/validator.ts',
    ],
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}'],
    extends: [
      ...eslintConfigNextCoreWebVitals,
      eslintPluginBetterTailwindcss.configs['recommended-error'],
      esLintPluginCompat.configs['flat/recommended'],
      eslintPluginReact.configs.flat['jsx-runtime'],
      eslintPluginSecurity.configs.recommended,
      eslintPluginSonar.configs.recommended,
    ],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      'better-tailwindcss': {
        entryPoint: `${import.meta.dirname}/app/globals.css`,
      },
    },
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': [
        'error',
        { strictness: 'loose' },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx,mjs,cjs}'],
    extends: [eslintJS.configs.recommended],
  },
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      ...eslintConfigNextTypescript,
      typescriptEslint.configs.recommended,
    ],
  },
  {
    files: ['tests/e2e/**'],
    extends: [eslintPluginPlaywright.configs['flat/recommended']],
  },
  {
    files: ['tests/components/**'],
    extends: [
      eslintPluginJest.configs.recommended,
      eslintPluginTestingLibrary.configs.react,
    ],
  },
  {
    files: ['**/*.md'],
    extends: [eslintMarkdown.configs.recommended],
  },
  { ...eslintPluginPrettier, ignores: ['**/*.md'] },
]);
