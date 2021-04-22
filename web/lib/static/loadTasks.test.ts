import fs from "fs";
import { loadAllTaskIds, loadTaskById } from "./loadTasks";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("loadAllTaskIds", () => {
    it("returns a list of task ids from directory structure", () => {
      mockReadDirReturn(["task1.md", "task2.md"]);
      const allTaskIds = loadAllTaskIds();
      expect(allTaskIds).toHaveLength(2);
      expect(allTaskIds).toEqual(
        expect.arrayContaining([{ params: { taskId: "task1" } }, { params: { taskId: "task2" } }])
      );
    });
  });

  describe("getTaskById", () => {
    it("returns task entity from markdown", async () => {
      const taskMd =
        "---\n" +
        'id: "some-id"\n' +
        'name: "Some Task Name"\n' +
        'destinationText: ""\n' +
        'callToActionLink: "www.example.com"\n' +
        'callToActionText: ""\n' +
        "---\n" +
        "\n" +
        "# I am a header\n" +
        "\n" +
        "I am a text content";

      mockedFs.readFileSync.mockReturnValueOnce(taskMd);

      expect(await loadTaskById("some-id")).toEqual({
        id: "some-id",
        name: "Some Task Name",
        destinationText: "",
        callToActionLink: "www.example.com",
        callToActionText: "",
        contentMd: "\n# I am a header\n\nI am a text content",
      });
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
