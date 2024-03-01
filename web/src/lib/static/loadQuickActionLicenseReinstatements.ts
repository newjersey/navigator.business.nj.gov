import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { QuickActionLicenseReinstatement } from "@/lib/types/types";
import { convertQuickActionLicenseReinstatementMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const quickActionsLicenseReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "quick-action-license-reinstatements"
);

export type QuickActionLicenseReinstatementUrlSlugParam = {
  quickActionLicenseReinstatementUrlSlug: string;
};

export const loadAllQuickActionLicenseReinstatements = (): QuickActionLicenseReinstatement[] => {
  const fileNames = fs.readdirSync(quickActionsLicenseReinstatementsDir);

  return fileNames.map((fileName) => {
    return loadQuickActionLicenseReinstatementsByFileName(fileName);
  });
};

export const loadAllQuickActionLicenseReinstatementsUrlSlugs =
  (): PathParams<QuickActionLicenseReinstatementUrlSlugParam>[] => {
    const fileNames = fs.readdirSync(quickActionsLicenseReinstatementsDir);
    return fileNames.map((fileName) => {
      return {
        params: {
          quickActionLicenseReinstatementUrlSlug: loadUrlSlugByFilename(
            fileName,
            quickActionsLicenseReinstatementsDir
          ),
        },
      };
    });
  };

export const loadQuickActionLicenseReinstatementsByUrlSlug = (
  urlSlug: string
): QuickActionLicenseReinstatement => {
  const matchingFileName = getFileNameByUrlSlug(quickActionsLicenseReinstatementsDir, urlSlug);
  return loadQuickActionLicenseReinstatementsByFileName(matchingFileName);
};

const loadQuickActionLicenseReinstatementsByFileName = (
  fileName: string
): QuickActionLicenseReinstatement => {
  const fullPath = path.join(quickActionsLicenseReinstatementsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertQuickActionLicenseReinstatementMd(fileContents, fileNameWithoutMd);
};
