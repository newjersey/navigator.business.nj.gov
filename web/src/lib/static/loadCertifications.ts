import { PathParams } from "@/lib/static/loadFilings";
import { Certification } from "@/lib/types/types";
import { convertCertificationMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug } from "./helpers";

const certificationDir = path.join(process.cwd(), "..", "content", "src", "certifications");

export type CertificationUrlSlugParam = {
  certificationUrlSlug: string;
};

export const loadAllCertifications = (): Certification[] => {
  const fileNames = fs.readdirSync(certificationDir);
  return fileNames.map((fileName) => {
    return loadCertificationByFileName(fileName);
  });
};

export const loadAllCertificationUrlSlugs = (): PathParams<CertificationUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(certificationDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        certificationUrlSlug: loadCertificationByFileName(fileName).urlSlug,
      },
    };
  });
};

export const loadCertificationByUrlSlug = (urlSlug: string): Certification => {
  const matchingFileName = getFileNameByUrlSlug(certificationDir, urlSlug);
  return loadCertificationByFileName(matchingFileName);
};

export const loadCertificationByFileName = (fileName: string): Certification => {
  const fullPath = path.join(certificationDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertCertificationMd(fileContents, fileNameWithoutMd);
};
