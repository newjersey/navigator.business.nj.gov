/**
 * TypeScript Compiler API utilities for generating a `UserData` interface
 * by fully expanding the `v191UserData` type from the migration source.
 *
 * This lives in `scripts/` (not `src/domain/`) because it depends on
 * `typescript` (a dev dependency) and `path`, neither of which are
 * permitted in production source.
 */

import { sortUnionParts } from "./userSchemaGenerator";
import path from "node:path";
import ts from "typescript";

/**
 * Recursively serializes a TypeScript type into a pretty-printed string
 * with proper indentation and alphabetized object keys.
 */
export const serializeType = (checker: ts.TypeChecker, type: ts.Type, depth: number): string => {
  const indent = "  ".repeat(depth);
  const innerIndent = "  ".repeat(depth + 1);

  if (type.isUnion()) {
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

  if (type.flags & ts.TypeFlags.String) return "string";
  if (type.flags & ts.TypeFlags.Number) return "number";
  if (type.flags & ts.TypeFlags.Boolean) return "boolean";
  if (type.flags & ts.TypeFlags.Undefined) return "undefined";
  if (type.flags & ts.TypeFlags.Null) return "null";

  if (type.isStringLiteral()) return JSON.stringify(type.value);
  if (type.isNumberLiteral()) return String(type.value);

  if (checker.isArrayType(type)) {
    const typeArgs = checker.getTypeArguments(type as ts.TypeReference);
    if (typeArgs.length === 1) {
      const elementStr = serializeType(checker, typeArgs[0], depth);
      return elementStr.includes(" | ") ? `(${elementStr})[]` : `${elementStr}[]`;
    }
  }

  if (type.flags & ts.TypeFlags.Object) {
    const properties = type.getProperties();
    const indexInfos = checker.getIndexInfosOfType(type);

    if (indexInfos.length > 0 && properties.length === 0) {
      const keyStr = serializeType(checker, indexInfos[0].keyType, depth);
      const valueStr = serializeType(checker, indexInfos[0].type, depth);
      return `Record<${keyStr}, ${valueStr}>`;
    }

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

  return checker.typeToString(type);
};

/**
 * Uses the TypeScript Compiler API to resolve the `v191UserData` interface and
 * recursively inline all referenced types into a single `interface UserData { ... }`.
 * @param migrationFilePath - Absolute path to the migration `.ts` file containing the type.
 * @param tsconfigPath - Absolute path to the `tsconfig.json` to use for compilation.
 * @returns A complete TypeScript interface string with all types fully expanded.
 */
export const generateTsSourceFromCompiler = (
  migrationFilePath: string,
  tsconfigPath: string,
): string => {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  const program = ts.createProgram([migrationFilePath], parsedConfig.options);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(migrationFilePath);

  if (!sourceFile) {
    throw new Error(`Could not load migration source file: ${migrationFilePath}`);
  }

  let userDataType: ts.Type | undefined;
  ts.forEachChild(sourceFile, (node) => {
    if (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.text === "v191UserData"
    ) {
      userDataType = checker.getTypeAtLocation(node.name);
    }
  });

  if (!userDataType) {
    throw new Error("Could not find v191UserData type");
  }

  const body = serializeType(checker, userDataType, 0);
  return `interface UserData ${body}`;
};
