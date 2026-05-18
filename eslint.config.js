import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import wordpress from '@wordpress/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['vite.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: [ '**/*.{js,jsx}' ],
    ignores: [ 'vite.config.js' ],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      '@wordpress': wordpress,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        __RSM_DEV_BRANCH_LABEL__: 'readonly',
        __RSM_DEV_PREVIEW_URL__: 'readonly',
        __RSM_DEV_SERVER_PORT__: 'readonly',
      },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      '@wordpress/use-recommended-components': 'error',
    },
  },
])
