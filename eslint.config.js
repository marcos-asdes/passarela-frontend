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

      /** Regras de estilo */
      curly: ['error', 'multi-or-nest'],
      'logical-assignment-operators': ['error', 'always'],

      /** Tags de JSDoc redundantes com o que o TypeScript já expressa */
      'no-warning-comments': [
        'error',
        { terms: ['@module', '@fileoverview', '@function', '@interface', '@type'], location: 'anywhere' }
      ]
    }
  },

  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      /**
       * Tipagem explícita é o padrão do projeto — `allowExpressions` libera só função/arrow inline
       * (callback de JSX, validator de Form do antd, builder do Redux Toolkit), que são os casos
       * raros de processo intermediário complexo demais pra anotar sem reescrever o tipo da lib.
       * Escopo só em `src/`: teste (`__tests__/`) não precisa dessa disciplina de tipagem.
       */
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true, allowHigherOrderFunctions: true }
      ]
    }
  },

  {
    files: ['src/styled.d.ts'],
    rules: {
      /**
       * `interface DefaultTheme extends AppTheme {}` é o jeito oficial (documentado pelo próprio
       * styled-components) de estender, de fora da lib, o tipo `DefaultTheme` que ela já declara —
       * TypeScript só faz esse merge entre `interface`s com o mesmo nome, nunca com `type` (vira
       * outra coisa, sem efeito nenhum: compila, mas `props.theme` perde a tipagem de `AppTheme`).
       * Só essa exceção pontual, não um disable inline.
       */
      '@typescript-eslint/no-empty-object-type': 'off'
    }
  }
)
