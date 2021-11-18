import fs from "fs";
import path from "path";
import { convertTaskMd } from "@/lib/utils/markdownReader";

export const loadUrlSlugByFilename = (fileName: string, filingsDir: string): string => {
  const fullPath = path.join(filingsDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const content = convertTaskMd(fileContents);
  return content.urlSlug;
};

export const getFileNameByUrlSlug = (currPath: string, urlSlug: string): string => {
  const fileNames = fs.readdirSync(currPath);
  const matchingFileName = fileNames.find((fileName) => {
    return urlSlug === loadUrlSlugByFilename(fileName, currPath);
  });
  if (!matchingFileName) {
    throw `Task with urlSlug ${urlSlug} not found`;
  }

  return matchingFileName;
};
