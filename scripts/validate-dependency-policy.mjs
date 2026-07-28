import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "resolutions",
  "overrides",
];

const EXACT_SEMVER =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const ALLOWED_PROTOCOL = /^(?:file|git\+https?|https?|link|patch|portal|workspace):/;
const INTERNAL_PACKAGE_PREFIX = "@businessnjgovnavigator/";

const isExactNpmAlias = (value) => {
  if (!value.startsWith("npm:")) {
    return false;
  }

  const versionSeparator = value.lastIndexOf("@");
  return versionSeparator > "npm:".length && EXACT_SEMVER.test(value.slice(versionSeparator + 1));
};

export const isAllowedDependencyVersion = (packageName, value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (EXACT_SEMVER.test(value) || ALLOWED_PROTOCOL.test(value) || isExactNpmAlias(value)) {
    return true;
  }

  return value === "*" && packageName.startsWith(INTERNAL_PACKAGE_PREFIX);
};

export const validateManifest = (manifest, manifestPath) => {
  const errors = [];

  for (const section of DEPENDENCY_SECTIONS) {
    for (const [packageName, value] of Object.entries(manifest[section] ?? {})) {
      if (!isAllowedDependencyVersion(packageName, value)) {
        errors.push(
          `${manifestPath}: ${section}.${packageName} must use an exact version, got "${value}"`,
        );
      }
    }
  }

  if (manifest.packageManager) {
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

export const validateYarnToolchainState = ({
  declarations,
  rootVersion,
  vendoredReleaseNames,
  yarnPath,
}) => {
  const errors = [];
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

const trackedPackageJsonFiles = (rootDirectory) => {
  return execFileSync("git", ["ls-files", "**/package.json", "package.json"], {
    cwd: rootDirectory,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter((filePath) => filePath && !filePath.startsWith(".yarn/"))
    .sort();
};

export const validateRepository = (rootDirectory) => {
  const errors = [];
  const manifests = trackedPackageJsonFiles(rootDirectory).map((manifestPath) => {
    const manifest = JSON.parse(fs.readFileSync(path.join(rootDirectory, manifestPath), "utf8"));
    errors.push(...validateManifest(manifest, manifestPath));
    return { manifest, path: manifestPath };
  });

  const rootManifest = manifests.find(({ path: manifestPath }) => manifestPath === "package.json");
  const rootPackageManager = rootManifest?.manifest.packageManager;
  if (!rootPackageManager?.startsWith("yarn@")) {
    errors.push(
      `package.json: expected a Yarn packageManager declaration, got "${rootPackageManager}"`,
    );
    return errors;
  }

  const rootVersion = rootPackageManager.slice("yarn@".length);
  const declarations = manifests
    .filter(({ manifest }) => manifest.packageManager?.startsWith("yarn@"))
    .map(({ manifest, path: manifestPath }) => ({
      packageManager: manifest.packageManager,
      path: manifestPath,
    }));
  const yarnConfiguration = yaml.load(
    fs.readFileSync(path.join(rootDirectory, ".yarnrc.yml"), "utf8"),
  );
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

const run = () => {
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
