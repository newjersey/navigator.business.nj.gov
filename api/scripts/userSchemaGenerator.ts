/**
 * @module userSchemaGenerator
 *
 * Shared logic for generating user data schema representations from a runtime
 * Zod schema: Zod source code and TypeScript interface (from Zod runtime).
 *
 * TypeScript Compiler API logic lives in `api/scripts/userSchemaCompiler.ts`.
 *
 * Used by:
 * - `api/scripts/printUserZodSchema.ts` — CLI tool for terminal inspection
 * - `api/scripts/generateUserSchemaFile.ts` — writes cached output for the API endpoint
 */

/** A loosely-typed record used when traversing Zod's internal schema tree. */
type UnknownRecord = Record<string, unknown>;

/** Type guard that narrows an unknown value to a non-null object record. */
export const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === "object" && value !== null;
};

/**
 * Extracts the internal `def` object from a Zod schema node.
 * @throws If the node or its `def` property is not a record.
 */
export const getDef = (schema: unknown): UnknownRecord => {
  if (!isRecord(schema) || !isRecord(schema.def)) {
    throw new Error("Encountered an unexpected schema node");
  }
  return schema.def;
};

/**
 * Resolves the shape of a Zod object definition. Handles both static shapes
 * (plain objects) and lazy shapes (functions that return the shape).
 * @throws If no valid shape can be resolved.
 */
export const getShape = (def: UnknownRecord): UnknownRecord => {
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
 */
export const getCheckDef = (check: unknown): UnknownRecord | undefined => {
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
 */
export const serializeLiteral = (value: unknown): string => {
  if (value === undefined) return "undefined";
  if (typeof value === "bigint") return `${value}n`;
  return JSON.stringify(value);
};

/**
 * Appends Zod validation method chains (`.max()`, `.regex()`, etc.) to a base
 * expression string based on the checks defined on the schema node.
 */
export const applyChecks = (baseExpression: string, def: UnknownRecord): string => {
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
export const generateZodSource = (schema: unknown): string => {
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
 */
export const sortUnionParts = (parts: string[]): string[] =>
  parts.sort((a, b) => {
    const aIsNullish = a === "undefined" || a === "null";
    const bIsNullish = b === "undefined" || b === "null";
    if (aIsNullish !== bIsNullish) return aIsNullish ? 1 : -1;
    return 0;
  });

/**
 * Generates a TypeScript interface from a runtime Zod schema object by walking
 * the Zod schema tree and emitting TypeScript type syntax.
 * @param schema - The root Zod schema to serialize.
 * @returns A complete TypeScript interface string.
 */
export const generateTsSourceFromZod = (schema: unknown): string => {
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
