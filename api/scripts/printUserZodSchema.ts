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
import { highlight } from "cli-highlight";
import path from "node:path";
import ts from "typescript";
import { z } from "zod";

/** A loosely-typed record used when traversing Zod's internal schema tree. */
type UnknownRecord = Record<string, unknown>;

/** Type guard that narrows an unknown value to a non-null object record. */
const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null;
};

/**
 * Extracts the internal `def` object from a Zod schema node.
 * @param schema - A Zod schema node (expected to have a `.def` property).
 * @returns The definition record containing type info, shape, checks, etc.
 * @throws If the node or its `def` property is not a record.
 */
const getDef = (schema: unknown): UnknownRecord => {
  if (!isRecord(schema) || !isRecord(schema.def)) {
    throw new Error("Encountered an unexpected schema node");
  }
  return schema.def;
};

/**
 * Resolves the shape of a Zod object definition. Handles both static shapes
 * (plain objects) and lazy shapes (functions that return the shape).
 * @param def - The `def` record of a Zod object schema.
 * @returns A record mapping field names to their Zod schema nodes.
 * @throws If no valid shape can be resolved.
 */
const getShape = (def: UnknownRecord): UnknownRecord => {
  const rawShape = def.shape;

  if (isRecord(rawShape)) {
    return rawShape;
  }

  if (typeof rawShape === "function") {
    const resolvedShape = rawShape();
    if (isRecord(resolvedShape)) {
      return resolvedShape;
    }
  }

  throw new Error("Encountered an object schema without a valid shape");
};

/**
 * Extracts the definition record from a Zod validation check. Checks may store
 * their config in `_zod.def`, `def`, or directly on the object itself.
 * @param check - A single entry from a schema's `checks` array.
 * @returns The check definition record, or `undefined` if not extractable.
 */
const getCheckDef = (check: unknown): UnknownRecord | undefined => {
  if (!isRecord(check)) {
    return undefined;
  }

  const checkZod = check._zod;
  if (isRecord(checkZod) && isRecord(checkZod.def)) {
    return checkZod.def;
  }

  if (isRecord(check.def)) {
    return check.def;
  }

  return check;
};

/**
 * Converts a JavaScript primitive to its source-code representation.
 * @param value - A literal value (string, number, boolean, bigint, null, or undefined).
 * @returns A string suitable for embedding in generated Zod source code.
 */
const serializeLiteral = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (typeof value === "bigint") return `${value}n`;
  return JSON.stringify(value);
};

/**
 * Appends Zod validation method chains (`.max()`, `.regex()`, etc.) to a base
 * expression string based on the checks defined on the schema node.
 * @param baseExpression - The Zod expression built so far (e.g. `"z.string()"`).
 * @param def - The schema definition containing the `checks` array.
 * @returns The expression with any recognized checks chained on.
 */
const applyChecks = (baseExpression: string, def: UnknownRecord): string => {
  const checks = Array.isArray(def.checks) ? def.checks : [];
  let expression = baseExpression;

  for (const check of checks) {
    const checkDef = getCheckDef(check);
    if (!checkDef || typeof checkDef.check !== "string") {
      continue;
    }

    if (checkDef.check === "max_length" && typeof checkDef.maximum === "number") {
      expression = `${expression}.max(${checkDef.maximum})`;
      continue;
    }

    if (
      checkDef.check === "string_format" &&
      checkDef.format === "regex" &&
      checkDef.pattern instanceof RegExp
    ) {
      expression = `${expression}.regex(${checkDef.pattern.toString()})`;
      continue;
    }
  }

  return expression;
};

/**
 * Generates a self-contained Zod source file from a runtime Zod schema object.
 * Walks the schema tree recursively and produces a single, deeply nested
 * `z.object({...})` expression with proper indentation and alphabetized keys.
 * @param schema - The root Zod schema to serialize.
 * @returns A complete TypeScript source string with imports and the inlined schema.
 */
const generateZodSource = (schema: unknown): string => {
  /**
   * Recursively serializes a Zod schema node into its source-code representation.
   * @param currentSchema - The Zod schema node to serialize.
   * @param depth - Current nesting depth, used for indentation.
   * @returns A Zod expression string (e.g. `"z.string().optional()"`).
   */
  const serializeSchema = (currentSchema: unknown, depth: number): string => {
    const def = getDef(currentSchema);
    const type = def.type;

    if (typeof type !== "string") {
      return "z.any()";
    }

    const indent = "  ".repeat(depth);
    const innerIndent = "  ".repeat(depth + 1);

    switch (type) {
      case "object": {
        const shape = getShape(def);
        const fields = Object.entries(shape)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, value]) => {
            return `${innerIndent}${JSON.stringify(key)}: ${serializeSchema(value, depth + 1)}`;
          });
        const objectExpression =
          fields.length === 0 ? "z.object({})" : `z.object({\n${fields.join(",\n")}\n${indent}})`;
        return applyChecks(objectExpression, def);
      }
      case "string":
        return applyChecks("z.string()", def);
      case "number":
        return applyChecks("z.number()", def);
      case "boolean":
        return "z.boolean()";
      case "undefined":
        return "z.undefined()";
      case "optional": {
        return `${serializeSchema(def.innerType, depth)}.optional()`;
      }
      case "array": {
        return `z.array(${serializeSchema(def.element, depth)})`;
      }
      case "record": {
        const keyType = def.keyType ? serializeSchema(def.keyType, depth) : "z.string()";
        const valueType = def.valueType ? serializeSchema(def.valueType, depth) : "z.any()";
        return `z.record(${keyType}, ${valueType})`;
      }
      case "union": {
        const options = Array.isArray(def.options) ? def.options : [];
        const serializedOptions = options.map((option) => serializeSchema(option, depth));
        return `z.union([${serializedOptions.join(", ")}])`;
      }
      case "literal": {
        if (Array.isArray(def.values) && def.values.length > 0) {
          if (def.values.length === 1) {
            return `z.literal(${serializeLiteral(def.values[0])})`;
          }
          const literals = def.values.map((value) => `z.literal(${serializeLiteral(value)})`);
          return `z.union([${literals.join(", ")}])`;
        }
        return "z.any()";
      }
      case "enum": {
        if (isRecord(def.entries)) {
          const enumValues = [
            ...new Set(
              Object.values(def.entries).filter(
                (value): value is string => typeof value === "string",
              ),
            ),
          ];
          if (enumValues.length > 0) {
            return `z.enum(${JSON.stringify(enumValues)} as const)`;
          }
        }
        return "z.any()";
      }
      case "readonly": {
        return `${serializeSchema(def.innerType, depth)}.readonly()`;
      }
      default:
        return `z.any()`;
    }
  };

  const rootExpression = serializeSchema(schema, 0);

  return [
    `import { z } from "zod";`,
    `import { withNoBase64Check } from "../src/db/zodSchema/zodSchemas";`,
    ``,
    `const rawUserDataSchema = ${rootExpression};`,
    `const finalZodSchema = withNoBase64Check(rawUserDataSchema);`,
  ].join("\n");
};

/**
 * Sorts union parts so that `undefined` and `null` appear last in the output.
 * @param parts - Array of serialized union member strings.
 * @returns The same array, sorted with nullish types at the end.
 */
const sortUnionParts = (parts: string[]): string[] =>
  parts.sort((a, b) => {
    const aIsNullish = a === "undefined" || a === "null";
    const bIsNullish = b === "undefined" || b === "null";
    if (aIsNullish !== bIsNullish) return aIsNullish ? 1 : -1;
    return 0;
  });

/**
 * Generates a TypeScript interface from a runtime Zod schema object by walking
 * the Zod schema tree and emitting TypeScript type syntax. Produces a single,
 * deeply nested `interface UserData { ... }` with proper indentation,
 * alphabetized keys, and undefined sorted last in unions.
 * @param schema - The root Zod schema to serialize.
 * @returns A complete TypeScript interface string.
 */
const generateTsSourceFromZod = (schema: unknown): string => {
  /**
   * Recursively serializes a Zod schema node into a TypeScript type expression.
   * @param currentSchema - The Zod schema node to serialize.
   * @param depth - Current nesting depth, used for indentation.
   * @returns A TypeScript type string (e.g. `"string"`, `"{ "name": string; }"`).
   */
  const serializeSchema = (currentSchema: unknown, depth: number): string => {
    const def = getDef(currentSchema);
    const type = def.type;

    if (typeof type !== "string") {
      return "unknown";
    }

    const indent = "  ".repeat(depth);
    const innerIndent = "  ".repeat(depth + 1);

    switch (type) {
      case "object": {
        const shape = getShape(def);
        const entries = Object.entries(shape).sort(([a], [b]) => a.localeCompare(b));

        if (entries.length === 0) return "{}";

        const fields = entries.map(([key, value]) => {
          const childDef = getDef(value);
          const isOptional = childDef.type === "optional";
          const optionalSuffix = isOptional ? "?" : "";
          const innerSchema = isOptional ? childDef.innerType : value;
          const serialized = serializeSchema(innerSchema, depth + 1);
          const typeStr = isOptional ? `${serialized} | undefined` : serialized;
          return `${innerIndent}${JSON.stringify(key)}${optionalSuffix}: ${typeStr};`;
        });

        return `{\n${fields.join("\n")}\n${indent}}`;
      }
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "undefined":
        return "undefined";
      case "optional": {
        const inner = serializeSchema(def.innerType, depth);
        return `${inner} | undefined`;
      }
      case "array": {
        const elementStr = serializeSchema(def.element, depth);
        return elementStr.includes(" | ") ? `(${elementStr})[]` : `${elementStr}[]`;
      }
      case "record": {
        const keyType = def.keyType ? serializeSchema(def.keyType, depth) : "string";
        const valueType = def.valueType ? serializeSchema(def.valueType, depth) : "unknown";
        return `Record<${keyType}, ${valueType}>`;
      }
      case "union": {
        const options = Array.isArray(def.options) ? def.options : [];
        const parts = options.map((option) => serializeSchema(option, depth));
        return sortUnionParts(parts).join(" | ");
      }
      case "literal": {
        if (Array.isArray(def.values) && def.values.length > 0) {
          const parts = def.values.map((value) => serializeLiteral(value));
          return sortUnionParts(parts).join(" | ");
        }
        return "unknown";
      }
      case "enum": {
        if (isRecord(def.entries)) {
          const enumValues = [
            ...new Set(
              Object.values(def.entries).filter(
                (value): value is string => typeof value === "string",
              ),
            ),
          ];
          if (enumValues.length > 0) {
            return enumValues.map((v) => JSON.stringify(v)).join(" | ");
          }
        }
        return "unknown";
      }
      case "readonly": {
        const innerDef = getDef(def.innerType);
        if (innerDef.type !== "object") {
          return serializeSchema(def.innerType, depth);
        }
        const shape = getShape(innerDef);
        const entries = Object.entries(shape).sort(([a], [b]) => a.localeCompare(b));
        if (entries.length === 0) return "{}";
        const fields = entries.map(([key, value]) => {
          const childDef = getDef(value);
          const isOptional = childDef.type === "optional";
          const optionalSuffix = isOptional ? "?" : "";
          const innerSchema = isOptional ? childDef.innerType : value;
          const serialized = serializeSchema(innerSchema, depth + 1);
          const typeStr = isOptional ? `${serialized} | undefined` : serialized;
          return `${innerIndent}readonly ${JSON.stringify(key)}${optionalSuffix}: ${typeStr};`;
        });
        return `{\n${fields.join("\n")}\n${indent}}`;
      }
      default:
        return "unknown";
    }
  };

  const body = serializeSchema(schema, 0);
  return `interface UserData ${body}`;
};

/**
 * Recursively serializes a TypeScript type into a pretty-printed string
 * representation with proper indentation and alphabetized object keys.
 * @param checker - The TypeScript type checker instance.
 * @param type - The TypeScript type to serialize.
 * @param depth - Current nesting depth, used for indentation.
 * @returns A TypeScript type expression string.
 */
const serializeType = (checker: ts.TypeChecker, type: ts.Type, depth: number): string => {
  const indent = "  ".repeat(depth);
  const innerIndent = "  ".repeat(depth + 1);

  // Union types (string literal unions, unions with undefined, mixed unions)
  if (type.isUnion()) {
    // Collapse `false | true` back to `boolean`
    const hasFalse = type.types.some(
      (m) =>
        m.flags & ts.TypeFlags.BooleanLiteral &&
        (m as unknown as { intrinsicName: string }).intrinsicName === "false",
    );
    const hasTrue = type.types.some(
      (m) =>
        m.flags & ts.TypeFlags.BooleanLiteral &&
        (m as unknown as { intrinsicName: string }).intrinsicName === "true",
    );
    const nonBoolMembers = type.types.filter((m) => !(m.flags & ts.TypeFlags.BooleanLiteral));

    const serializeMember = (member: ts.Type): string => {
      if (member.flags & ts.TypeFlags.Undefined) return "undefined";
      if (member.flags & ts.TypeFlags.Null) return "null";
      if (member.isStringLiteral()) return JSON.stringify(member.value);
      if (member.isNumberLiteral()) return String(member.value);
      if (member.flags & ts.TypeFlags.BooleanLiteral) {
        return (member as unknown as { intrinsicName: string }).intrinsicName;
      }
      return serializeType(checker, member, depth);
    };

    if (hasFalse && hasTrue) {
      const parts = ["boolean", ...nonBoolMembers.map((m) => serializeMember(m))];
      return sortUnionParts(parts).join(" | ");
    }

    const parts = type.types.map((m) => serializeMember(m));
    return sortUnionParts(parts).join(" | ");
  }

  // Primitives
  if (type.flags & ts.TypeFlags.String) return "string";
  if (type.flags & ts.TypeFlags.Number) return "number";
  if (type.flags & ts.TypeFlags.Boolean) return "boolean";
  if (type.flags & ts.TypeFlags.Undefined) return "undefined";
  if (type.flags & ts.TypeFlags.Null) return "null";

  // Standalone literals (not part of a union)
  if (type.isStringLiteral()) return JSON.stringify(type.value);
  if (type.isNumberLiteral()) return String(type.value);

  // Arrays
  if (checker.isArrayType(type)) {
    const typeArgs = checker.getTypeArguments(type as ts.TypeReference);
    if (typeArgs.length === 1) {
      const elementStr = serializeType(checker, typeArgs[0], depth);
      return elementStr.includes(" | ") ? `(${elementStr})[]` : `${elementStr}[]`;
    }
  }

  // Object types (interfaces, anonymous objects, Records)
  if (type.flags & ts.TypeFlags.Object) {
    const properties = type.getProperties();
    const indexInfos = checker.getIndexInfosOfType(type);

    // Pure index signature with no named properties → Record<K, V>
    if (indexInfos.length > 0 && properties.length === 0) {
      const keyStr = serializeType(checker, indexInfos[0].keyType, depth);
      const valueStr = serializeType(checker, indexInfos[0].type, depth);
      return `Record<${keyStr}, ${valueStr}>`;
    }

    // Regular object with properties
    if (properties.length > 0) {
      const lines = [...properties]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((prop) => {
          const propType = checker.getTypeOfSymbol(prop);
          const isOptional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
          const declarations = prop.getDeclarations();
          const isReadonly =
            declarations?.some(
              (d) =>
                ts.isPropertySignature(d) &&
                d.modifiers?.some((m) => m.kind === ts.SyntaxKind.ReadonlyKeyword),
            ) ?? false;

          const serialized = serializeType(checker, propType, depth + 1);
          const readonlyPrefix = isReadonly ? "readonly " : "";
          const optionalSuffix = isOptional ? "?" : "";

          return `${innerIndent}${readonlyPrefix}${JSON.stringify(prop.name)}${optionalSuffix}: ${serialized};`;
        });

      return `{\n${lines.join("\n")}\n${indent}}`;
    }

    return "{}";
  }

  // Fallback for any unhandled type kinds
  return checker.typeToString(type);
};

/**
 * Uses the TypeScript Compiler API to resolve the `v190UserData` interface and
 * recursively inline all referenced types into a single `interface UserData { ... }`.
 * @returns A complete TypeScript interface string with all types fully expanded.
 */
const generateTsSourceFromCompiler = (): string => {
  const migrationFile = path.resolve(
    __dirname,
    "../src/db/migrations/v190_remove_hidden_fundings_and_certifications.ts",
  );

  const tsconfigPath = path.resolve(__dirname, "../tsconfig.json");
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  const program = ts.createProgram([migrationFile], parsedConfig.options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(migrationFile);

  if (!sourceFile) {
    throw new Error("Could not load migration source file");
  }

  let userDataType: ts.Type | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === "v190UserData"
    ) {
      userDataType = checker.getTypeAtLocation(node.name);
    }
  });

  if (!userDataType) {
    throw new Error("Could not find v190UserData type");
  }

  const body = serializeType(checker, userDataType, 0);
  return `interface UserData ${body}`;
};

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
  const source = generateTsSourceFromCompiler();
  console.log(highlight(source, { language: "typescript" }));
} else {
  const finalJsonSchema = z.toJSONSchema(finalZodSchema, {
    reused: "inline",
    unrepresentable: "any",
  });
  console.log(highlight(JSON.stringify(finalJsonSchema, undefined, 2), { language: "json" }));
}
