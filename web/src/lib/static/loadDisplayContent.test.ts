import { mockReadDirReturn } from "@/lib/static/mockHelpers";
import fs from "fs";
import { loadRoadmapSideBarDisplayContent, loadTasksDisplayContent } from "./loadDisplayContent";

vi.mock("fs");
vi.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadDisplayContent", () => {
  let mockedFs: vi.Mocked<typeof fs>;

  beforeEach(() => {
    vi.resetAllMocks();
    mockedFs = fs as vi.Mocked<typeof fs>;
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

      mockReadDirReturn({ value: ["welcome.md"], mockedFs });
      mockedFs.readFileSync.mockReturnValue(welcomeCard);

      expect(loadRoadmapSideBarDisplayContent().sidebarDisplayContent["welcome-id"]).toEqual({
        id: "welcome-id",
        header: "Welcome!",
        imgPath: "/img/congratulations-purple.svg",
        color: "accent-cooler",
        headerBackgroundColor: "accent-cooler-lightest",
        hasCloseButton: false,
        weight: 1,
        contentMd: "**Welcome!**",
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
});
