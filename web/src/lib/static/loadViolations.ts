import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "@/lib/static/helpers";
import { ViolationNotice } from "@/lib/types/types";
import { convertViolationMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

type PathParams<P> = { params: P; locale?: string };
export type ViolationUrlSlugParam = {
  violationUrlSlug: string;
};

const violationsDir = path.join(process.cwd(), "..", "content", "src", "violations");

export const loadAllViolations = (): ViolationNotice[] => {
  const fileNames = fs.readdirSync(violationsDir);
  return fileNames.map((fileName) => {
    const fullPath = path.join(violationsDir, `${fileName}`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return convertViolationMd(fileContents);
  });
};

export const loadAllViolationUrlSlugs = (): PathParams<ViolationUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(violationsDir);
  const a = fileNames.map((fileName) => {
    return {
      params: {
        violationUrlSlug: loadUrlSlugByFilename(fileName, violationsDir),
      },
    };
  });
  console.log(a);
  return a;
};

export const loadViolationByUrlSlug = (urlSlug: string): ViolationNotice => {
  const matchingFileName = getFileNameByUrlSlug(violationsDir, urlSlug);
  return loadViolationByFileName(matchingFileName);
};

export const loadViolationByFileName = (fileName: string): ViolationNotice => {
  const fullPath = path.join(violationsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  return convertViolationMd(fileContents);
};
