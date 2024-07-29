// Usage:
// yarn dlx tsx ./scripts/update-node.ts <node_version> <npm_version>

import { execSync } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";

/**
 * List of files to update with new Node.js version (dots notation)
 */
const filesToUpdateDots = [
  ".nvmrc",
  "package.json",
  "api/package.json",
  "BuilderImage.Dockerfile",
  "WebApp.Dockerfile",
];

/**
 * List of files to update with new Node.js version (underscores notation)
 */
const filesToUpdateUnderscores = [".circleci/config.yml"];

/**
 * Reads the current Node.js version from .nvmrc
 *
 * @returns {Promise<string>} Current Node.js version (dots notation)
 */
async function getCurrentNodeVersion(): Promise<string> {
  const nvmrcPath = path.resolve(".nvmrc");
  const version = await fs.readFile(nvmrcPath, "utf8");
  return version.trim();
}

/**
 * Gets the current Git branch name
 *
 * @returns {string} Current Git branch name
 */
function getCurrentBranchName(): string {
  try {
    const branchName = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();
    return branchName;
  } catch (error) {
    console.error("Failed to get current branch name:", error);
    process.exit(1);
  }
}

/**
 * Updates a file with the new Node.js version
 *
 * @param {string} filePath - Path to the file to update
 * @param {string} oldVersion - Old Node.js version
 * @param {string} newVersion - New Node.js version
 */
async function updateFile(
  filePath: string,
  oldVersion: string,
  newVersion: string
): Promise<void> {
  const absolutePath = path.resolve(filePath);
  let content = await fs.readFile(absolutePath, "utf8");
  content = content.replace(new RegExp(oldVersion, "g"), newVersion);
  await fs.writeFile(absolutePath, content, "utf8");
  console.log(`Updated ${filePath}`);
}

/**
 * Updates the verify:node script in package.json
 *
 * @param {string} filePath - Path to the package.json file
 * @param {string} newNPMVersion - New NPM version
 */
async function updateVerifyNodeScript(
  filePath: string,
  newNPMVersion: string
): Promise<void> {
  const absolutePath = path.resolve(filePath);
  let content = await fs.readFile(absolutePath, "utf8");
  const jsonContent = JSON.parse(content);
  jsonContent.scripts[
    "verify:node"
  ] = `check-node-version --node $(cat .nvmrc) --npm ${newNPMVersion}`;
  await fs.writeFile(
    absolutePath,
    JSON.stringify(jsonContent, null, 2),
    "utf8"
  );
  console.log(`Updated verify:node script in package.json`);
}

/**
 * Main function to orchestrate the updates
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error(
      "Usage: ./scripts/update-node.ts <node_version> <npm_version>"
    );
    process.exit(1);
  }

  const currentBranch = getCurrentBranchName();

  if (currentBranch !== "heads/new-docker-image") {
    console.error(
      'Error: You must be on the "new-docker-image" branch to run this script.'
    );
    process.exit(1);
  }

  const newNodeVersionDots = args[0];
  const oldNodeVersionDots = await getCurrentNodeVersion();

  for (const filePath of filesToUpdateDots) {
    try {
      await updateFile(filePath, oldNodeVersionDots, newNodeVersionDots);
    } catch (error) {
      console.error(`Failed to update ${filePath}:`, error);
    }
  }

  const newNodeVersionUnderscores = args[0].replace(/\./g, "_");
  const oldNodeVersionUnderscores = oldNodeVersionDots.replace(/\./g, "_");

  console.log(`${oldNodeVersionUnderscores} -> ${newNodeVersionUnderscores}`);

  for (const filePath of filesToUpdateUnderscores) {
    try {
      await updateFile(
        filePath,
        oldNodeVersionUnderscores,
        newNodeVersionUnderscores
      );
    } catch (error) {
      console.error(`Failed to update ${filePath}:`, error);
    }
  }

  // Update .nvmrc with the new version
  const nvmrcPath = path.resolve(".nvmrc");
  await fs.writeFile(nvmrcPath, newNodeVersionDots + "\n", "utf8");
  console.log(`Updated .nvmrc to ${newNodeVersionDots}`);

  // Update package.json's check-node-version script with correct NPM version
  const newNPMVersion = args[1];
  await updateVerifyNodeScript("package.json", newNPMVersion);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
