import { PageMetadata } from "@/lib/types/types";
import { convertPageMetadataMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const pageMetadataLinksDir = path.join(process.cwd(), "..", "content", "src", "page-metadata");

export const loadAllPageMetadata = (): PageMetadata[] => {
  const fileNames = fs.readdirSync(pageMetadataLinksDir);

  return fileNames.map((fileName) => {
    return loadPageMetadataByFileName(fileName);
  });
};

const loadPageMetadataByFileName = (fileName: string): PageMetadata => {
  const fullPath = path.join(pageMetadataLinksDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertPageMetadataMd(fileContents, fileNameWithoutMd);
};
