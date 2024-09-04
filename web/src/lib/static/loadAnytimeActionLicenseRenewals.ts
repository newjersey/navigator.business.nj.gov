import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { AnytimeActionLicenseReinstatement, AnytimeActionLicenseRenewal } from "@/lib/types/types";
import { convertAnytimeActionLicenseReinstatementMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
const anytimeActionsLicenseRenewalsDir = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-license-renewals"
);

export type AnytimeActionLicenseRenewalUrlSlugParam = {
  anytimeActionLicenseRenewalUrlSlug: string;
};

export const loadAllAnytimeActionLicenseRenewals = (): AnytimeActionLicenseRenewal[] => {
  const fileNames = fs.readdirSync(anytimeActionsLicenseRenewalsDir);

  return fileNames.map((fileName) => {
    return loadAnytimeActionLicenseRenewalsByFileName(fileName);
  });
};

export const loadAllAnytimeActionLicenseRenewalsUrlSlugs =
  (): PathParams<AnytimeActionLicenseRenewalUrlSlugParam>[] => {
    const fileNames = fs.readdirSync(anytimeActionsLicenseRenewalsDir);
    return fileNames.map((fileName) => {
      return {
        params: {
          anytimeActionLicenseRenewalUrlSlug: loadUrlSlugByFilename(
            fileName,
            anytimeActionsLicenseRenewalsDir
          ),
        },
      };
    });
  };

export const loadAnytimeActionLicenseRenewalsByUrlSlug = (urlSlug: string): AnytimeActionLicenseRenewal => {
  const matchingFileName = getFileNameByUrlSlug(anytimeActionsLicenseRenewalsDir, urlSlug);
  return loadAnytimeActionLicenseRenewalsByFileName(matchingFileName);
};

const loadAnytimeActionLicenseRenewalsByFileName = (fileName: string): AnytimeActionLicenseReinstatement => {
  const fullPath = path.join(anytimeActionsLicenseRenewalsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionLicenseReinstatementMd(fileContents, fileNameWithoutMd);
};
