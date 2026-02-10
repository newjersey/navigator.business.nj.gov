import fs from "fs";
import matter from "gray-matter";
import path from "path";

const webflowLicenseDir = path.resolve(`${__dirname}/../../../content/src/webflow-licenses`);

const navigatorLicenseDir = path.resolve(`${__dirname}/../../../content/src/roadmaps/license-tasks`);

const municipalDir = path.resolve(`${__dirname}/../../../content/src/roadmaps/municipal-tasks`);

const tasksAllDir = path.resolve(`${__dirname}/../../../content/src/roadmaps/tasks`);

export interface LicenseData {
  id: string;
  webflowId?: string;
  urlSlug: string;
  name: string;
  displayname: string;
  webflowName?: string;
  filename: string;
  callToActionLink?: string;
  callToActionText?: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  industryId?: string;
  webflowType?: string;
  licenseCertificationClassification: string;
  summaryDescriptionMd?: string;
  contentMd: string;
  syncToWebflow?: boolean | string;
  formName?: string;
  webflowIndustry?: string;
  [key: string]: unknown;
}

const convertLicenseMd = (mdContents: string, filename: string): LicenseData => {
  const matterResult = matter(mdContents);
  const oppGrayMatter = matterResult.data;

  return {
    ...oppGrayMatter,
    contentMd: matterResult.content,
    filename: filename,
  } as LicenseData;
};

export const loadAllLicenses = (): LicenseData[] => {
  const webflowLicenses = loadAllNavigatorWebflowLicenses();
  const navigatorLicenses = loadAllNavigatorLicenses();

  return [...navigatorLicenses, ...webflowLicenses];
};

export const loadAllNavigatorWebflowLicenses = (): LicenseData[] => {
  const webflowFileNames = fs.readdirSync(webflowLicenseDir);

  return webflowFileNames.map((fileName) => {
    const fullPath = path.join(webflowLicenseDir, `${fileName}`);
    return loadLicenseByPath(fileName, fullPath);
  });
};

export const loadAllNavigatorLicenses = (): LicenseData[] => {
  const navigatorFileNames = fs.readdirSync(navigatorLicenseDir);

  const navigatorLicenses = navigatorFileNames.map((fileName) => {
    const fullPath = path.join(navigatorLicenseDir, `${fileName}`);
    return loadLicenseByPath(fileName, fullPath);
  });

  const municipalFileNames = fs.readdirSync(municipalDir);
  const municipalLicenses = municipalFileNames.map((fileName) => {
    const fullPath = path.join(municipalDir, `${fileName}`);
    return loadLicenseByPath(fileName, fullPath);
  });

  const tasksAllFileNames = fs.readdirSync(tasksAllDir);
  const tasksAllLicenses = tasksAllFileNames
    .map((fileName) => {
      const fullPath = path.join(tasksAllDir, `${fileName}`);
      return loadLicenseByPath(fileName, fullPath);
    })
    .filter((license) => license.syncToWebflow === true || license.syncToWebflow === "true");

  return [...navigatorLicenses, ...municipalLicenses, ...tasksAllLicenses];
};

const loadLicenseByPath = (fileName: string, fullPath: string): LicenseData => {
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertLicenseMd(fileContents, fileNameWithoutMd);
};

const getMarkDownFromNavigatorDir = (fileName: string, filePath: string): [LicenseData, string] => {
  const fileContents = fs.readFileSync(filePath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const markdown = convertLicenseMd(fileContents, fileNameWithoutMd);
  return [markdown, filePath];
};

export const loadNavigatorLicense = (fileName: string): [LicenseData, string] => {
  const navigatorLicenseFile = path.join(navigatorLicenseDir, `${fileName}`);
  const municipalLicenseFile = path.join(municipalDir, `${fileName}`);
  const tasksAllLicenseFile = path.join(tasksAllDir, `${fileName}`);
  const webflowLicenseFile = path.join(webflowLicenseDir, `${fileName}`);

  if (fs.existsSync(navigatorLicenseFile)) {
    return getMarkDownFromNavigatorDir(fileName, navigatorLicenseFile);
  } else if (fs.existsSync(municipalLicenseFile)) {
    return getMarkDownFromNavigatorDir(fileName, municipalLicenseFile);
  } else if (fs.existsSync(tasksAllLicenseFile)) {
    return getMarkDownFromNavigatorDir(fileName, tasksAllLicenseFile);
  } else if (fs.existsSync(webflowLicenseFile)) {
    return getMarkDownFromNavigatorDir(fileName, webflowLicenseFile);
  } else {
    console.error("couldn't find file when trying to load from MD");
    throw new Error("couldn't find file when trying to load from MD");
  }
};

export const writeMarkdownString = (license: LicenseData): string => {
  return (
    `---\n` +
    `id: ${license.id}\n` +
    `webflowId: ${license.webflowId}\n` +
    `urlSlug: ${license.urlSlug}\n` +
    `name: ${license.name}\n` +
    `displayname: ${license.displayname}\n${
      license.webflowName ? `webflowName: ${license.webflowName}\n` : ""
    }${license.filename ? `filename: ${license.filename}\n` : ""}${
      license.callToActionLink ? `callToActionLink: ${license.callToActionLink}\n` : ""
    }${license.callToActionText ? `callToActionText: ${license.callToActionText}\n` : ""}${
      license.agencyId ? `agencyId: ${license.agencyId}\n` : ""
    }${
      license.agencyAdditionalContext
        ? `agencyAdditionalContext: ${license.agencyAdditionalContext}\n`
        : ""
    }${license.divisionPhone ? `divisionPhone: ${license.divisionPhone}\n` : ""}${
      license.industryId ? `industryId: ${license.industryId}\n` : ""
    }${
      license.webflowType ? `webflowType: ${license.webflowType}\n` : ""
    }licenseCertificationClassification: ${license.licenseCertificationClassification}\n${
      license.summaryDescriptionMd
        ? `summaryDescriptionMd: "${license.summaryDescriptionMd}"\n`
        : ""
    }---\n` +
    `${license.contentMd}`
  );
};
