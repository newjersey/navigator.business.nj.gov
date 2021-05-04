import fs from "fs";
import { loadOnboardingDisplayContent, loadRoadmapDisplayContent } from "./loadDisplayContent";
import { ALL_LEGAL_STRUCTURES_ORDERED } from "../../display-content/LegalStructureLookup";

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

      expect(loadOnboardingDisplayContent().municipality).toEqual({
        placeholder: "Fill me in",
        contentMd: "\n### I am a header\n\nI am a description",
      });
    });

    it("loads content for each legal structure option", () => {
      mockedFs.readFileSync.mockReturnValue("### I am a header\n\nI am a description");

      expect(loadOnboardingDisplayContent().legalStructure.optionContent["s-corporation"]).toEqual(
        "### I am a header\n\nI am a description"
      );
      const allFilePaths = mockedFs.readFileSync.mock.calls.map(
        (args) => (args[0] as string).split("onboarding")[1]
      );
      for (const legalStructure of ALL_LEGAL_STRUCTURES_ORDERED) {
        expect(allFilePaths).toContain(`/legal-structure/${legalStructure}.md`);
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
