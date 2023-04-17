import { Filing } from "@/lib/types/types";
import fs from "fs";
import path from "path";
import { convertFilingMd } from "../utils/markdownReader";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

export type PathParams<P> = { params: P; locale?: string };
export type FilingUrlSlugParam = {
  filingUrlSlug: string;
};

const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");

export const loadAllFilings = (): Filing[] => {
  const fileNames = fs.readdirSync(filingsDir);
  return fileNames.map((fileName) => {
    return loadFilingByFileName(fileName);
  });
};

export const loadAllFilingUrlSlugs = (): PathParams<FilingUrlSlugParam>[] => {
  const fileNames = fs.readdirSync(filingsDir);
  return fileNames.map((fileName) => {
    return {
      params: {
        filingUrlSlug: loadUrlSlugByFilename(fileName, filingsDir),
      },
    };
  });
};

export const loadFilingByUrlSlug = (urlSlug: string): Filing => {
  const matchingFileName = getFileNameByUrlSlug(filingsDir, urlSlug);
  return loadFilingByFileName(matchingFileName);
};

export const loadFilingByFileName = (fileName: string): Filing => {
  const fullPath = path.join(filingsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertFilingMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
