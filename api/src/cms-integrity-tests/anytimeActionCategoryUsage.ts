import matter from "gray-matter";
import fs from "node:fs";
import path from "node:path";

const anytimeActionsTaskDirTest = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "anytime-action-tasks",
  "adjust-rental-rates.md",
);

export const checkAnytimeActionCategoryUsage = (): void => {
  const mdFile = fs.readFileSync(anytimeActionsTaskDirTest);

  const matterResult = matter(mdFile);
  console.log("triggers", matterResult);
};
