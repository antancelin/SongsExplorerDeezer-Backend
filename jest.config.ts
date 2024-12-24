// packages import
import type { Config } from "jest";

const config: Config = {
  // utilisation de ts-jest pour gérer les fichiers 'typescript'
  preset: "ts-jest",

  // environnment d'exécution des tests
  testEnvironment: "node",

  // pattern pour trouver les fichiers de test
  testMatch: ["**/__tests__/**/*.test.ts"],

  // configuration de la transformation des fichiers
  transform: {
    "^.+\\.ts$": "ts-jest",
  },

  // pour la gestion des modules dans les tests
  moduleNameMapper: {
    ".+\\.ts$": "<rootDir>/src/$1",
  },

  // couverture de code
  collectCoverage: true,
  coverageDirectory: "covergage",
  coverageReporters: ["text", "lcov"],

  // fichiers à ignorer dans les tests
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};

export default config;
