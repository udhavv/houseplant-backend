import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,

  // 1. Global settings for all files (Node.js runtime)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,       // Defines console, process, setTimeout, Buffer, etc.
        ...globals.es2021,
      },
    },
    rules: {
      "no-console": "off",     // Allow console.log in backend code
      "no-prototype-builtins": "off", // Allows obj.hasOwnProperty()
      "no-unused-vars": [
        "warn",                // Warn instead of error for unused variables
        { 
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_" 
        },
      ],
    },
  },

  // 2. Specific settings for test files (Jest environment)
  {
    files: ["tests/**", "**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,       // Defines describe, it, test, expect, beforeEach, afterAll, etc.
      },
    },
    rules: {
      "no-unused-vars": "off", // Tests often have helper imports; don't fail lint
    },
  },

  // 3. Ignored folders
  {
    ignores: [
      "node_modules/",
      "coverage/",
      "dist/",
      ".prisma/",
      "prisma/client/",
    ],
  },
];