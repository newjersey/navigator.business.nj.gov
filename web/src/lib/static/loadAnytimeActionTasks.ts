import { loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionTask } from "@/lib/types/types";
import { convertAnytimeActionTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };

const anytimeActionsTaskAdminDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-admin"
);
const anytimeActionsTaskLicenseDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-licenses"
);
const anytimeActionsTaskReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks-reinstatements"
);

export type AnytimeActionTaskUrlSlugParam = {
  anytimeActionTaskUrlSlug: string;
};

export const loadAllAnytimeActionAdminTasks = (): AnytimeActionTask[] => {
  const adminFolderFileNames = fs.readdirSync(anytimeActionsTaskAdminDir);

  const anytimeActionTasksAdmin = adminFolderFileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName, anytimeActionsTaskAdminDir);
  });
  return [...anytimeActionTasksAdmin];
};

export const loadAllAnytimeActionLicensesTasks = (): AnytimeActionTask[] => {
  const licenseFolderFileNames = fs.readdirSync(anytimeActionsTaskLicenseDir);

  const anytimeActionTasksTasksLicenses = licenseFolderFileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName, anytimeActionsTaskLicenseDir);
  });

  return [...anytimeActionTasksTasksLicenses];
};

export const loadAllAnytimeActionReinstatementsTasks = (): AnytimeActionTask[] => {
  const reinstatementsFolderFileNames = fs.readdirSync(anytimeActionsTaskReinstatementsDir);

  const anytimeActionTasksTasksReinstatements = reinstatementsFolderFileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName, anytimeActionsTaskReinstatementsDir);
  });

  return [...anytimeActionTasksTasksReinstatements];
};

export const loadAllAnytimeActionTasks = (): AnytimeActionTask[] => {
  const anytimeActionTasksAdmin = loadAllAnytimeActionAdminTasks();
  const anytimeActionTasksTasksLicenses = loadAllAnytimeActionLicensesTasks();
  const anytimeActionTasksTasksReinstatements = loadAllAnytimeActionReinstatementsTasks();

  return [
    ...anytimeActionTasksTasksLicenses,
    ...anytimeActionTasksAdmin,
    ...anytimeActionTasksTasksReinstatements,
  ];
};

export const loadAllAnytimeActionTaskUrlSlugs = (): PathParams<AnytimeActionTaskUrlSlugParam>[] => {
  const adminFolderFileNames = fs.readdirSync(anytimeActionsTaskAdminDir);
  const licenseFolderFileNames = fs.readdirSync(anytimeActionsTaskLicenseDir);
  const reinstatementsFolderFileNames = fs.readdirSync(anytimeActionsTaskReinstatementsDir);

  const anytimeActionTaskAdminSlugs = adminFolderFileNames.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(fileName, anytimeActionsTaskAdminDir),
      },
    };
  });
  const anytimeActionTaskLicensesSlugs = licenseFolderFileNames.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(fileName, anytimeActionsTaskLicenseDir),
      },
    };
  });
  const anytimeActionTaskReinstatementsSlugs = reinstatementsFolderFileNames.map((fileName) => {
    return {
      params: {
        anytimeActionTaskUrlSlug: loadUrlSlugByFilename(fileName, anytimeActionsTaskReinstatementsDir),
      },
    };
  });

  return [
    ...anytimeActionTaskAdminSlugs,
    ...anytimeActionTaskLicensesSlugs,
    ...anytimeActionTaskReinstatementsSlugs,
  ];
};

export const loadAnytimeActionTaskByUrlSlug = (urlSlug: string): AnytimeActionTask => {
  const adminFolderFileNames = fs.readdirSync(anytimeActionsTaskAdminDir);
  const licenseFolderFileNames = fs.readdirSync(anytimeActionsTaskLicenseDir);
  const reinstatementsFolderFileNames = fs.readdirSync(anytimeActionsTaskReinstatementsDir);

  const matchingAdminFileName = adminFolderFileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName, anytimeActionsTaskAdminDir);
  });
  const matchingLicensesFileName = licenseFolderFileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName, anytimeActionsTaskLicenseDir);
  });
  const matchingReinstatementsFileName = reinstatementsFolderFileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName, anytimeActionsTaskReinstatementsDir);
  });

  if (matchingAdminFileName) {
    return loadAnytimeActionTasksByFileName(matchingAdminFileName, anytimeActionsTaskAdminDir);
  }
  if (matchingLicensesFileName) {
    return loadAnytimeActionTasksByFileName(matchingLicensesFileName, anytimeActionsTaskLicenseDir);
  }
  if (matchingReinstatementsFileName) {
    return loadAnytimeActionTasksByFileName(
      matchingReinstatementsFileName,
      anytimeActionsTaskReinstatementsDir
    );
  }

  return {
    callToActionLink: undefined,
    callToActionText: undefined,
    issuingAgency: undefined,
    name: "",
    icon: "",
    filename: "",
    urlSlug: "",
    contentMd: "Content Not Found",
    summaryDescriptionMd: "Summary Not Found",
    industryIds: [],
    sectorIds: [],
    applyToAllUsers: false,
  };
};

const loadAnytimeActionTasksByFileName = (fileName: string, anytimeActionDir: string): AnytimeActionTask => {
  let fileContents = "";

  const fullPath = path.join(anytimeActionDir, `${fileName}`);

  fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionTaskMd(fileContents, fileNameWithoutMd);
};
