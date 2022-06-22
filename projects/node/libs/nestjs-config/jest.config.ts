/* eslint-disable */
export default {
  displayName: 'node-libs-nestjs-config',
  preset: '../../../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../../coverage/projects/node/libs/nestjs-config',
  coveragePathIgnorePatterns: ['/test/'],
};
