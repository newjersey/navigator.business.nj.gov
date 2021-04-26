import fs from "fs";
import { loadOnboardingDisplayContent, loadRoadmapDisplayContent } from "./loadDisplayContent";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadDisplayContent", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadOnboardingDisplayContent", () => {
    it("returns onboarding content from markdown", async () => {
      const onboardingDisplayMd =
        "---\n" +
        'placeholder: "Fill me in"\n' +
        "---\n" +
        "\n" +
        "### I am a header\n" +
        "\n" +
        "I am a description";

      mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

      expect((await loadOnboardingDisplayContent()).municipality).toEqual({
        placeholder: "Fill me in",
        contentMd: "\n### I am a header\n\nI am a description",
      });
    });

    it("returns onboarding content with no placeholder from markdown", async () => {
      const onboardingDisplayMd =
        "---\n" + "---\n" + "\n" + "### I am a header\n" + "\n" + "I am a description";

      mockedFs.readFileSync.mockReturnValue(onboardingDisplayMd);

      expect((await loadOnboardingDisplayContent()).municipality).toEqual({
        placeholder: undefined,
        contentMd: "\n### I am a header\n\nI am a description",
      });
    });
  });

  describe("loadRoadmapDisplayContent", () => {
    it("returns roadmap content from markdown", async () => {
      const roadmapContentMd = "### I am a header\n" + "\n" + "I am a description";

      mockedFs.readFileSync.mockReturnValue(roadmapContentMd);
      expect((await loadRoadmapDisplayContent()).contentMd).toEqual(
        "### I am a header\n\nI am a description"
      );
    });
  });
});
