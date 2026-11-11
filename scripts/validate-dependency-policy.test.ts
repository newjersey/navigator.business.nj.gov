import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedDependencyVersion,
  validateManifest,
  validateRepository,
  validatePackageManagerState,
} from "./validate-dependency-policy.ts";

test("allows exact versions and local dependency protocols", () => {
  assert.equal(isAllowedDependencyVersion("example", "1.2.3"), true);
  assert.equal(isAllowedDependencyVersion("example", "1.2.3-beta.1"), true);
  assert.equal(isAllowedDependencyVersion("example", "npm:replacement@1.2.3"), true);
  assert.equal(isAllowedDependencyVersion("@businessnjgovnavigator/shared", "workspace:*"), true);
  assert.equal(isAllowedDependencyVersion("@businessnjgovnavigator/shared", "*"), true);
  assert.equal(
    isAllowedDependencyVersion("example", "git+https://example.com/repository.git"),
    true,
  );
});

test("rejects registry ranges, tags, and external wildcards", () => {
  assert.equal(isAllowedDependencyVersion("example", "^1.2.3"), false);
  assert.equal(isAllowedDependencyVersion("example", "~1.2.3"), false);
  assert.equal(isAllowedDependencyVersion("example", "latest"), false);
  assert.equal(isAllowedDependencyVersion("example", "*"), false);
});

test("reports the manifest path, dependency section, package, and value", () => {
  const errors = validateManifest(
    {
      dependencies: { example: "^1.2.3" },
      packageManager: "pnpm@^12.18.0",
      peerDependencies: { react: "^19.0.0" },
    },
    "example/package.json",
  );

  assert.deepEqual(errors, [
    'example/package.json: dependencies.example must use an exact version, got "^1.2.3"',
    'example/package.json: packageManager must use an exact version, got "pnpm@^12.18.0"',
  ]);
});

test("reports mismatched package manager declarations", () => {
  const errors = validatePackageManagerState({
    declarations: [
      { packageManager: "pnpm@12.18.0", path: "package.json" },
      { packageManager: "yarn@4.17.1", path: "nested/package.json" },
    ],
    rootPackageManager: "pnpm@12.18.0",
  });

  assert.deepEqual(errors, [
    'nested/package.json: packageManager must match root pnpm@12.18.0, got "yarn@4.17.1"',
  ]);
});

test("the repository satisfies the dependency policy", () => {
  assert.deepEqual(validateRepository(process.cwd()), []);
});
