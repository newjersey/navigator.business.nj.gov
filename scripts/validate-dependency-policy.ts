import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

/**
 * Enforces reproducible dependency declarations across package manifests and
 * keeps every Yarn version declaration synchronized with the vendored binary.
 *
 * Registry dependencies must use exact semantic versions. Local protocols,
 * non-registry sources, internal workspace wildcards, and peer dependency
 * compatibility ranges remain valid because they do not resolve like ordinary
 * registry dependencies.
 */

const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "resolutions",
  "overrides",
] as const;

const EXACT_SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ALLOWED_PROTOCOL = /^(?:file|git\+https?|https?|link|patch|portal|workspace):/;
const INTERNAL_PACKAGE_PREFIX = "@businessnjgovnavigator/";

type DependencySection = (typeof DEPENDENCY_SECTIONS)[number];

type PackageManifest = Partial<Record<DependencySection, Record<string, unknown>>> & {
  readonly packageManager?: unknown;
  readonly peerDependencies?: Readonly<Record<string, unknown>>;
};

interface YarnDeclaration {
  readonly packageManager: string;
  readonly path: string;
}

interface YarnToolchainState {
  readonly declarations: readonly YarnDeclaration[];
  readonly rootVersion: string;
  readonly vendoredReleaseNames: readonly string[];
  readonly yarnPath: unknown;
}

interface YarnConfiguration {
  readonly yarnPath?: unknown;
}

interface ManifestFile {
  readonly manifest: PackageManifest;
  readonly path: string;
}

const isExactNpmAlias = (value: string): boolean => {
  if (!value.startsWith("npm:")) {
    return false;
  }

  const versionSeparator = value.lastIndexOf("@");
  return versionSeparator > "npm:".length && EXACT_SEMVER.test(value.slice(versionSeparator + 1));
};

/**
 * Returns whether a dependency declaration is reproducible without forbidding
 * local workspaces or explicitly sourced non-registry packages.
 */
export const isAllowedDependencyVersion = (packageName: string, value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  if (EXACT_SEMVER.test(value) || ALLOWED_PROTOCOL.test(value) || isExactNpmAlias(value)) {
    return true;
  }

  return value === "*" && packageName.startsWith(INTERNAL_PACKAGE_PREFIX);
};

/**
 * Reports dependency ranges and package-manager declarations that violate the
 * repository's exact-version policy. Peer dependencies are intentionally not
 * inspected because they describe consumer compatibility rather than installs.
 */
export const validateManifest = (
  manifest: PackageManifest,
  manifestPath: string,
): readonly string[] => {
  const errors: string[] = [];

  for (const section of DEPENDENCY_SECTIONS) {
    for (const [packageName, value] of Object.entries(manifest[section] ?? {})) {
      if (!isAllowedDependencyVersion(packageName, value)) {
        errors.push(
          `${manifestPath}: ${section}.${packageName} must use an exact version, got "${value}"`,
        );
      }
    }
  }

  if (typeof manifest.packageManager === "string") {
    const separator = manifest.packageManager.lastIndexOf("@");
    const version = manifest.packageManager.slice(separator + 1);
    if (separator < 1 || !EXACT_SEMVER.test(version)) {
      errors.push(
        `${manifestPath}: packageManager must use an exact version, got "${manifest.packageManager}"`,
      );
    }
  }

  return errors;
};

/**
 * Ensures package manifests, `.yarnrc.yml`, and `.yarn/releases` all identify
 * one exact Yarn version so Corepack and `yarnPath` cannot select different
 * package-manager builds.
 */
export const validateYarnToolchainState = ({
  declarations,
  rootVersion,
  vendoredReleaseNames,
  yarnPath,
}: YarnToolchainState): readonly string[] => {
  const errors: string[] = [];
  const expectedPackageManager = `yarn@${rootVersion}`;
  const expectedReleaseName = `yarn-${rootVersion}.cjs`;
  const expectedYarnPath = `.yarn/releases/${expectedReleaseName}`;

  for (const declaration of declarations) {
    if (declaration.packageManager !== expectedPackageManager) {
      errors.push(
        `${declaration.path}: packageManager must match root ${expectedPackageManager}, got "${declaration.packageManager}"`,
      );
    }
  }

  if (yarnPath !== expectedYarnPath) {
    errors.push(`.yarnrc.yml: yarnPath must be ${expectedYarnPath}, got "${yarnPath}"`);
  }

  const unexpectedReleases = vendoredReleaseNames.filter((name) => name !== expectedReleaseName);
  if (!vendoredReleaseNames.includes(expectedReleaseName)) {
    errors.push(`.yarn/releases: missing ${expectedReleaseName}`);
  }
  if (unexpectedReleases.length > 0) {
    errors.push(`.yarn/releases: remove unexpected releases ${unexpectedReleases.join(", ")}`);
  }

  return errors;
};

const trackedPackageJsonFiles = (rootDirectory: string): readonly string[] => {
  return execFileSync("git", ["ls-files", "**/package.json", "package.json"], {
    cwd: rootDirectory,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter((filePath) => filePath && !filePath.startsWith(".yarn/"))
    .sort();
};

const readManifest = (rootDirectory: string, manifestPath: string): ManifestFile => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(rootDirectory, manifestPath), "utf8"),
  ) as PackageManifest;
  return { manifest, path: manifestPath };
};

/**
 * Validates every tracked package manifest plus the repository's Yarn
 * configuration and vendored release directory.
 */
export const validateRepository = (rootDirectory: string): readonly string[] => {
  const errors: string[] = [];
  const manifests = trackedPackageJsonFiles(rootDirectory).map((manifestPath) => {
    const { manifest } = readManifest(rootDirectory, manifestPath);
    errors.push(...validateManifest(manifest, manifestPath));
    return { manifest, path: manifestPath };
  });

  const rootManifest = manifests.find(({ path: manifestPath }) => manifestPath === "package.json");
  const rootPackageManager = rootManifest?.manifest.packageManager;
  if (typeof rootPackageManager !== "string" || !rootPackageManager.startsWith("yarn@")) {
    errors.push(
      `package.json: expected a Yarn packageManager declaration, got "${rootPackageManager}"`,
    );
    return errors;
  }

  const rootVersion = rootPackageManager.slice("yarn@".length);
  const declarations: YarnDeclaration[] = [];
  for (const { manifest, path: manifestPath } of manifests) {
    if (
      typeof manifest.packageManager === "string" &&
      manifest.packageManager.startsWith("yarn@")
    ) {
      declarations.push({
        packageManager: manifest.packageManager,
        path: manifestPath,
      });
    }
  }
  const yarnConfiguration = yaml.load(
    fs.readFileSync(path.join(rootDirectory, ".yarnrc.yml"), "utf8"),
  ) as YarnConfiguration;
  const vendoredReleaseNames = fs
    .readdirSync(path.join(rootDirectory, ".yarn/releases"))
    .filter((fileName) => fileName.startsWith("yarn-") && fileName.endsWith(".cjs"));

  errors.push(
    ...validateYarnToolchainState({
      declarations,
      rootVersion,
      vendoredReleaseNames,
      yarnPath: yarnConfiguration.yarnPath,
    }),
  );

  return errors;
};

const run = (): void => {
  const errors = validateRepository(process.cwd());
  if (errors.length === 0) {
    console.log("Dependency policy validation passed.");
    return;
  }

  for (const error of errors) {
    console.error(`Dependency policy violation: ${error}`);
  }
  process.exitCode = 1;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run();
}
