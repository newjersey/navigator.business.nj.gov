import { AnytimeActionLink } from "@/lib/types/types";
import { convertAnytimeActionLinkMd } from "@/lib/utils/markdownReader";
import fs from "fs";
import path from "path";

const anytimeActionsLinksDir = path.join(process.cwd(), "..", "content", "src", "anytime-action-links");

export const loadAllAnytimeActionLinks = (): AnytimeActionLink[] => {
  const fileNames = fs.readdirSync(anytimeActionsLinksDir);

  return fileNames.map((fileName) => {
    return loadAnytimeActionLinksByFileName(fileName);
  });
};

const loadAnytimeActionLinksByFileName = (fileName: string): AnytimeActionLink => {
  const fullPath = path.join(anytimeActionsLinksDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertAnytimeActionLinkMd(fileContents, fileNameWithoutMd);
};
