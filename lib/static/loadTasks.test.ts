import fs from "fs";
import { generateTask } from "../../test/factories";
import { getAllTaskIds, getTaskById, getTasksLookup } from "./loadTasks";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("loadTasks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    mockedFs = fs as jest.Mocked<typeof fs>;
  });

  describe("getAllTaskIds", () => {
    it("returns a list of task ids from directory structure", () => {
      mockReadDirReturn(["task1.json", "task2.json"]);

      const allTaskIds = getAllTaskIds();
      expect(allTaskIds).toHaveLength(2);
      expect(allTaskIds).toEqual(
        expect.arrayContaining([{ params: { taskId: "task1" } }, { params: { taskId: "task2" } }])
      );
    });
  });

  describe("getTaskById", () => {
    it("returns task entity", () => {
      const task1 = generateTask({ id: "task1" });

      mockedFs.readFileSync.mockReturnValueOnce(JSON.stringify(task1));

      expect(getTaskById("task1")).toEqual(task1);
    });
  });

  describe("getTasksLookup", () => {
    it("returns a map of all task ids to task entity", () => {
      const task1 = generateTask({ id: "task1" });
      const task2 = generateTask({ id: "task1" });
      const task3 = generateTask({ id: "task1" });

      mockReadDirReturn(["task1.json", "task2.json", "task3.json"]);
      mockedFs.readFileSync
        .mockReturnValueOnce(JSON.stringify(task1))
        .mockReturnValueOnce(JSON.stringify(task2))
        .mockReturnValueOnce(JSON.stringify(task3));

      expect(getTasksLookup()).toEqual({
        task1: task1,
        task2: task2,
        task3: task3,
      });
    });
  });

  const mockReadDirReturn = (value: string[]) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mockedFs.readdirSync.mockReturnValue(value);
  };
});
