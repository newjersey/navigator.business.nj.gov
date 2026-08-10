import { cp, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const sourceRoot = path.join(repositoryRoot, "node_modules/@newjersey/njwds/dist");
const destinationRoot = path.resolve(scriptDirectory, "public/vendor");
const vendorDirectories = ["img", "js"] as const;

const copyVendorAssets = async (): Promise<void> => {
  await rm(destinationRoot, { recursive: true, force: true });
  await Promise.all(
    vendorDirectories.map(async (directory): Promise<void> => {
      await cp(path.join(sourceRoot, directory), path.join(destinationRoot, directory), {
        recursive: true,
      });
    }),
  );
};

// tsx transpiles scripts in this workspace to CommonJS, which does not support top-level await.
// eslint-disable-next-line unicorn/prefer-top-level-await
copyVendorAssets().catch((error: unknown) => {
  console.error("Failed to copy NJWDS vendor assets.", error);
  process.exitCode = 1;
});
