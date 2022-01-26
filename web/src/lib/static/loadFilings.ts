import { Filing } from "@/lib/types/types";
import { convertTaskMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";
import { getFileNameByUrlSlug, loadUrlSlugByFilename } from "./helpers";

export type PathParams<P> = { params: P; locale?: string };
export type FilingUrlSlugParam = {
  filingUrlSlug: string;
};

const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");

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

  const filingContent = convertTaskMd(fileContents);
  const fileNameWithoutMd = fileName.split(".md")[0];

  return {
    ...filingContent,
    filename: fileNameWithoutMd,
  } as Filing;
};
