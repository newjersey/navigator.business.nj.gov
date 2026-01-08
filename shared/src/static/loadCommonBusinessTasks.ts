import { AnytimeActionTask } from "@businessnjgovnavigator/shared/types";
import { loadAnytimeActionTasksByFileName } from "@businessnjgovnavigator/shared/static/loadAnytimeActionTasks";

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
