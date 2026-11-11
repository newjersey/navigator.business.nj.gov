// Usage:
// pnpm exec tsx ./scripts/update-node.ts [node_version]

import { execSync } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "node:url";

/**
 * Represents a Node.js release from the official distribution API
 */
interface NodeRelease {
  /** Semver version with v prefix (e.g. "v18.18.2") */
  version: string;
  /** False if not LTS, codename string if LTS */
  lts: string | false;
}

/**
 * List of files to update with Node.js version in dots notation (e.g. "18.18.2")
 */
const filesToUpdateDots = [
  ".nvmrc",
  "package.json",
  "api/package.json",
  "BuilderImage.Dockerfile",
  "WebApp.Dockerfile",
];

/**
 * Fetches all Node.js releases from the official distribution API
 *
 * @throws {Error} If the API request fails
 * @returns {Promise<NodeRelease[]>} Array of Node.js releases
 */
async function fetchNodeReleases(): Promise<NodeRelease[]> {
  try {
    const response = await fetch("https://nodejs.org/dist/index.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return (await response.json()) as NodeRelease[];
  } catch (error) {
    throw new Error(`Failed to fetch Node.js releases: ${error.message}`);
  }
}

/**
 * Finds the latest LTS release from a list of releases
 *
 * @param {NodeRelease[]} releases - Array of Node.js releases
 * @throws {Error} If no LTS version is found
 * @returns {NodeRelease} Latest LTS release
 */
function findLatestLTS(releases: NodeRelease[]): NodeRelease {
  const latestLTS = releases.find((v) => v.lts !== false);
  if (!latestLTS) {
    throw new Error("No LTS version found in Node.js releases");
  }
  return latestLTS;
}

/**
 * Finds the latest release for a specific major version
 *
 * @param {NodeRelease[]} releases - Array of Node.js releases
 * @param {number} major - Major version number to find
 * @throws {Error} If no matching version is found
 * @returns {NodeRelease} Latest release for the specified major version
 */
function findLatestInMajorVersion(releases: NodeRelease[], major: number): NodeRelease {
  const majorVersions = releases
    .filter((r) => r.version.replace(/^v/, "").startsWith(`${major}.`))
    .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));

  if (majorVersions.length === 0) {
    throw new Error(`No versions found for Node.js ${major}.x`);
  }

  return majorVersions[0];
}

/**
 * Finds an exact version match from releases
 *
 * @param {NodeRelease[]} releases - Array of Node.js releases
 * @param {string} version - Version to find (without v prefix)
 * @throws {Error} If version is not found
 * @returns {NodeRelease} Matching release
 */
function findExactVersion(releases: NodeRelease[], version: string): NodeRelease {
  const exactMatch = releases.find((r) => r.version === `v${version}`);
  if (!exactMatch) {
    throw new Error(`Version ${version} not found in Node.js releases`);
  }
  return exactMatch;
}

/**
 * Resolves a Node.js version based on an optional version argument
 *
 * @param {string | undefined} nodeArg - Node.js version or major version
 * @param {NodeRelease[]} releases - Available Node.js releases
 * @throws {Error} If the version cannot be resolved
 * @returns {string} Node.js version without the v prefix
 */
export function resolveNodeVersion(nodeArg: string | undefined, releases: NodeRelease[]): string {
  if (nodeArg === undefined) {
    return findLatestLTS(releases).version.replace(/^v/, "");
  }

  const majorVersionMatch = nodeArg.match(/^(\d+)(?:\.x)?$/);

  if (majorVersionMatch) {
    const major = parseInt(majorVersionMatch[1]);
    const latest = findLatestInMajorVersion(releases, major);
    return latest.version.replace(/^v/, "");
  }

  const exactMatch = findExactVersion(releases, nodeArg);
  return exactMatch.version.replace(/^v/, "");
}

/**
 * Reads the current Node.js version from .nvmrc
 *
 * @throws {Error} If .nvmrc cannot be read
 * @returns {Promise<string>} Current Node.js version (dots notation)
 */
async function getCurrentNodeVersion(): Promise<string> {
  try {
    const nvmrcPath = path.resolve(".nvmrc");
    const version = await fs.readFile(nvmrcPath, "utf8");
    return version.trim();
  } catch (error) {
    throw new Error(`Failed to read .nvmrc: ${error.message}`);
  }
}

/**
 * Gets the current Git branch name
 *
 * @throws {Error} If Git command fails
 * @returns {string} Current Git branch name
 */
function getCurrentBranchName(): string {
  try {
    return execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
  } catch (error) {
    throw new Error(`Failed to get current branch name: ${error.message}`);
  }
}

/**
 * Updates a file with the new Node.js version
 *
 * @param {string} filePath - Path to the file to update
 * @param {string} oldVersion - Old Node.js version
 * @param {string} newVersion - New Node.js version
 * @throws {Error} If file update fails
 */
async function updateFile(filePath: string, oldVersion: string, newVersion: string): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    let content = await fs.readFile(absolutePath, "utf8");
    content = content.replace(new RegExp(oldVersion, "g"), newVersion);
    await fs.writeFile(absolutePath, content, "utf8");
    console.info(`✓ Updated ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to update ${filePath}: ${error.message}`);
  }
}

/**
 * Updates the verify:node script in package.json
 *
 * @param {string} filePath - Path to package.json
 * @throws {Error} If update fails
 */
async function updateVerifyNodeScript(filePath: string): Promise<void> {
  try {
    const absolutePath = path.resolve(filePath);
    const content = await fs.readFile(absolutePath, "utf8");
    const jsonContent = JSON.parse(content);
    jsonContent.scripts["verify:node"] = `check-node-version --node $(cat .nvmrc)`;
    await fs.writeFile(absolutePath, JSON.stringify(jsonContent, null, 2) + "\n", "utf8");
    console.info(`✓ Updated verify:node script in ${filePath}`);
  } catch (error) {
    throw new Error(`Failed to update verify:node script: ${error.message}`);
  }
}

/**
 * Main function to orchestrate the Node.js version update
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    if (args.length > 1) {
      throw new Error("Expected at most one Node.js version argument.");
    }

    const currentBranch = getCurrentBranchName();
    if (currentBranch !== "new-docker-image") {
      throw new Error('You must be on the "new-docker-image" branch to run this script.');
    }

    const nodeVersion = resolveNodeVersion(args[0], await fetchNodeReleases());
    console.info(`Updating to Node.js ${nodeVersion}`);

    const oldNodeVersionDots = await getCurrentNodeVersion();

    for (const filePath of filesToUpdateDots) {
      await updateFile(filePath, oldNodeVersionDots, nodeVersion);
    }

    await fs.writeFile(path.resolve(".nvmrc"), nodeVersion + "\n", "utf8");
    console.info(`✓ Updated .nvmrc to ${nodeVersion}`);

    await updateVerifyNodeScript("package.json");

    console.info("\nAll files updated successfully! 🎉");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nUsage:");
    console.error("  ./scripts/update-node.ts                  # Latest LTS version");
    console.error("  ./scripts/update-node.ts 18              # Latest in 18.x line");
    console.error("  ./scripts/update-node.ts 18.18.2         # Exact version");
    process.exit(1);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
