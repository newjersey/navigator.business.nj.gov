#!/usr/bin/env tsx

/**
 * Patches @newjersey/njwds CSS to fix invalid pseudo-element syntax
 * that causes Turbopack build failures.
 *
 * Issue: ::before--tile is invalid CSS (should be ::before)
 * This is a workaround until the upstream package is fixed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.join(__dirname, "../../node_modules/@newjersey/njwds/dist/css/styles.css");

try {
  if (!fs.existsSync(cssPath)) {
    console.log("⚠️  @newjersey/njwds CSS file not found, skipping patch");
    process.exit(0);
  }

  let css = fs.readFileSync(cssPath, "utf8");

  // Fix invalid pseudo-element syntax: ::before--tile -> ::before
  const originalCss = css;
  css = css.replaceAll('::before--tile', "::before");
  css = css.replaceAll('::after--tile', "::after");

  if (css === originalCss) {
    console.log("ℹ️  @newjersey/njwds CSS already patched or no changes needed");
  } else {
    fs.writeFileSync(cssPath, css, "utf8");
    console.log("✅ Patched @newjersey/njwds CSS for Turbopack compatibility");
  }
} catch (error) {
  console.error("❌ Failed to patch @newjersey/njwds CSS:", (error as Error).message);
  // Don't fail the install
  process.exit(0);
}
