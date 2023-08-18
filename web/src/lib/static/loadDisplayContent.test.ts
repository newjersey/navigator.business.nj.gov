import fs from "fs";
import { loadRoadmapSideBarDisplayContent, loadTasksDisplayContent } from "./loadDisplayContent";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test"
}));

describe("loadDisplayContent", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadRoadmapSideBarDisplayContent", () => {
    it("returns sidebar card content from markdown", () => {
      const welcomeCard =
        "---\n" +
        "id: welcome-id\n" +
        "header: Welcome!\n" +
        "imgPath: /img/congratulations-purple.svg\n" +
        "color: accent-cooler\n" +
        "headerBackgroundColor: accent-cooler-lightest\n" +
        "hasCloseButton: false\n" +
        "weight: 1\n" +
        "---\n" +
        "**Welcome!**";

      mockReadDirReturn(["welcome.md"]);
      mockedFs.readFileSync.mockReturnValue(welcomeCard);

      expect(loadRoadmapSideBarDisplayContent().sidebarDisplayContent["welcome-id"]).toEqual({
        id: "welcome-id",
        header: "Welcome!",
        imgPath: "/img/congratulations-purple.svg",
        color: "accent-cooler",
        headerBackgroundColor: "accent-cooler-lightest",
        hasCloseButton: false,
        weight: 1,
        contentMd: "**Welcome!**"
      });
    });
  });

  describe("loadTasksDisplayContent", () => {
    it("returns formationDbaContent from markdown", () => {
      const introParagraph = "### I am a header\n\nI am a description";
      mockedFs.readFileSync.mockReturnValue(introParagraph);
      expect(loadTasksDisplayContent().formationDbaContent.Authorize.contentMd).toEqual(
        "### I am a header\n\nI am a description"
      );
    });
  });

  const mockReadDirReturn = (value: string[]): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
