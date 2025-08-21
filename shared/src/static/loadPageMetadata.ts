import fs from "fs";
import path from "path";
import { convertPageMetadataMd } from "../markdownReader";
import { PageMetadata } from "../types/types";

const pageMetadataLinksDirectory = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "page-metadata",
);

export const loadAllPageMetadata = (): PageMetadata[] => {
  const fileNames = fs.readdirSync(pageMetadataLinksDirectory);

  return fileNames.map((fileName) => {
    return loadPageMetadataByFileName(fileName);
  });
};

const loadPageMetadataByFileName = (fileName: string): PageMetadata => {
  const fullPath = path.join(pageMetadataLinksDirectory, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const fileNameWithoutMd = fileName.split(".json")[0];
  return convertPageMetadataMd(fileContents, fileNameWithoutMd);
};
