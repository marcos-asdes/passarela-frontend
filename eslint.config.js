import { defineConfig } from 'eslint/config'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default defineConfig(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**']
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat['recommended-latest'],
  reactRefresh.configs.vite,
  eslintPluginPrettierRecommended,

  {
    files: ['src/**/*.{ts,tsx}', '__tests__/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',

      /** Regras de estilo */
      curly: ['error', 'multi-or-nest'],
      'logical-assignment-operators': ['error', 'always'],

      /** Tags de JSDoc redundantes com o que o TypeScript já expressa */
      'no-warning-comments': [
        'error',
        { terms: ['@module', '@fileoverview', '@function', '@interface', '@type'], location: 'anywhere' }
      ]
    }
  }
)
