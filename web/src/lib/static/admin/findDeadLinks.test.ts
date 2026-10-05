import { findDeadContentLinks, findDeadTasks, FoundUrl } from "@/lib/static/admin/findDeadLinks";
import fs from "fs";

jest.mock("fs");
jest.mock("process", () => ({ cwd: (): string => "/test" }));
jest.mock("@/lib/cms/CollectionMap.json", () => ({
  "test-task": { Tasks: "tasks" },
  task1: { Tasks: "tasks" },
  task2: { Tasks: "tasks" },
  "dead-task": { Tasks: "tasks" },
  filing1: { Filings: "filings" },
  fundings: { Fundings: "funding-opportunities" },
  certifications: { Certifications: "certification-opportunities" },
  "test-mapping": { Mappings: "mappings" },
}));

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

  const scanBodyUrls = async (urls: string[]): Promise<FoundUrl[]> => {
    setupContentScanMocks([
      { name: "task1.md", content: `---\nname: T\n---\n\n${urls.join("\n\n")}` },
    ]);
    const results = await findDeadContentLinks();
    return results.flatMap((r) => r.deadUrls);
  };

  const connectionError = (code: string): TypeError =>
    new TypeError("fetch failed", { cause: { code } });

  it("reports the underlying connection error code", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(connectionError("ECONNREFUSED"));

    const [deadUrl] = await scanBodyUrls(["https://refused.example.com"]);

    expect(deadUrl.statusText).toBe("Connection Failed (ECONNREFUSED)");
    expect(deadUrl.category).toBe("inconclusive");
  });

  it("categorizes a host that does not resolve as dead", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(connectionError("ENOTFOUND"));

    const [deadUrl] = await scanBodyUrls(["https://gone.example.com"]);

    expect(deadUrl.statusText).toBe("Connection Failed (ENOTFOUND)");
    expect(deadUrl.category).toBe("dead");
  });

  it("reports timeouts as inconclusive", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(
      Object.assign(new Error("aborted"), { name: "AbortError" }),
    );

    const [deadUrl] = await scanBodyUrls(["https://slow.example.com"]);

    expect(deadUrl.statusText).toBe("Timed Out");
    expect(deadUrl.category).toBe("inconclusive");
  });

  it("categorizes failures by HTTP status", async () => {
    const statusByUrl: Record<string, number> = {
      "https://a.example.com/404": 404,
      "https://b.example.com/410": 410,
      "https://c.example.com/403": 403,
      "https://d.example.com/401": 401,
      "https://e.example.com/503": 503,
    };
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve({ ok: false, status: statusByUrl[url] }),
    );

    const deadUrls = await scanBodyUrls(Object.keys(statusByUrl));
    const categoryByUrl = Object.fromEntries(deadUrls.map((u) => [u.url, u.category]));

    expect(categoryByUrl).toEqual({
      "https://a.example.com/404": "dead",
      "https://b.example.com/410": "dead",
      "https://c.example.com/403": "inconclusive",
      "https://d.example.com/401": "inconclusive",
      "https://e.example.com/503": "serverError",
    });
  });

  const redirectTo = (location: string, status = 301): object => ({
    ok: false,
    status,
    headers: { get: (name: string): string | null => (name === "location" ? location : null) },
  });

  it("follows redirects and reports where the chain ended", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(
        url === "https://old.example.com/page"
          ? redirectTo("https://new.example.com/page")
          : { ok: false, status: 404 },
      ),
    );

    const [deadUrl] = await scanBodyUrls(["https://old.example.com/page"]);

    expect(deadUrl.statusCode).toBe(301);
    expect(deadUrl.statusText).toBe(
      "Moved Permanently → 404 Not Found (https://new.example.com/page)",
    );
    expect(deadUrl.category).toBe("dead");
  });

  it("resolves relative redirect locations against the current URL", async () => {
    (global.fetch as jest.Mock).mockImplementation((url: string) =>
      Promise.resolve(
        url === "https://site.example.com/old"
          ? redirectTo("/new", 302)
          : { ok: url === "https://site.example.com/new", status: 200 },
      ),
    );

    expect(await scanBodyUrls(["https://site.example.com/old"])).toEqual([]);
  });

  it("reports redirect loops as inconclusive", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      redirectTo("https://loop.example.com/login", 302),
    );

    const [deadUrl] = await scanBodyUrls(["https://loop.example.com/login"]);

    expect(deadUrl.statusText).toBe("Redirect Loop");
    expect(deadUrl.category).toBe("inconclusive");
  });

  describe("when an http URL cannot connect", () => {
    const httpsRespondsWith = (httpsResponse: object | Error): void => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url.startsWith("http://")) return Promise.reject(connectionError("ECONNRESET"));
        return httpsResponse instanceof Error
          ? Promise.reject(httpsResponse)
          : Promise.resolve(httpsResponse);
      });
    };

    it("flags the link for an https update when https works", async () => {
      httpsRespondsWith({ ok: true, status: 200 });

      const [deadUrl] = await scanBodyUrls(["http://insecure.example.com/page"]);

      expect(deadUrl.url).toBe("http://insecure.example.com/page");
      expect(deadUrl.statusText).toBe("Unreachable over http; works over https");
      expect(deadUrl.category).toBe("httpsOnly");
    });

    it("reports the https result when https also fails", async () => {
      httpsRespondsWith({ ok: false, status: 404 });

      const [deadUrl] = await scanBodyUrls(["http://insecure.example.com/page"]);

      expect(deadUrl.statusText).toBe("Not Found (checked over https)");
      expect(deadUrl.category).toBe("dead");
    });

    it("reports the http error when https cannot connect either", async () => {
      httpsRespondsWith(connectionError("ECONNREFUSED"));

      const [deadUrl] = await scanBodyUrls(["http://insecure.example.com/page"]);

      expect(deadUrl.statusText).toBe("Connection Failed (ECONNRESET)");
      expect(deadUrl.category).toBe("inconclusive");
    });
  });

  const rateLimited = {
    ok: false,
    status: 429,
    headers: { get: (name: string): string | null => (name === "retry-after" ? "0" : null) },
  };

  it("retries rate-limited requests to find the real status", async () => {
    let getRequests = 0;
    (global.fetch as jest.Mock).mockImplementation((_url: string, init: RequestInit) => {
      if (init.method === "HEAD") return Promise.resolve({ ok: false, status: 405 });
      getRequests++;
      return Promise.resolve(getRequests === 1 ? rateLimited : { ok: false, status: 404 });
    });

    const [deadUrl] = await scanBodyUrls(["https://busy.example.com/page"]);

    expect(deadUrl.statusText).toBe("Not Found");
    expect(deadUrl.category).toBe("dead");
  });

  it("reports persistent rate limiting as inconclusive", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(rateLimited);

    const [deadUrl] = await scanBodyUrls(["https://busy.example.com/page"]);

    expect(deadUrl.statusText).toBe("Too Many Requests");
    expect(deadUrl.category).toBe("inconclusive");
  });

  it("checks URLs on the same host one at a time while checking hosts in parallel", async () => {
    const inFlightByHost: Record<string, number> = {};
    let inFlight = 0;
    let maxInFlightForOneHost = 0;
    let maxInFlight = 0;
    (global.fetch as jest.Mock).mockImplementation(async (url: string) => {
      const host = new URL(url).hostname.replace(/^www\./, "");
      inFlightByHost[host] = (inFlightByHost[host] ?? 0) + 1;
      inFlight++;
      maxInFlightForOneHost = Math.max(maxInFlightForOneHost, inFlightByHost[host]);
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((resolve) => setTimeout(resolve, 0));
      inFlightByHost[host]--;
      inFlight--;
      return { ok: true, status: 200 };
    });

    await scanBodyUrls([
      "https://a.example.com/1",
      "https://www.a.example.com/2",
      "http://a.example.com/3",
      "https://b.example.com/1",
      "https://b.example.com/2",
    ]);

    expect(maxInFlightForOneHost).toBe(1);
    expect(maxInFlight).toBe(2);
  });
});
