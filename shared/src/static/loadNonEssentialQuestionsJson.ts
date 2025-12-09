import fs from "fs";
import path from "path";
import { NonEssentialQuestion } from "../types";

const NonEssentialQuestionsJsonPathTest = path.join(
  process.cwd(),
  "..", // will likely need to be modified for our whole sns thing
  "content",
  "src",
  "roadmaps",
  "nonEssentialQuestions.json",
);

export const loadNonEssentialQuestionsJsonForTest = (): NonEssentialQuestion[] => {
  return JSON.parse(fs.readFileSync(NonEssentialQuestionsJsonPathTest, "utf8"))
    .nonEssentialQuestionsArray;
};
