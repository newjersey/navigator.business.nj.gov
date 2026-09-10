import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

/**
 * Enforces reproducible dependency declarations across package manifests and
 * keeps the repository on a single, exact pnpm toolchain with a single
 * lockfile.
 *
 * Registry dependencies must use exact semantic versions. Local protocols,
 * non-registry sources, and peer dependency compatibility ranges remain
 * valid because they do not resolve like ordinary registry dependencies.
 * Internal `@businessnjgovnavigator/*` dependencies must use the
 * `workspace:*` protocol specifically, not a bare `*` or a `file:` path.
 */

const DEPENDENCY_SECTIONS = ["dependencies", "devDependencies", "optionalDependencies"] as const;

const EXACT_SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ALLOWED_PROTOCOL = /^(?:file|git\+https?|https?|link|patch|portal):/;
const INTERNAL_PACKAGE_PREFIX = "@businessnjgovnavigator/";
const WORKSPACE_STAR = "workspace:*";

type DependencySection = (typeof DEPENDENCY_SECTIONS)[number];

type PackageManifest = Partial<Record<DependencySection, Record<string, unknown>>> & {
  readonly packageManager?: unknown;
  readonly peerDependencies?: Readonly<Record<string, unknown>>;
  readonly resolutions?: unknown;
  readonly overrides?: unknown;
  readonly pnpm?: unknown;
};

interface ManifestFile {
  readonly manifest: PackageManifest;
  readonly path: string;
}

interface PnpmWorkspaceConfig {
  readonly packages?: unknown;
  readonly overrides?: Readonly<Record<string, unknown>>;
  readonly allowBuilds?: unknown;
  readonly packageExtensions?: unknown;
  readonly peerDependencyRules?: unknown;
}

const isExactNpmAlias = (value: string): boolean => {
  if (!value.startsWith("npm:")) {
    return false;
  }

  const versionSeparator = value.lastIndexOf("@");
  return versionSeparator > "npm:".length && EXACT_SEMVER.test(value.slice(versionSeparator + 1));
};

/**
 * Returns whether a third-party (non-internal) dependency declaration is
 * reproducible: an exact version, an explicitly sourced non-registry
 * reference, or an exact-pinned `npm:` alias.
 */
export const isAllowedRegistryDependencyVersion = (value: unknown): boolean => {
  if (typeof value !== "string") {
    return false;
  }

  return EXACT_SEMVER.test(value) || ALLOWED_PROTOCOL.test(value) || isExactNpmAlias(value);
};

/**
 * Returns whether a dependency declaration is reproducible, applying the
 * stricter `workspace:*` requirement to internal
 * `@businessnjgovnavigator/*` packages and the exact-version/explicit-source
 * requirement to everything else.
 */
export const isAllowedDependencyVersion = (packageName: string, value: unknown): boolean => {
  if (packageName.startsWith(INTERNAL_PACKAGE_PREFIX)) {
    return value === WORKSPACE_STAR;
  }

  return isAllowedRegistryDependencyVersion(value);
};

/**
 * Reports dependency ranges, package-manager declarations, and legacy
 * Yarn-era fields (`resolutions`, npm-style `overrides`, an embedded `pnpm`
 * config block) that violate the repository's dependency policy. Peer
 * dependencies are intentionally not inspected because they describe
 * consumer compatibility rather than installs.
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
          `${manifestPath}: ${section}.${packageName} must use an exact version${
            packageName.startsWith(INTERNAL_PACKAGE_PREFIX) ? ` (or "${WORKSPACE_STAR}")` : ""
          }, got "${value}"`,
        );
      }
    }
  }

  if ("resolutions" in manifest) {
    errors.push(
      `${manifestPath}: "resolutions" is a Yarn artifact; use pnpm-workspace.yaml overrides`,
    );
  }

  if ("overrides" in manifest) {
    errors.push(
      `${manifestPath}: npm-style "overrides" is not read by pnpm; declare overrides in pnpm-workspace.yaml`,
    );
  }

  if ("pnpm" in manifest) {
    errors.push(
      `${manifestPath}: an embedded "pnpm" config block in package.json is not read by pnpm 11+; move settings to pnpm-workspace.yaml`,
    );
  }

  if (typeof manifest.packageManager === "string") {
    const separator = manifest.packageManager.lastIndexOf("@");
    const version = manifest.packageManager.slice(separator + 1);
    if (separator < 1 || !EXACT_SEMVER.test(version)) {
      errors.push(
        `${manifestPath}: packageManager must use an exact version, got "${manifest.packageManager}"`,
      );
    } else if (!manifest.packageManager.startsWith("pnpm@")) {
      errors.push(
        `${manifestPath}: packageManager must declare pnpm, got "${manifest.packageManager}"`,
      );
    }
  }

  return errors;
};

/**
 * Ensures exactly one `packageManager` declaration exists for the whole
 * repository (the root's), pinned to an exact pnpm version.
 */
export const validatePackageManagerDeclarations = (
  manifests: readonly ManifestFile[],
): readonly string[] => {
  const errors: string[] = [];
  const rootManifest = manifests.find(({ path: manifestPath }) => manifestPath === "package.json");
  const rootPackageManager = rootManifest?.manifest.packageManager;

  if (typeof rootPackageManager !== "string" || !rootPackageManager.startsWith("pnpm@")) {
    errors.push(
      `package.json: expected a pnpm packageManager declaration, got "${rootPackageManager}"`,
    );
    return errors;
  }

  for (const { manifest, path: manifestPath } of manifests) {
    if (manifestPath !== "package.json" && manifest.packageManager !== undefined) {
      errors.push(
        `${manifestPath}: only the root package.json may declare "packageManager", got "${manifest.packageManager}"`,
      );
    }
  }

  return errors;
};

/**
 * Ensures no Yarn configuration, vendored release, or lockfile remains
 * anywhere in the repository.
 */
export const validateNoYarnArtifacts = (rootDirectory: string): readonly string[] => {
  const errors: string[] = [];
  const forbiddenPaths = [
    ".yarnrc.yml",
    "yarn.lock",
    ".yarn/releases",
    ".yarn/plugins",
    ".yarn/sdks",
  ];

  for (const forbiddenPath of forbiddenPaths) {
    if (fs.existsSync(path.join(rootDirectory, forbiddenPath))) {
      errors.push(`${forbiddenPath}: Yarn artifact must be removed`);
    }
  }

  return errors;
};

/**
 * Ensures exactly one lockfile exists for the whole repository: the root
 * `pnpm-lock.yaml`. A nested lockfile (or workspace file) would mean a
 * package installs independently of the root workspace.
 */
export const validateSingleLockfile = (rootDirectory: string): readonly string[] => {
  const errors: string[] = [];

  if (!fs.existsSync(path.join(rootDirectory, "pnpm-lock.yaml"))) {
    errors.push("pnpm-lock.yaml: missing at repository root");
  }

  const trackedLockfiles = execFileSync("git", ["ls-files", "**/pnpm-lock.yaml"], {
    cwd: rootDirectory,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter((filePath) => filePath && filePath !== "pnpm-lock.yaml");

  for (const nestedLockfile of trackedLockfiles) {
    errors.push(
      `${nestedLockfile}: nested lockfile is not allowed; the root lockfile covers every workspace`,
    );
  }

  const nestedWorkspaceFile = path.join(rootDirectory, "packages/static-site/pnpm-workspace.yaml");
  if (fs.existsSync(nestedWorkspaceFile)) {
    errors.push("packages/static-site/pnpm-workspace.yaml: nested workspace file is not allowed");
  }

  return errors;
};

/**
 * Ensures the root `pnpm-workspace.yaml` carries no peer-dependency or
 * installer suppression config. Overrides themselves are not required to
 * carry a separate documentation entry; this repository does not commit
 * anything under `docs/`, so any override justification lives inline as a
 * comment in `pnpm-workspace.yaml` next to the entry itself, where it stays
 * versioned alongside the override it explains.
 */
export const validatePnpmWorkspaceConfig = (config: PnpmWorkspaceConfig): readonly string[] => {
  const errors: string[] = [];

  if ("packageExtensions" in config) {
    errors.push(
      "pnpm-workspace.yaml: packageExtensions is not allowed (peer-dependency suppression)",
    );
  }

  if ("peerDependencyRules" in config) {
    errors.push(
      "pnpm-workspace.yaml: peerDependencyRules is not allowed (peer-dependency suppression)",
    );
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
 * Validates every tracked package manifest plus the repository's pnpm
 * configuration, lockfile, and absence of Yarn artifacts.
 */
export const validateRepository = (rootDirectory: string): readonly string[] => {
  const errors: string[] = [];
  const manifests = trackedPackageJsonFiles(rootDirectory).map((manifestPath) => {
    const manifestFile = readManifest(rootDirectory, manifestPath);
    errors.push(...validateManifest(manifestFile.manifest, manifestPath));
    return manifestFile;
  });

  errors.push(...validatePackageManagerDeclarations(manifests));
  errors.push(...validateNoYarnArtifacts(rootDirectory));
  errors.push(...validateSingleLockfile(rootDirectory));

  const workspaceConfig = yaml.load(
    fs.readFileSync(path.join(rootDirectory, "pnpm-workspace.yaml"), "utf8"),
  ) as PnpmWorkspaceConfig;
  errors.push(...validatePnpmWorkspaceConfig(workspaceConfig));

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
