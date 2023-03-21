import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { fileURLToPath } from "url";

const webflowLicenseDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../content/src/webflow-licenses`
);

const navigatorLicenseDir = path.resolve(
  `${path.dirname(fileURLToPath(import.meta.url))}/../../../content/src/roadmaps/license-tasks`
);

const convertLicenseMd = (mdContents, filename) => {
  const matterResult = matter(mdContents);
  const oppGrayMatter = matterResult.data;

  return {
    contentMd: matterResult.content,
    filename: filename,
    ...oppGrayMatter,
  };
};

export const loadAllLicenses = () => {
  const webflowLicenses = loadAllWebflowLicenses();
  const navigatorLicenses = loadAllNavigatorLicenses();

  return [...navigatorLicenses, ...webflowLicenses];
};

const loadAllWebflowLicenses = () => {
  const webflowFileNames = fs.readdirSync(webflowLicenseDir);

  return webflowFileNames.map((fileName) => {
    const fullPath = path.join(webflowLicenseDir, `${fileName}`);
    return loadLicenseByPath(fileName, fullPath);
  });
};

export const loadAllNavigatorLicenses = () => {
  const navigatorFileNames = fs.readdirSync(navigatorLicenseDir);

  return navigatorFileNames.map((fileName) => {
    const fullPath = path.join(navigatorLicenseDir, `${fileName}`);
    return loadLicenseByPath(fileName, fullPath);
  });
};

const loadLicenseByPath = (fileName, fullPath) => {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertLicenseMd(fileContents, fileNameWithoutMd);
};

export const loadNavigatorLicense = (fileName) => {
  const fullPath = path.join(navigatorLicenseDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertLicenseMd(fileContents, fileNameWithoutMd);
};

export const writeMarkdownString = (license) => {
  return (
    `---\n` +
    `id: "${license.id}"\n` +
    `webflowId: "${license.webflowId}"\n` +
    `urlSlug: "${license.urlSlug}"\n` +
    `name: "${license.name}"\n` +
    (license.webflowName ? `webflowName: "${license.webflowName}"\n` : "") +
    (license.filename ? `filename: "${license.filename}"\n` : "") +
    (license.callToActionLink ? `callToActionLink: "${license.callToActionLink}"\n` : "") +
    (license.callToActionText ? `callToActionText: "${license.callToActionText}"\n` : "") +
    (license.issuingAgency ? `issuingAgency: "${license.issuingAgency}"\n` : "") +
    (license.divisionPhone ? `divisionPhone: "${license.divisionPhone}"\n` : "") +
    (license.industryId ? `industryId: "${license.industryId}"\n` : "") +
    `licenseCertificationClassification: "${license.licenseCertificationClassification}"\n` +
    `---\n` +
    `${license.contentMd}`
  );
};
