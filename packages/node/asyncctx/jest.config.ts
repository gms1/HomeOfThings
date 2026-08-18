export default {
  displayName: 'asyncctx',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  // Override the preset's `extensionsToTreatAsEsm: ['.ts']` — this package uses
  // CJS ts-jest (no useESM) and "module": "commonjs", so Jest must not treat
  // .ts files as ESM.
  extensionsToTreatAsEsm: [],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/node/asyncctx',
};
