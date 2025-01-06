// packages import
import type { Config } from "jest";

const config: Config = {
  // using ts-jest to handle 'typescript' files
  preset: "ts-jest",

  // test execution environment
  testEnvironment: "node",

  // pattern to find test files
  testMatch: ["**/__tests__/**/*.test.ts"],

  // configuring file transformation
  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  // management of modules in tests
  moduleNameMapper: {
    ".+\\.ts$": "<rootDir>/src/$1",
  },

  // code coverage
  collectCoverage: true,
  coverageDirectory: "covergage",
  coverageReporters: ["text", "lcov"],

  // files to ignore in tests
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
