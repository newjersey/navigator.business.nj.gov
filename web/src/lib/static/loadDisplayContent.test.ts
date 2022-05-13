import { getPathSeparator } from "@/test/helpers";
import { LegalStructures } from "@businessnjgovnavigator/shared/";
import fs from "fs";
import {
  loadDashboardDisplayContent,
  loadRoadmapDisplayContent,
  loadTasksDisplayContent,
  loadUserDisplayContent,
} from "./loadDisplayContent";

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
      mockedFs.existsSync.mockReturnValue(true);
      expect(loadUserDisplayContent().PROFILE.municipality).toEqual({
        placeholder: "Fill me in",
        contentMd: "\n### I am a header\n\nI am a description",
      });
    });

    it("loads content for each legal structure option", () => {
      mockedFs.readFileSync.mockReturnValue("### I am a header\n\nI am a description");

      expect(loadUserDisplayContent().STARTING.legalStructure.optionContent?.["c-corporation"]).toEqual(
        "### I am a header\n\nI am a description"
      );
      const pathSeparator = getPathSeparator();
      const allFilePaths = mockedFs.readFileSync.mock.calls.map(
        (args) => (args[0] as string).split(`onboarding${pathSeparator}starting`)[1]
      );
      for (const legalStructure of LegalStructures) {
        expect(allFilePaths).toContain(`${pathSeparator}legal-structure-${legalStructure.id}.md`);
      }
    });
  });

  describe("loadRoadmapDisplayContent", () => {
    it("returns roadmap content from markdown", () => {
      const roadmapContentMd = "### I am a header\n\nI am a description";

      mockReadDirReturn([]);
      mockedFs.readFileSync.mockReturnValue(roadmapContentMd);
      expect(loadRoadmapDisplayContent().contentMd).toEqual("### I am a header\n\nI am a description");
    });

    it("returns sidebar card content from markdown", () => {
      const welcomeCard =
        "---\n" +
        "id: welcome-id\n" +
        "header: Welcome!\n" +
        "imgPath: /img/congratulations-purple.svg\n" +
        "color: roadmap-purple\n" +
        "shadowColor: roadmap-purple-light\n" +
        "hasCloseButton: false\n" +
        "weight: 1\n" +
        "---\n" +
        "**Welcome!**";

      mockReadDirReturn(["welcome.md"]);
      mockedFs.readFileSync.mockReturnValue(welcomeCard);

      expect(loadRoadmapDisplayContent().sidebarDisplayContent["welcome-id"]).toEqual({
        id: "welcome-id",
        header: "Welcome!",
        imgPath: "/img/congratulations-purple.svg",
        color: "roadmap-purple",
        shadowColor: "roadmap-purple-light",
        hasCloseButton: false,
        weight: 1,
        contentMd: "**Welcome!**",
      });
    });
  });

  describe("loadDashboardDisplayContent", () => {
    it("returns dashboard content from markdown", () => {
      const introTextContent = "### I am a header\n\nI am a description";

      mockedFs.readFileSync.mockReturnValue(introTextContent);
      expect(loadDashboardDisplayContent().introTextMd).toEqual("### I am a header\n\nI am a description");
      expect(loadDashboardDisplayContent().opportunityTextMd).toEqual(
        "### I am a header\n\nI am a description"
      );
    });
  });

  describe("loadTasksDisplayContent", () => {
    it("returns task display content from markdown", () => {
      const introParagraph = "### I am a header\n\nI am a description";

      mockedFs.readFileSync.mockReturnValue(introParagraph);
      expect(loadTasksDisplayContent().formationDisplayContent.introParagraph.contentMd).toEqual(
        "### I am a header\n\nI am a description"
      );
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
