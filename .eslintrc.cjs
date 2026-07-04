module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  plugins: ['@typescript-eslint'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  env: { node: true, es2022: true, jest: true },
  ignorePatterns: ['dist', 'node_modules', 'coverage', 'migrations', 'seeders', 'config', '*.cjs'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': ['error', { allowExpressions: true, allowTypedFunctionExpressions: true }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'error',
  },
  overrides: [
    {
      files: ['src/server.ts'],
      rules: { 'no-console': 'off' },
    },
    {
      files: ['test/**/*.ts', 'src/**/*.spec.ts'],
      rules: { '@typescript-eslint/explicit-function-return-type': 'off' },
    },
  ],
};
