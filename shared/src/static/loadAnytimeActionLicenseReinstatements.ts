import fs from "fs";
import path from "path";
import { AnytimeActionLicenseReinstatement } from "../types/types";
import { convertAnytimeActionLicenseReinstatementMd } from "../utils/tasksMarkdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParameters<P> = { params: P; locale?: string };

// Helper to find content directory from different test contexts
const findContentDirectory = (): string => {
  const possiblePaths = [
    path.join(process.cwd(), "..", "content", "src", "anytime-action-license-reinstatements"),
    path.join(process.cwd(), "content", "src", "anytime-action-license-reinstatements"),
    path.join(process.cwd(), "..", "..", "content", "src", "anytime-action-license-reinstatements"),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    `Could not find content/src/anytime-action-license-reinstatements directory. Tried: ${possiblePaths.join(", ")}`,
  );
};

let anytimeActionsLicenseReinstatementsDirectory: string | undefined;

const getAnytimeActionsLicenseReinstatementsDirectory = (): string => {
  if (!anytimeActionsLicenseReinstatementsDirectory) {
    anytimeActionsLicenseReinstatementsDirectory = findContentDirectory();
  }
  return anytimeActionsLicenseReinstatementsDirectory;
};

export type AnytimeActionLicenseReinstatementUrlSlugParameter = {
  anytimeActionLicenseReinstatementUrlSlug: string;
};

export const loadAllAnytimeActionLicenseReinstatements =
  (): AnytimeActionLicenseReinstatement[] => {
    const fileNames = fs.readdirSync(getAnytimeActionsLicenseReinstatementsDirectory());

    return fileNames.map((fileName) => {
      return loadAnytimeActionLicenseReinstatementsByFileName(fileName);
    });
  };

export const loadAllAnytimeActionLicenseReinstatementsUrlSlugs =
  (): PathParameters<AnytimeActionLicenseReinstatementUrlSlugParameter>[] => {
    const directory = getAnytimeActionsLicenseReinstatementsDirectory();
    const fileNames = fs.readdirSync(directory);
    return fileNames.map((fileName) => {
      return {
        params: {
          anytimeActionLicenseReinstatementUrlSlug: loadUrlSlugByFilename(fileName, directory),
        },
      };
    });
  };

export const loadAnytimeActionLicenseReinstatementsByUrlSlug = (
  urlSlug: string,
): AnytimeActionLicenseReinstatement => {
  const matchingFileName = getFileNameByUrlSlug(
    getAnytimeActionsLicenseReinstatementsDirectory(),
    urlSlug,
  );
  return loadAnytimeActionLicenseReinstatementsByFileName(matchingFileName);
};

const loadAnytimeActionLicenseReinstatementsByFileName = (
  fileName: string,
): AnytimeActionLicenseReinstatement => {
  const fullPath = path.join(getAnytimeActionsLicenseReinstatementsDirectory(), `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionLicenseReinstatementMd(fileContents, fileNameWithoutMd);
};
