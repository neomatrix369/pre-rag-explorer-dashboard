// Complexity-only ESLint config used by scripts/complexity-report.sh
// Keeps the gate separate from the main linting pass (no warnings about style/types).
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  parser: '@typescript-eslint/parser',
  plugins: [],
  rules: {
    complexity: ['error', 10],
  },
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', '.reports/'],
};
