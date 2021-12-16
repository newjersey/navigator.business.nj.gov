/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { findDeadContextualInfo, findDeadLinks, findDeadTasks } from "@/lib/static/admin/findDeadLinks";
import { Options } from "broken-link-checker";
import fs from "fs";

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
      .mockReturnValueOnce(["filing1.md"])
      // @ts-ignore
      .mockReturnValueOnce(["addon1.json", "addon2.json"])
      // @ts-ignore
      .mockReturnValueOnce(["info1.md", "info2.md", "info3", "info4", "dead-info.md"])
      // @ts-ignore
      .mockReturnValueOnce(["display-subfolder", "display1.md", "display2.ts"])
      // @ts-ignore
      .mockReturnValueOnce(["display-subfolder-item1.md", "display-subfolder-item2.ts"]);

    const task1 = "Task 1 contents";
    const task2 = "Task 2 contents with `contextual info|info1` in it";
    const deadTask = "Dead task contents";
    const industry1 = '{"roadmapSteps":[],"modifications":[]}';
    const addOn1 = '{"roadmapSteps":[{"step": 1, "weight": 1, "task": "task1"}],"modifications":[]}';
    const addOn2 =
      '{"roadmapSteps":[],"modifications":[{"step": 1, "taskToReplaceFilename": "something","replaceWithFilename": "task2"}]}';
    const info1 = "Info 1 contents with `contextual info|info2` in it";
    const info2 = "Info 2 contents";
    const info3 = "Info 3 contents";
    const info4 = "Info 4 contents";
    const deadInfo = "dead info contents";
    const display1 = "Display contents with `contextual info|info3` in it";
    const displaySubfolderItem1 = "Display contents with `contextual info|info4` in it";

    mockedFs.readFileSync
      .mockReturnValueOnce(industry1)
      .mockReturnValueOnce(addOn1)
      .mockReturnValueOnce(addOn2)
      .mockReturnValueOnce(task1)
      .mockReturnValueOnce(task2)
      .mockReturnValueOnce(deadTask)
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

  describe("findDeadLinks", () => {
    it("finds dead links on every page", async () => {
      expect(await findDeadLinks()).toEqual({
        "/tasks/task1": ["http://www.example.com"],
        "/tasks/task2": [],
        "/tasks/dead-task": [],
        "/filings/filing1": [],
        "/onboarding?page=1": [],
        "/onboarding?page=2": [],
        "/onboarding?page=3": [],
        "/onboarding?page=4": [],
        "/profile": [],
        "/roadmap": [],
      });
    });
  });
});

jest.mock("broken-link-checker", () => ({
  HtmlUrlChecker: function SpyHtmlUrlChecker(
    options: Options,
    handlers: {
      link?: ((result: any) => void) | undefined;
      end?: (() => void) | undefined;
    }
  ) {
    const enqueue = (pageUrl: any): any => {
      if (!handlers.link || !handlers.end) return;
      if (pageUrl.includes("task1")) {
        handlers.link({
          url: { original: "http://www.example.com" },
          broken: true,
        });
      } else {
        handlers.link({
          url: { original: "" },
          broken: false,
        });
      }
      handlers.end();
    };
    return { enqueue };
  },
}));
