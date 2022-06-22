/* eslint-disable */
export default {
  displayName: 'node-apps-hot-gateway',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/projects/node/apps/hot-gateway',
  coveragePathIgnorePatterns: ['/test/'],
};