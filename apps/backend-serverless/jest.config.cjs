// jest.config.cjs
module.exports = {
  roots: ["<rootDir>/__tests__"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "./tsconfig.tests.json" }],
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$",
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
},
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  testEnvironment: 'node',
};