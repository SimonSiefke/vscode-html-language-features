module.exports = wallaby => ({
  files: [
    { pattern: 'tsconfig.json', instrument: false },
    'src/**/*.ts',
    'src/**/*.json',
    '!src/**/*.test.ts',
  ],
  tests: ['src/**/*.test.ts'],
  env: {
    type: 'node',
  },
  compilers: {
    '**/*.ts': wallaby.compilers.typeScript({
      module: 'commonjs',
    }),
  },
  testFramework: 'jest',
})
