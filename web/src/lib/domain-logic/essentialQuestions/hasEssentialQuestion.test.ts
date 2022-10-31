import fs from "fs";
import path from "path";
import { EssentialQuestions } from "./hasEssentialQuestion";

describe("hasEssentialQuestion", () => {
  it("has every essential question in the list", () => {
    const allEssentialQuestions = EssentialQuestions.map((it) => {
      return it.name;
    });

    const currentFile = path.parse(__filename).name;
    const lengthOfTestEnding = ".test".length;
    const hasEssentialQuestionFile = currentFile.slice(0, -lengthOfTestEnding);

    const lengthOfTsEnding = ".ts".length;

    const fileNamesInCurrentDir = fs.readdirSync(__dirname);
    const allQuestionFunctionsFromFiles = fileNamesInCurrentDir
      .filter((fileName) => {
        return !fileName.endsWith(".test.ts");
      })
      .map((fileName) => {
        return fileName.slice(0, -lengthOfTsEnding);
      })
      .filter((fileName) => {
        return !(fileName === hasEssentialQuestionFile);
      });

    for (const essentialQuestionFile of allQuestionFunctionsFromFiles) {
      expect(allEssentialQuestions).toContain(essentialQuestionFile);
    }
  });
});
