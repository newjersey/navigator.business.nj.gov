import { AnytimeActionTask } from "../types";
import { loadAnytimeActionTasksByFileName } from "./loadAnytimeActionTasks";

export const loadCommonBusinessTasks = (): AnytimeActionTask[] => {
  const fileNames = [
    "registry-update-brc-amendment.md",
    "tax-clearance-certificate.md",
    "state-contracting.md",
  ];

  return fileNames.map((fileName) => {
    return loadAnytimeActionTasksByFileName(fileName);
  });
};
