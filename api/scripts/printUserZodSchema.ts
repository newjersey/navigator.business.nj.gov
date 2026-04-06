/**
 * @module printUserZodSchema
 *
 * CLI script that prints the current user data schema in one of four formats:
 * Zod source code, JSON Schema, TypeScript interface (from the TS Compiler API),
 * or TypeScript interface (from the Zod schema at runtime). Useful for inspecting
 * raw user data against the expected shape without navigating the full migration chain.
 *
 * Output is syntax-highlighted for terminal readability, with object keys
 * alphabetized for easy scanning.
 *
 * @example
 * ```sh
 * # Print as Zod source (TypeScript)
 * yarn workspace @businessnjgovnavigator/api print:user-schema:zod
 *
 * # Print as JSON Schema
 * yarn workspace @businessnjgovnavigator/api print:user-schema:json
 *
 * # Print as TypeScript interface (from TS Compiler API)
 * yarn workspace @businessnjgovnavigator/api print:user-schema:ts
 *
 * # Print as TypeScript interface (from Zod schema)
 * yarn workspace @businessnjgovnavigator/api print:user-schema:ts-zod
 * ```
 */

import { v190UserDataSchema, withNoBase64Check } from "@db/zodSchema/zodSchemas";
import { generateTsSourceFromCompiler } from "./userSchemaCompiler";
import { generateTsSourceFromZod, generateZodSource } from "./userSchemaGenerator";
import { highlight } from "cli-highlight";
import path from "node:path";
import { z } from "zod";

const migrationFilePath = path.resolve(
  __dirname,
  "../src/db/migrations/v190_remove_hidden_fundings_and_certifications.ts",
);

const tsconfigPath = path.resolve(__dirname, "../tsconfig.json");

const finalZodSchema = withNoBase64Check(v190UserDataSchema);
const shouldPrintZod = process.argv.includes("--zod");
const shouldPrintJson = process.argv.includes("--json");
const shouldPrintTsZod = process.argv.includes("--ts-zod");
const shouldPrintTs = process.argv.includes("--ts");
const modeCount = [shouldPrintZod, shouldPrintJson, shouldPrintTs, shouldPrintTsZod].filter(
  Boolean,
).length;

if (modeCount !== 1) {
  throw new Error("Usage: tsx scripts/printUserZodSchema.ts --zod | --json | --ts | --ts-zod");
}

if (shouldPrintZod) {
  const source = generateZodSource(v190UserDataSchema);
  console.log(highlight(source, { language: "typescript" }));
} else if (shouldPrintTsZod) {
  const source = generateTsSourceFromZod(v190UserDataSchema);
  console.log(highlight(source, { language: "typescript" }));
} else if (shouldPrintTs) {
  const source = generateTsSourceFromCompiler(migrationFilePath, tsconfigPath);
  console.log(highlight(source, { language: "typescript" }));
} else {
  const finalJsonSchema = z.toJSONSchema(finalZodSchema, {
    reused: "inline",
    unrepresentable: "any",
  });
  console.log(highlight(JSON.stringify(finalJsonSchema, undefined, 2), { language: "json" }));
}
