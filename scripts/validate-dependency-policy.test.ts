import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedDependencyVersion,
  validateManifest,
  validatePackageManagerDeclarations,
  validatePnpmWorkspaceConfig,
  validateRepository,
} from "./validate-dependency-policy.ts";

test("allows exact versions, explicit sources, and the workspace protocol", () => {
  assert.equal(isAllowedDependencyVersion("example", "1.2.3"), true);
  assert.equal(isAllowedDependencyVersion("example", "1.2.3-beta.1"), true);
  assert.equal(isAllowedDependencyVersion("example", "1.2.3+build.5"), true);
  assert.equal(isAllowedDependencyVersion("example", "npm:replacement@1.2.3"), true);
  assert.equal(isAllowedDependencyVersion("@businessnjgovnavigator/shared", "workspace:*"), true);
  assert.equal(
    isAllowedDependencyVersion("example", "git+https://example.com/repository.git"),
    true,
  );
});

test("rejects registry ranges, tags, and internal packages that skip workspace:*", () => {
  assert.equal(isAllowedDependencyVersion("example", "^1.2.3"), false);
  assert.equal(isAllowedDependencyVersion("example", "~1.2.3"), false);
  assert.equal(isAllowedDependencyVersion("example", "latest"), false);
  assert.equal(isAllowedDependencyVersion("example", "*"), false);
  assert.equal(isAllowedDependencyVersion("@businessnjgovnavigator/shared", "*"), false);
  assert.equal(
    isAllowedDependencyVersion("@businessnjgovnavigator/shared", "file:../shared"),
    false,
  );
});

test("reports the manifest path, dependency section, package, and value", () => {
  const errors = validateManifest(
    {
      dependencies: {
        example: "^1.2.3",
        "@businessnjgovnavigator/shared": "*",
      },
      packageManager: "pnpm@^12.0.0",
      peerDependencies: { react: "^19.0.0" },
    },
    "example/package.json",
  );

  assert.deepEqual(errors, [
    'example/package.json: dependencies.example must use an exact version, got "^1.2.3"',
    'example/package.json: dependencies.@businessnjgovnavigator/shared must use an exact version (or "workspace:*"), got "*"',
    'example/package.json: packageManager must use an exact version, got "pnpm@^12.0.0"',
  ]);
});

test("reports Yarn-era fields that pnpm no longer reads", () => {
  const errors = validateManifest(
    {
      dependencies: {},
      resolutions: { trim: "1.0.1" },
      overrides: { trim: "1.0.1" },
      pnpm: { overrides: { trim: "1.0.1" } },
    },
    "example/package.json",
  );

  assert.deepEqual(errors, [
    'example/package.json: "resolutions" is a Yarn artifact; use pnpm-workspace.yaml overrides',
    'example/package.json: npm-style "overrides" is not read by pnpm; declare overrides in pnpm-workspace.yaml',
    'example/package.json: an embedded "pnpm" config block in package.json is not read by pnpm 11+; move settings to pnpm-workspace.yaml',
  ]);
});

test("reports a non-pnpm or mismatched packageManager declaration", () => {
  const errors = validateManifest(
    { dependencies: {}, packageManager: "yarn@4.18.0" },
    "example/package.json",
  );

  assert.deepEqual(errors, [
    'example/package.json: packageManager must declare pnpm, got "yarn@4.18.0"',
  ]);
});

test("requires exactly one packageManager declaration, at the root", () => {
  const errors = validatePackageManagerDeclarations([
    { manifest: { packageManager: "pnpm@12.3.4" }, path: "package.json" },
    { manifest: { packageManager: "pnpm@12.3.4" }, path: "nested/package.json" },
  ]);

  assert.deepEqual(errors, [
    'nested/package.json: only the root package.json may declare "packageManager", got "pnpm@12.3.4"',
  ]);
});

test("fails when the root has no pnpm packageManager declaration", () => {
  const errors = validatePackageManagerDeclarations([{ manifest: {}, path: "package.json" }]);

  assert.deepEqual(errors, [
    'package.json: expected a pnpm packageManager declaration, got "undefined"',
  ]);
});

test("rejects peer-dependency suppression config", () => {
  const errors = validatePnpmWorkspaceConfig({
    packageExtensions: {},
    peerDependencyRules: {},
    overrides: { "some-package": "1.0.0" },
  });

  assert.deepEqual(errors, [
    "pnpm-workspace.yaml: packageExtensions is not allowed (peer-dependency suppression)",
    "pnpm-workspace.yaml: peerDependencyRules is not allowed (peer-dependency suppression)",
  ]);
});

test("the repository satisfies the dependency policy", () => {
  assert.deepEqual(validateRepository(process.cwd()), []);
});
