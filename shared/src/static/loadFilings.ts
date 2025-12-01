import fs from "fs";
import path from "path";
import { convertFilingMd } from "../markdownReader";
import { Filing } from "../types/types";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

type PathParameters<P> = { params: P; locale?: string };
export type FilingUrlSlugParameter = {
  filingUrlSlug: string;
};

const filingsDirectory = path.join(process.cwd(), "..", "content", "src", "filings");

export const loadAllFilings = (): Filing[] => {
  const fileNames = fs.readdirSync(filingsDirectory);
  return fileNames.map((fileName) => {
    return loadFilingByFileName(fileName);
  });
};

export const loadAllFilingUrlSlugs = (): PathParameters<FilingUrlSlugParameter>[] => {
  const fileNames = fs.readdirSync(filingsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        filingUrlSlug: loadUrlSlugByFilename(fileName, filingsDirectory),
      },
    };
  });
};

export const loadFilingByUrlSlug = (urlSlug: string): Filing => {
  const matchingFileName = getFileNameByUrlSlug(filingsDirectory, urlSlug);
  return loadFilingByFileName(matchingFileName);
};

export const loadFilingByFileName = (fileName: string): Filing => {
  const fullPath = path.join(filingsDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".md")[0];
  const filingContent = convertFilingMd(fileContents, fileNameWithoutMd);
  return filingContent;
};
