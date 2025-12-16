import fs from "fs";
import path from "path";
import { NonEssentialQuestion } from "../types";

const NonEssentialQuestionsJsonPathTest = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "roadmaps",
  "nonEssentialQuestions.json",
);

export const loadNonEssentialQuestionsJsonForTest = (): NonEssentialQuestion[] => {
  return JSON.parse(fs.readFileSync(NonEssentialQuestionsJsonPathTest, "utf8"))
    .nonEssentialQuestionsArray;
};
