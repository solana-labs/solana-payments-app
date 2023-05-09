const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
};
