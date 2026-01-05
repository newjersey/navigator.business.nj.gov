#!/usr/bin/env tsx

/**
 * Copies vendor assets from node_modules to public/vendor directory.
 * Replaces the webpack CopyPlugin functionality for Turbopack builds.
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "../..");
const publicVendorDir = path.join(__dirname, "../public/vendor");

const copyTasks = [
  {
    from: path.join(rootDir, "node_modules/@newjersey/njwds/dist/img"),
    to: path.join(publicVendorDir, "img"),
    name: "NJWDS images",
  },
  {
    from: path.join(rootDir, "node_modules/@newjersey/njwds/dist/js"),
    to: path.join(publicVendorDir, "js"),
    name: "NJWDS JavaScript",
  },
];

async function copyVendorAssets(): Promise<void> {
  console.log("📦 Copying vendor assets...");

  // Clean vendor directory
  if (fs.existsSync(publicVendorDir)) {
    await fs.remove(publicVendorDir);
    console.log("  🧹 Cleaned public/vendor directory");
  }

  // Copy each asset
  for (const task of copyTasks) {
    try {
      if (!fs.existsSync(task.from)) {
        console.warn(`  ⚠️  Source not found: ${task.name} (${task.from})`);
        continue;
      }

      await fs.copy(task.from, task.to);
      console.log(`  ✅ Copied ${task.name}`);
    } catch (error) {
      console.error(`  ❌ Failed to copy ${task.name}:`, (error as Error).message);
      process.exit(1);
    }
  }

  console.log("✅ Vendor assets copied successfully");
}

// eslint-disable-next-line unicorn/prefer-top-level-await -- top-level await not supported with CJS output format
(async (): Promise<void> => {
  try {
    await copyVendorAssets();
  } catch (error) {
    console.error("❌ Failed to copy vendor assets:", error);
    process.exit(1);
  }
})();
