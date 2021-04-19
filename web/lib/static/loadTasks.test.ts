import fs from "fs";
import { loadAllTaskIds } from "./loadTasks";

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

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
