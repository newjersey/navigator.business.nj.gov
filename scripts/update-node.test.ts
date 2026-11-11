import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { resolveNodeVersion } from "./update-node.ts";

const releases = [
  { version: "v24.18.0", lts: "Krypton" },
  { version: "v22.10.0", lts: "Jod" },
  { version: "v22.9.0", lts: "Jod" },
];

test("resolves the latest LTS, latest major, and exact Node versions", () => {
  assert.equal(resolveNodeVersion(undefined, releases), "24.18.0");
  assert.equal(resolveNodeVersion("22", releases), "22.10.0");
  assert.equal(resolveNodeVersion("22.x", releases), "22.10.0");
  assert.equal(resolveNodeVersion("22.9.0", releases), "22.9.0");
});

test("rejects unknown Node versions", () => {
  assert.throws(() => resolveNodeVersion("20", releases), /No versions found for Node.js 20.x/);
  assert.throws(() => resolveNodeVersion("22.0.0", releases), /Version 22.0.0 not found/);
});

test("rejects the obsolete npm version argument before updating files", () => {
  const result = spawnSync(
    process.execPath,
    ["--import", "tsx", "scripts/update-node.ts", "24.18.0", "11.16.0"],
    { encoding: "utf8" },
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Expected at most one Node.js version argument/);
});

test("updates Node versions in an isolated checkout", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "navigator-node-update-"));
  try {
    const git = spawnSync("git", ["init", "--quiet", "--initial-branch=new-docker-image"], {
      cwd: directory,
      encoding: "utf8",
    });
    assert.equal(git.status, 0, git.stderr);
    const commit = spawnSync(
      "git",
      [
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "-c",
        "commit.gpgsign=false",
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "--quiet",
        "--allow-empty",
        "-m",
        "Initial commit",
      ],
      { cwd: directory, encoding: "utf8" },
    );
    assert.equal(commit.status, 0, commit.stderr);

    fs.mkdirSync(path.join(directory, "api"));
    fs.writeFileSync(path.join(directory, ".nvmrc"), "24.18.0\n");
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({ engines: { node: ">=24.18.0" }, scripts: { "verify:node": "old" } }),
    );
    fs.writeFileSync(path.join(directory, "api/package.json"), '{"engines":{"node":">=24.18.0"}}');
    for (const file of ["BuilderImage.Dockerfile", "WebApp.Dockerfile"]) {
      fs.writeFileSync(path.join(directory, file), "FROM node:24.18.0\n");
    }
    const requireFromRoot = createRequire(path.join(process.cwd(), "package.json"));
    const result = spawnSync(
      process.execPath,
      [
        "--import",
        requireFromRoot.resolve("tsx"),
        "--import",
        path.resolve("scripts/test-fixtures/mock-node-releases.mjs"),
        path.resolve("scripts/update-node.ts"),
        "22.9.0",
      ],
      { cwd: directory, encoding: "utf8" },
    );

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Updating to Node.js 22.9.0/);
    assert.doesNotMatch(result.stdout, /npm/);
    assert.equal(fs.readFileSync(path.join(directory, ".nvmrc"), "utf8"), "22.9.0\n");
    const root = JSON.parse(fs.readFileSync(path.join(directory, "package.json"), "utf8"));
    assert.equal(root.engines.node, ">=22.9.0");
    assert.equal(root.scripts["verify:node"], "check-node-version --node $(cat .nvmrc)");
    for (const file of ["api/package.json", "BuilderImage.Dockerfile", "WebApp.Dockerfile"]) {
      assert.match(fs.readFileSync(path.join(directory, file), "utf8"), /22\.9\.0/);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
