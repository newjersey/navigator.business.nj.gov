/**
 * Generates the cached TypeScript interface for the current user data schema
 * and writes it to `src/domain/userSchema.generated.ts`.
 *
 * Run via: yarn workspace @businessnjgovnavigator/api generate:user-schema
 *
 * This file is called by:
 * - `prebuild` / `prestart` package.json hooks (ensures the file exists before compile/serve)
 * - `scripts/generate-new-migration.sh` (keeps the cache fresh after each migration)
 */

import { generateTsSourceFromCompiler } from "./userSchemaCompiler";
import fs from "node:fs";
import path from "node:path";

const migrationFilePath = path.resolve(
  __dirname,
  "../src/db/migrations/v191_rotate_new_kms_keys.ts",
);

const tsconfigPath = path.resolve(__dirname, "../tsconfig.json");

const outputPath = path.resolve(__dirname, "../src/domain/userSchema.generated.ts");

const source = generateTsSourceFromCompiler(migrationFilePath, tsconfigPath);

const fileContent = [
  "// This file is auto-generated. Run `yarn workspace @businessnjgovnavigator/api generate:user-schema` to update.",
  "// Do not edit manually.",
  "",
  `export const userSchemaTs = \`${source}\`;`,
  "",
].join("\n");

fs.writeFileSync(outputPath, fileContent, "utf8");
console.log(`Written: ${path.relative(process.cwd(), outputPath)}`);
