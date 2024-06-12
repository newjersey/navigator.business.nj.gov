import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import { convertAnytimeActionLicenseReinstatementMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const anytimeActionsLicenseReinstatementsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-license-reinstatements"
);

export type AnytimeActionLicenseReinstatementUrlSlugParam = {
  anytimeActionLicenseReinstatementUrlSlug: string;
};

export const loadAllAnytimeActionLicenseReinstatements = (): AnytimeActionLicenseReinstatement[] => {
  const fileNames = fs.readdirSync(anytimeActionsLicenseReinstatementsDir);

  return fileNames.map((fileName) => {
    return loadAnytimeActionLicenseReinstatementsByFileName(fileName);
  });
};

export const loadAllAnytimeActionLicenseReinstatementsUrlSlugs =
  (): PathParams<AnytimeActionLicenseReinstatementUrlSlugParam>[] => {
    const fileNames = fs.readdirSync(anytimeActionsLicenseReinstatementsDir);
    return fileNames.map((fileName) => {
      return {
        params: {
          anytimeActionLicenseReinstatementUrlSlug: loadUrlSlugByFilename(
            fileName,
            anytimeActionsLicenseReinstatementsDir
          ),
        },
      };
    });
  };

export const loadAnytimeActionLicenseReinstatementsByUrlSlug = (
  urlSlug: string
): AnytimeActionLicenseReinstatement => {
  const matchingFileName = getFileNameByUrlSlug(anytimeActionsLicenseReinstatementsDir, urlSlug);
  return loadAnytimeActionLicenseReinstatementsByFileName(matchingFileName);
};

const loadAnytimeActionLicenseReinstatementsByFileName = (
  fileName: string
): AnytimeActionLicenseReinstatement => {
  const fullPath = path.join(anytimeActionsLicenseReinstatementsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionLicenseReinstatementMd(fileContents, fileNameWithoutMd);
};
