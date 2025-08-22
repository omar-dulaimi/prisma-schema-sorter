const tseslint = require('@typescript-eslint/eslint-plugin');
const tsparser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const eslintComments = require('eslint-plugin-eslint-comments');

module.exports = [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2020,
        sourceType: 'module'
      },
      globals: {
        BigInt: 'readonly',
        console: 'readonly',
        WebAssembly: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'import': importPlugin,
      'eslint-comments': eslintComments
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      'eslint-comments/disable-enable-pair': [
        'error',
        { allowWholeFile: true }
      ],
      'eslint-comments/no-unused-disable': 'error',
      'import/order': [
        'error',
        { 'newlines-between': 'always', alphabetize: { order: 'asc' } }
      ],
      'sort-imports': [
        'error',
        { ignoreDeclarationSort: true, ignoreCase: true }
      ]
    }
  },
  {
    ignores: ['node_modules/**', 'build/**', 'coverage/**']
  }
];