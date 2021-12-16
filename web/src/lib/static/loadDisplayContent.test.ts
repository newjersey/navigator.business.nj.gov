import { getPathSeparator } from "@/test/helpers";
import { LegalStructures } from "@businessnjgovnavigator/shared";
import fs from "fs";
import { loadProfileDisplayContent, loadRoadmapDisplayContent } from "./loadDisplayContent";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadDisplayContent", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadOnboardingDisplayContent", () => {
    it("returns onboarding content from markdown", () => {
      const onboardingDisplayMd =
        "---\n" +
        'placeholder: "Fill me in"\n' +
        "---\n" +
        "\n" +
        "### I am a header\n" +
        "\n" +
        "I am a description";

      mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

      expect(loadProfileDisplayContent().municipality).toEqual({
        placeholder: "Fill me in",
        contentMd: "\n### I am a header\n\nI am a description",
      });
    });

    it("loads content for each legal structure option", () => {
      mockedFs.readFileSync.mockReturnValue("### I am a header\n\nI am a description");

      expect(loadProfileDisplayContent().legalStructure.optionContent["c-corporation"]).toEqual(
        "### I am a header\n\nI am a description"
      );
      const allFilePaths = mockedFs.readFileSync.mock.calls.map(
        (args) => (args[0] as string).split("onboarding")[1]
      );
      const pathSeparator = getPathSeparator();
      for (const legalStructure of LegalStructures) {
        expect(allFilePaths).toContain(`${pathSeparator}legal-structure-${legalStructure.id}.md`);
      }
    });
  });

  describe("loadRoadmapDisplayContent", () => {
    it("returns roadmap content from markdown", () => {
      const roadmapContentMd = "### I am a header\n\nI am a description";

      mockedFs.readFileSync.mockReturnValue(roadmapContentMd);
      expect(loadRoadmapDisplayContent().contentMd).toEqual("### I am a header\n\nI am a description");
    });
  });
});
