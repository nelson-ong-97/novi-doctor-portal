import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importPlugin from 'eslint-plugin-import';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import { defineConfig, globalIgnores } from "eslint/config";
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
      "import-plugin": importPlugin
    },
    rules: {
      'import/no-duplicates': 'off',
      "simple-import-sort/imports": "off",
      "simple-import-sort/exports": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    },
    languageOptions: {
      parserOptions: {
        "sourceType": "module",
        "ecmaVersion": "latest"
      }
    }

  }
]);

export default eslintConfig;
