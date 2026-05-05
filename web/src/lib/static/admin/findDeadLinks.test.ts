import { findDeadContentLinks, findDeadTasks } from "@/lib/static/admin/findDeadLinks";
import fs from "fs";

jest.mock("fs");
jest.mock("process", () => ({ cwd: (): string => "/test" }));
jest.mock(
  "@/lib/cms/CollectionMap.json",
  () => ({
    "test-task": { Tasks: "tasks" },
    task1: { Tasks: "tasks" },
    task2: { Tasks: "tasks" },
    "dead-task": { Tasks: "tasks" },
    filing1: { Filings: "filings" },
    fundings: { Fundings: "funding-opportunities" },
    certifications: { Certifications: "certification-opportunities" },
    "test-mapping": { Mappings: "mappings" },
  }),
  { virtual: true },
);

const mockReaddirSync = fs.readdirSync as jest.Mock;
const mockReadFileSync = fs.readFileSync as jest.Mock;
const mockExistsSync = fs.existsSync as jest.Mock;

describe("findDeadTasks", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    mockReaddirSync
      .mockReturnValueOnce(["task1.md", "task2.md", "dead-task.md"])
      .mockReturnValueOnce(["industry1.json"])
      .mockReturnValueOnce(["filing1.md"])
      .mockReturnValueOnce(["addon1.json", "addon2.json"])
      .mockReturnValueOnce(["info1.md", "info2.md", "info3", "info4", "dead-info.md"])
      .mockReturnValueOnce(["display-subfolder", "display1.md", "display2.ts"])
      .mockReturnValueOnce(["display-subfolder-item1.md", "display-subfolder-item2.ts"])
      .mockReturnValueOnce(["config.json"])
      .mockReturnValueOnce(["fundings.md"])
      .mockReturnValueOnce(["certifications.md"])
      .mockReturnValueOnce(["licenses.md"])
      .mockReturnValueOnce(["licenseTasks.md"])
      .mockReturnValueOnce(["anytimeActionTasks.md"])
      .mockReturnValueOnce(["anytimeActionLicenseReinstatements.md"]);

    const task1 = "Task 1 contents";
    const task2 = "Task 2 contents with `contextual info|info1` in it";
    const deadTask = "Dead task contents";
    const industry1 = '{"roadmapSteps":[],"modifications":[]}';
    const addOn1 =
      '{"roadmapSteps":[{"step": 1, "weight": 1, "task": "task1"}],"modifications":[]}';
    const addOn2 =
      '{"roadmapSteps":[],"modifications":[{"step": 1, "taskToReplaceFilename": "something","replaceWithFilename": "task2"}]}';
    const info1 = "Info 1 contents with `contextual info|info2` in it";
    const info2 = "Info 2 contents";
    const info3 = "Info 3 contents";
    const info4 = "Info 4 contents";
    const deadInfo = "dead info contents";
    const display1 = "Display contents with `contextual info|info3` in it";
    const displaySubfolderItem1 = "Display contents with `contextual info|info4` in it";
    const config = '{"testheader":"test"}';
    const fundings = "Funding Content";
    const taskDependencyJson =
      '{"dependencies": [{"task": "register-for-ein","taskDependencies": []}]}';
    const certifications = "Certification Content";
    const licenses = "License Content";
    const licenseTasks = "LicenseTask Content";
    const anytimeActionTasks = "AnytimeActionTask Content";
    const anytimeActionLicenseReinstatements = "AnytimeActionLicenseReinstatement Content";

    mockReadFileSync
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
      .mockReturnValueOnce(displaySubfolderItem1)
      .mockReturnValueOnce(config)
      .mockReturnValueOnce(fundings)
      .mockReturnValueOnce(taskDependencyJson)
      .mockReturnValueOnce(certifications)
      .mockReturnValueOnce(licenses)
      .mockReturnValueOnce(licenseTasks)
      .mockReturnValueOnce(anytimeActionTasks)
      .mockReturnValueOnce(anytimeActionLicenseReinstatements);
  });

  it("finds tasks that are not referenced in any add-ons or modifications", async () => {
    expect(await findDeadTasks()).toEqual(["dead-task.md"]);
  });
});

const setupContentScanMocks = (files: { name: string; content: string }[]): void => {
  mockExistsSync.mockImplementation((dirPath: unknown) => {
    return String(dirPath).includes("roadmaps/tasks");
  });
  mockReaddirSync.mockReturnValue(files.map((f) => f.name));
  mockReadFileSync.mockImplementation((filePath: unknown) => {
    const name = String(filePath).split("/").pop() || "";
    const file = files.find((f) => f.name === name);
    return file?.content || "";
  });
};

describe("findDeadContentLinks", () => {
  let consoleLogSpy: jest.SpyInstance<void, Parameters<typeof console.log>>;

  beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it("extracts URLs from markdown files and reports dead ones", async () => {
    const mdContent = `---
name: Test Task
callToActionLink: https://dead-link.example.com/page
---

Visit [Example](https://alive-link.example.com) for more info.
Also check https://another-dead.example.com/resource for details.
`;

    setupContentScanMocks([{ name: "test-task.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "https://alive-link.example.com") {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    const result = results[0];
    expect(result.slug).toBe("test-task");
    expect(result.collection).toBe("Tasks");
    expect(result.cmsEditUrl).toBe("/mgmt/cms#/collections/tasks/entries/test-task");
    expect(result.deadUrls).toHaveLength(2);
    expect(result.deadUrls.map((u) => u.url)).toEqual(
      expect.arrayContaining([
        "https://dead-link.example.com/page",
        "https://another-dead.example.com/resource",
      ]),
    );
    expect(result.deadUrls.find((u) => u.url === "https://dead-link.example.com/page")?.field).toBe(
      "callToActionLink",
    );
    expect(
      result.deadUrls.find((u) => u.url === "https://another-dead.example.com/resource")?.field,
    ).toBe("body");
  });

  it("skips template URLs and known false positives", async () => {
    const mdContent = `---
name: Test
---

Visit $municipalityWebsite for local info.
Also https://www.facebook.com/BusinessNJgov is fine.
But https://real-dead.example.com is broken.
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockImplementation(() => {
      return Promise.resolve({ ok: false, status: 404 });
    });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    expect(results[0].deadUrls).toHaveLength(1);
    expect(results[0].deadUrls[0].url).toBe("https://real-dead.example.com");
  });

  it("retries with GET when HEAD returns 403 or 405", async () => {
    const mdContent = `---
name: Test
callToActionLink: https://head-blocked.example.com
---
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    let callCount = 0;
    (global.fetch as jest.Mock).mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ ok: false, status: 403 });
      }
      return Promise.resolve({ ok: true, status: 200 });
    });

    const results = await findDeadContentLinks();
    expect(results).toHaveLength(0);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it("calls onProgress callback during URL checking", async () => {
    const mdContent = `---
name: Test
callToActionLink: https://example.com/1
---

Also https://example.com/2 here.
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, status: 200 });

    const progressCalls: [number, number][] = [];
    await findDeadContentLinks((checked, total) => {
      progressCalls.push([checked, total]);
    });

    expect(progressCalls.length).toBeGreaterThan(0);
    const lastCall = progressCalls[progressCalls.length - 1];
    expect(lastCall[0]).toBe(lastCall[1]);
  });

  it("extracts URLs from JSON files", async () => {
    const jsonContent = JSON.stringify({
      name: "Test Mapping",
      link: "https://dead-json-link.example.com",
      nested: {
        url: "Check https://alive-json.example.com for info",
      },
    });

    setupContentScanMocks([{ name: "test-mapping.json", content: jsonContent }]);

    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === "https://alive-json.example.com") {
        return Promise.resolve({ ok: true, status: 200 });
      }
      return Promise.resolve({ ok: false, status: 404 });
    });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    expect(results[0].deadUrls).toHaveLength(1);
    expect(results[0].deadUrls[0].url).toBe("https://dead-json-link.example.com");
    expect(results[0].deadUrls[0].field).toBe("link");
  });

  it("handles parentheses inside markdown link URLs", async () => {
    const mdContent = `---
name: Parens Test
---

Download the [MW-562 form](https://www.nj.gov/labor/wageandhour/assets/PDFs/MW-562%20(6-23).pdf) here.
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    expect(results[0].deadUrls[0].url).toBe(
      "https://www.nj.gov/labor/wageandhour/assets/PDFs/MW-562%20(6-23).pdf",
    );
  });

  it("handles markdown links where link text is a URL", async () => {
    const mdContent = `---
name: URL as link text
---

An eligibility map can be found here:
[https://eligibility.example.com/welcome](https://eligibility.example.com/welcome)
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    expect(results[0].deadUrls).toHaveLength(1);
    expect(results[0].deadUrls[0].url).toBe("https://eligibility.example.com/welcome");
  });

  it("includes context snippets around dead URLs", async () => {
    const mdContent = `---
name: Context Test
---

For more information, visit [the resource page](https://dead-context.example.com/info) to learn more about this topic.
`;

    setupContentScanMocks([{ name: "task1.md", content: mdContent }]);

    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });

    const results = await findDeadContentLinks();

    expect(results.length).toBe(1);
    expect(results[0].deadUrls[0].context).toContain("the resource page");
    expect(results[0].deadUrls[0].context).toContain("dead-context.example.com");
  });
});
