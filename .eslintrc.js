module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
    'jest/globals': true,
    jasmine: true
  },
  extends: [
    'standard'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint',
    'jest',
    'jasmine'
  ],
  rules: {
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }]
  },
  ignorePatterns: ['knexfile.js']
}
