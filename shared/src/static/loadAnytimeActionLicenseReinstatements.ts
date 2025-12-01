import fs from "fs";
import path from "path";
import { AnytimeActionLicenseReinstatement } from "../types/types";
import { convertAnytimeActionLicenseReinstatementMd } from "../utils/tasksMarkdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParameters<P> = { params: P; locale?: string };
const anytimeActionsLicenseReinstatementsDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-license-reinstatements",
);

export type AnytimeActionLicenseReinstatementUrlSlugParameter = {
  anytimeActionLicenseReinstatementUrlSlug: string;
};

export const loadAllAnytimeActionLicenseReinstatements =
  (): AnytimeActionLicenseReinstatement[] => {
    const fileNames = fs.readdirSync(anytimeActionsLicenseReinstatementsDirectory);

    return fileNames.map((fileName) => {
      return loadAnytimeActionLicenseReinstatementsByFileName(fileName);
    });
  };

export const loadAllAnytimeActionLicenseReinstatementsUrlSlugs =
  (): PathParameters<AnytimeActionLicenseReinstatementUrlSlugParameter>[] => {
    const fileNames = fs.readdirSync(anytimeActionsLicenseReinstatementsDirectory);
    return fileNames.map((fileName) => {
      return {
        params: {
          anytimeActionLicenseReinstatementUrlSlug: loadUrlSlugByFilename(
            fileName,
            anytimeActionsLicenseReinstatementsDirectory,
          ),
        },
      };
    });
  };

export const loadAnytimeActionLicenseReinstatementsByUrlSlug = (
  urlSlug: string,
): AnytimeActionLicenseReinstatement => {
  const matchingFileName = getFileNameByUrlSlug(
    anytimeActionsLicenseReinstatementsDirectory,
    urlSlug,
  );
  return loadAnytimeActionLicenseReinstatementsByFileName(matchingFileName);
};

const loadAnytimeActionLicenseReinstatementsByFileName = (
  fileName: string,
): AnytimeActionLicenseReinstatement => {
  const fullPath = path.join(anytimeActionsLicenseReinstatementsDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionLicenseReinstatementMd(fileContents, fileNameWithoutMd);
};
