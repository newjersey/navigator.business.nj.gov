import fs from "fs";
import path from "path";
import { convertCertificationMd } from "@businessnjgovnavigator/shared/markdownReader";
import { Certification } from "@businessnjgovnavigator/shared/types/types";
import { getFileNameByUrlSlug } from "@businessnjgovnavigator/shared/static/helpers";

const certificationDirectory = path.join(process.cwd(), "..", "content", "src", "certifications");
const archivedCertificationDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "archived-certifications",
);

type PathParameters<P> = { params: P; locale?: string };
export type CertificationUrlSlugParameter = {
  certificationUrlSlug: string;
};

export const loadAllArchivedCertifications = (): Certification[] => {
  const fileNames = fs.readdirSync(archivedCertificationDirectory);
  return fileNames.map((fileName) => {
    const fullPath = path.join(archivedCertificationDirectory, `${fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const fileNameWithoutMd = fileName.split(".md")[0];
    return convertCertificationMd(fileContents, fileNameWithoutMd);
  });
};

export const loadAllCertifications = (): Certification[] => {
  const fileNames = fs.readdirSync(certificationDirectory);
  return fileNames.map((fileName) => {
    return loadCertificationByFileName(fileName);
  });
};

export const loadAllCertificationUrlSlugs = (): PathParameters<CertificationUrlSlugParameter>[] => {
  const fileNames = fs.readdirSync(certificationDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        certificationUrlSlug: loadCertificationByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadCertificationByUrlSlug = (urlSlug: string): Certification => {
  const matchingFileName = getFileNameByUrlSlug(certificationDirectory, urlSlug);
  return loadCertificationByFileName(matchingFileName);
};

export const loadCertificationByFileName = (fileName: string): Certification => {
  const fullPath = path.join(certificationDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertCertificationMd(fileContents, fileNameWithoutMd);
};
