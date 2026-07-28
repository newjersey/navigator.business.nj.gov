import assert from "node:assert/strict";
import test from "node:test";
import {
  isAllowedDependencyVersion,
  validateManifest,
  validateRepository,
  validateYarnToolchainState,
} from "./validate-dependency-policy.mjs";

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
      packageManager: "yarn@^4.18.0",
      peerDependencies: { react: "^19.0.0" },
    },
    "example/package.json",
  );

  assert.deepEqual(errors, [
    'example/package.json: dependencies.example must use an exact version, got "^1.2.3"',
    'example/package.json: packageManager must use an exact version, got "yarn@^4.18.0"',
  ]);
});

test("reports mismatched Yarn declarations, configuration, and vendored releases", () => {
  const errors = validateYarnToolchainState({
    declarations: [
      { packageManager: "yarn@4.18.0", path: "package.json" },
      { packageManager: "yarn@4.17.1", path: "nested/package.json" },
    ],
    rootVersion: "4.18.0",
    vendoredReleaseNames: ["yarn-4.14.1.cjs"],
    yarnPath: ".yarn/releases/yarn-4.17.1.cjs",
  });

  assert.deepEqual(errors, [
    'nested/package.json: packageManager must match root yarn@4.18.0, got "yarn@4.17.1"',
    ".yarnrc.yml: yarnPath must be .yarn/releases/yarn-4.18.0.cjs, got " +
      '".yarn/releases/yarn-4.17.1.cjs"',
    ".yarn/releases: missing yarn-4.18.0.cjs",
    ".yarn/releases: remove unexpected releases yarn-4.14.1.cjs",
  ]);
});

test("the repository satisfies the dependency policy", () => {
  assert.deepEqual(validateRepository(process.cwd()), []);
});
