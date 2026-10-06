import {
  CooldownWaitExceededError,
  createDeadLinkRequestScheduler,
  getDeadLinkDomain,
} from "@/lib/static/admin/deadLinkRequestScheduler";

const createScheduler = (
  globalConcurrency = 10,
): ReturnType<typeof createDeadLinkRequestScheduler> =>
  createDeadLinkRequestScheduler({ globalConcurrency, requestIntervalMs: 1000 });

describe("getDeadLinkDomain", () => {
  it("groups njeda.gov and www.njeda.gov", () => {
    expect(getDeadLinkDomain("https://www.njeda.gov/a")).toBe("njeda.gov");
    expect(getDeadLinkDomain("https://njeda.gov/b")).toBe("njeda.gov");
  });

  it("uses the hostname for other sites", () => {
    expect(getDeadLinkDomain("https://www.nj.gov/a")).toBe("www.nj.gov");
  });
});

describe("createDeadLinkRequestScheduler", () => {
  const noLimit = Number.MAX_SAFE_INTEGER;

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("allows one request at a time per domain", async () => {
    const scheduler = createScheduler();
    const first = await scheduler.acquire({
      url: "https://example.com/a",
      maxCooldownWaitMs: noLimit,
    });

    let secondStarted = false;
    const second = scheduler
      .acquire({ url: "https://example.com/b", maxCooldownWaitMs: noLimit })
      .then((release) => {
        secondStarted = true;
        return release;
      });

    await jest.advanceTimersByTimeAsync(5000);
    expect(secondStarted).toBe(false);

    first();
    await jest.advanceTimersByTimeAsync(1000);
    expect(secondStarted).toBe(true);
    (await second)();
  });

  it("spaces requests to one domain by the request interval", async () => {
    const scheduler = createScheduler();
    const start = Date.now();
    const startTimes: number[] = [];

    const run = async (path: string): Promise<void> => {
      const release = await scheduler.acquire({
        url: `https://example.com/${path}`,
        maxCooldownWaitMs: noLimit,
      });
      startTimes.push(Date.now() - start);
      release();
    };

    const all = Promise.all([run("a"), run("b"), run("c")]);
    await jest.runAllTimersAsync();
    await all;

    expect(startTimes).toEqual([0, 1000, 2000]);
  });

  it("runs different domains at the same time", async () => {
    const scheduler = createScheduler();

    const releases = await Promise.all([
      scheduler.acquire({ url: "https://one.example.com/", maxCooldownWaitMs: noLimit }),
      scheduler.acquire({ url: "https://two.example.com/", maxCooldownWaitMs: noLimit }),
    ]);

    expect(releases).toHaveLength(2);
    for (const release of releases) release();
  });

  it("limits the total number of requests in flight", async () => {
    const scheduler = createScheduler(2);
    const releases = [
      await scheduler.acquire({ url: "https://one.example.com/", maxCooldownWaitMs: noLimit }),
      await scheduler.acquire({ url: "https://two.example.com/", maxCooldownWaitMs: noLimit }),
    ];

    let thirdStarted = false;
    const third = scheduler
      .acquire({ url: "https://three.example.com/", maxCooldownWaitMs: noLimit })
      .then((release) => {
        thirdStarted = true;
        return release;
      });

    await jest.advanceTimersByTimeAsync(5000);
    expect(thirdStarted).toBe(false);

    releases[0]();
    await jest.advanceTimersByTimeAsync(0);
    expect(thirdStarted).toBe(true);

    releases[1]();
    (await third)();
  });

  it("holds every request to a cooling-down domain, including its aliases", async () => {
    const scheduler = createScheduler();
    const start = Date.now();
    scheduler.cooldown("https://www.njeda.gov/a", 20_000);

    let startedAt = -1;
    const pending = scheduler
      .acquire({ url: "https://njeda.gov/b", maxCooldownWaitMs: noLimit })
      .then((release) => {
        startedAt = Date.now() - start;
        release();
      });

    await jest.advanceTimersByTimeAsync(19_000);
    expect(startedAt).toBe(-1);

    await jest.advanceTimersByTimeAsync(1000);
    await pending;
    expect(startedAt).toBe(20_000);
  });

  it("does not delay other domains during a cooldown", async () => {
    const scheduler = createScheduler();
    scheduler.cooldown("https://www.njeda.gov/a", 20_000);

    const release = await scheduler.acquire({
      url: "https://other.example.com/",
      maxCooldownWaitMs: noLimit,
    });

    expect(release).toEqual(expect.any(Function));
    release();
  });

  it("rejects a request whose domain is cooling down longer than it is willing to wait", async () => {
    const scheduler = createScheduler();
    scheduler.cooldown("https://www.njeda.gov/a", 300_000);

    await expect(
      scheduler.acquire({ url: "https://www.njeda.gov/b", maxCooldownWaitMs: 120_000 }),
    ).rejects.toBeInstanceOf(CooldownWaitExceededError);
  });

  it("keeps a request waiting when the cooldown fits within its budget", async () => {
    const scheduler = createScheduler();
    scheduler.cooldown("https://www.njeda.gov/a", 60_000);

    const pending = scheduler.acquire({
      url: "https://www.njeda.gov/b",
      maxCooldownWaitMs: 120_000,
    });
    await jest.advanceTimersByTimeAsync(60_000);

    const release = await pending;
    expect(release).toEqual(expect.any(Function));
    release();
  });

  it("ignores a second release of the same request", async () => {
    const scheduler = createScheduler(1);
    const release = await scheduler.acquire({
      url: "https://one.example.com/",
      maxCooldownWaitMs: noLimit,
    });

    release();
    release();

    const next = await scheduler.acquire({
      url: "https://two.example.com/",
      maxCooldownWaitMs: noLimit,
    });
    let thirdStarted = false;
    const third = scheduler
      .acquire({ url: "https://three.example.com/", maxCooldownWaitMs: noLimit })
      .then((r) => {
        thirdStarted = true;
        return r;
      });

    await jest.advanceTimersByTimeAsync(5000);
    expect(thirdStarted).toBe(false);

    next();
    (await third)();
  });
});
