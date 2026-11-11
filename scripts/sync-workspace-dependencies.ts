import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

interface Manifest {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface WorkspaceManifest {
  readonly path: string;
  readonly manifest: Manifest;
}

/** Synchronize Navigator dependencies without changing static-site's independent versions. */
export const syncDependencies = (
  root: Manifest,
  workspaces: readonly WorkspaceManifest[],
): void => {
  const rootDependencies = root.dependencies ?? (root.dependencies = {});
  const rootDevDependencies = root.devDependencies ?? (root.devDependencies = {});
  const knownDependencies = { ...rootDependencies, ...rootDevDependencies };

  for (const { manifest } of workspaces) {
    if (manifest.name === "@businessnjgovnavigator/static-site") continue;
    for (const section of ["dependencies", "devDependencies"] as const) {
      const dependencies = manifest[section];
      if (!dependencies) continue;
      for (const [name, version] of Object.entries(dependencies)) {
        if (name.startsWith("@businessnjgovnavigator/")) continue;
        const rootVersion = knownDependencies[name];
        if (rootVersion) {
          dependencies[name] = rootVersion;
        } else {
          const target = section === "dependencies" ? rootDependencies : rootDevDependencies;
          target[name] = version;
          knownDependencies[name] = version;
        }
      }
    }
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readManifest = (filePath: string): Manifest => {
  const value: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!isRecord(value) || (value.name !== undefined && typeof value.name !== "string")) {
    throw new Error(`Invalid package manifest: ${filePath}`);
  }
  for (const section of ["dependencies", "devDependencies"] as const) {
    const dependencies = value[section];
    if (
      dependencies !== undefined &&
      (!isRecord(dependencies) ||
        Object.values(dependencies).some((version) => typeof version !== "string"))
    ) {
      throw new Error(`Invalid ${section} in ${filePath}`);
    }
  }
  return value as Manifest;
};

const readWorkspacePackages = (filePath: string): readonly string[] => {
  const value: unknown = yaml.load(fs.readFileSync(filePath, "utf8"));
  if (
    !isRecord(value) ||
    !Array.isArray(value.packages) ||
    value.packages.some((item) => typeof item !== "string")
  ) {
    throw new Error(`Invalid workspace package list: ${filePath}`);
  }
  return value.packages;
};

const writeIfChanged = (filePath: string, manifest: Manifest): void => {
  const contents = `${JSON.stringify(manifest, null, 2)}\n`;
  if (fs.readFileSync(filePath, "utf8") !== contents) fs.writeFileSync(filePath, contents);
};

const run = (): void => {
  if (!process.argv.includes("--fix"))
    throw new Error("Run with --fix to synchronize dependencies");
  const rootDirectory = process.cwd();
  const packages = readWorkspacePackages(path.join(rootDirectory, "pnpm-workspace.yaml"));
  const rootPath = path.join(rootDirectory, "package.json");
  const root = readManifest(rootPath);
  const workspaces = packages.map((directory) => {
    const manifestPath = path.join(rootDirectory, directory, "package.json");
    return { path: manifestPath, manifest: readManifest(manifestPath) };
  });
  syncDependencies(root, workspaces);
  writeIfChanged(rootPath, root);
  for (const workspace of workspaces) {
    if (workspace.manifest.name !== "@businessnjgovnavigator/static-site") {
      writeIfChanged(workspace.path, workspace.manifest);
    }
  }
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run();
