/* eslint-disable @typescript-eslint/ban-ts-comment */

import fs from "fs";
import { findDeadContextualInfo, findDeadTasks } from "@/lib/static/admin/findDeadLinks";

jest.mock("fs");

jest.mock("process", () => ({
  cwd: () => "/test",
}));

describe("findDeadLinks", () => {
  let mockedFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    jest.resetAllMocks();
    mockedFs = fs as jest.Mocked<typeof fs>;
    mockedFs.readdirSync
      // @ts-ignore
      .mockReturnValueOnce(["task1.md", "task2.md", "dead-task.md"])
      // @ts-ignore
      .mockReturnValueOnce(["industry1.json"])
      // @ts-ignore
      .mockReturnValueOnce(["addon1.json", "addon2.json"])
      // @ts-ignore
      .mockReturnValueOnce(["mod1.json", "mod2.json"])
      // @ts-ignore
      .mockReturnValueOnce(["info1.md", "info2.md", "info3", "info4", "dead-info.md"])
      // @ts-ignore
      .mockReturnValueOnce(["display-subfolder", "display1.md", "display2.ts"])
      // @ts-ignore
      .mockReturnValueOnce(["display-subfolder-item1.md", "display-subfolder-item2.ts"]);

    const task1 = "Task 1 contents";
    const task2 = "Task 2 contents with `contextual info|info1` in it";
    const deadTask = "Dead task contents";
    const industry1 = '{"addOns":[],"modifications":[]}';
    const addOn1 = '[{"step": 1, "weight": 1, "task": "task1"}]';
    const addOn2 = "[]";
    const mod1 = '[{"step": 1, "taskToReplaceFilename": "something","replaceWithFilename": "task2"}]';
    const mod2 = "[]";
    const info1 = "Info 1 contents with `contextual info|info2` in it";
    const info2 = "Info 2 contents";
    const info3 = "Info 3 contents";
    const info4 = "Info 4 contents";
    const deadInfo = "dead info contents";
    const display1 = "Display contents with `contextual info|info3` in it";
    const displaySubfolderItem1 = "Display contents with `contextual info|info4` in it";

    mockedFs.readFileSync
      .mockReturnValueOnce(task1)
      .mockReturnValueOnce(task2)
      .mockReturnValueOnce(deadTask)
      .mockReturnValueOnce(industry1)
      .mockReturnValueOnce(addOn1)
      .mockReturnValueOnce(addOn2)
      .mockReturnValueOnce(mod1)
      .mockReturnValueOnce(mod2)
      .mockReturnValueOnce(info1)
      .mockReturnValueOnce(info2)
      .mockReturnValueOnce(info3)
      .mockReturnValueOnce(info4)
      .mockReturnValueOnce(deadInfo)
      .mockReturnValueOnce(display1)
      .mockReturnValueOnce(displaySubfolderItem1);
  });

  describe("findDeadTasks", () => {
    it("finds tasks that are not referenced in any add-ons or modifications", async () => {
      expect(await findDeadTasks()).toEqual(["dead-task.md"]);
    });
  });

  describe("findDeadContextualInfo", () => {
    it("finds contextual infos that are not referenced in any tasks or other infos", async () => {
      expect(await findDeadContextualInfo()).toEqual(["dead-info.md"]);
    });
  });
});
