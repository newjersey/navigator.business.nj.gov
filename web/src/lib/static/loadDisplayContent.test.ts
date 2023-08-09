import fs from "fs";
import { loadRoadmapSideBarDisplayContent, loadTasksDisplayContent } from "./loadDisplayContent";

jest.mock("fs");
jest.mock("process", () => ({
  cwd: (): string => "/test",
}));

describe("loadDisplayContent", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
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
