import {
  argsInclude,
  catchRateLimitErrorAndRetry,
  checkRateLimitAndWait,
  contentToStrings,
  getHtml,
  resolveApiPromises,
  wait,
} from "./helpers";
import {FetchResponse} from "./types";

describe("helpers", () => {
  describe("argsInclude", () => {
    const originalArgv = process.argv;

    beforeEach(() => {
      process.argv = ["node", "script.js"];
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it("returns true when query is in process.argv", () => {
      process.argv = ["node", "script.js", "--sync"];
      expect(argsInclude("--sync")).toBe(true);
    });

    it("returns true when query is part of an argument", () => {
      process.argv = ["node", "script.js", "--ci-sync"];
      expect(argsInclude("sync")).toBe(true);
    });

    it("returns false when query is not in process.argv", () => {
      process.argv = ["node", "script.js", "--preview"];
      expect(argsInclude("--sync")).toBe(false);
    });
  });

  describe("checkRateLimitAndWait", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("waits when rate limit is low", async () => {
      const headers = new Headers();
      headers.set("x-ratelimit-remaining", "3");
      const response = {
        data: {},
        headers,
      } as FetchResponse;

      const promise = checkRateLimitAndWait(response);
      jest.advanceTimersByTime(20000);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
    });

    it("does not wait when rate limit is high", async () => {
      const headers = new Headers();
      headers.set("x-ratelimit-remaining", "10");
      const response = {
        data: {},
        headers,
      } as FetchResponse;

      await checkRateLimitAndWait(response);
      expect(jest.getTimerCount()).toBe(0);
    });

    it("handles missing headers", async () => {
      const response = {} as FetchResponse;
      await checkRateLimitAndWait(response);
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe("resolveApiPromises", () => {
    it("resolves all promises sequentially", async () => {
      const results: number[] = [];
      const promises = [
        (): Promise<void> =>
          Promise.resolve({ data: {}, headers: new Headers() } as FetchResponse).then((): void => {
            results.push(1);
          }),
        (): Promise<void> =>
          Promise.resolve({ data: {}, headers: new Headers() } as FetchResponse).then((): void => {
            results.push(2);
          }),
        (): Promise<void> =>
          Promise.resolve({ data: {}, headers: new Headers() } as FetchResponse).then((): void => {
            results.push(3);
          }),
      ];

      await resolveApiPromises(promises);

      expect(results).toEqual([1, 2, 3]);
    });

    it("logs info when array is empty", async () => {
      const consoleSpy = jest.spyOn(console, "info").mockImplementation();

      await resolveApiPromises([]);

      expect(consoleSpy).toHaveBeenCalledWith("0 things to be acted on");
      consoleSpy.mockRestore();
    });
  });

  describe("catchRateLimitErrorAndRetry", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("retries on 429 error after waiting", async () => {
      const retryFunc = jest
        .fn()
        .mockResolvedValue({ data: "success", headers: new Headers() } as FetchResponse);
      const error = {
        response: { status: 429 },
      };

      const promise = catchRateLimitErrorAndRetry(error, retryFunc, "param1", "param2");
      jest.advanceTimersByTime(65000);
      const result = await promise;

      expect(retryFunc).toHaveBeenCalledWith("param1", "param2");
      expect(result).toEqual({ data: "success", headers: expect.any(Headers) });
    });

    it("throws error on non-429 status", async () => {
      const retryFunc = jest.fn();
      const error = {
        response: { status: 500 },
      };

      await expect(catchRateLimitErrorAndRetry(error, retryFunc)).rejects.toEqual(error);
      expect(retryFunc).not.toHaveBeenCalled();
    });
  });

  describe("contentToStrings", () => {
    it("converts markdown to HTML strings", () => {
      const markdown = "# Heading\n\nThis is a paragraph.";
      const result = contentToStrings(markdown);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result.join("")).toContain("Heading");
    });

    it("removes blockquotes", () => {
      const markdown = "> This is a quote";
      const result = contentToStrings(markdown);

      expect(result.join("")).not.toContain("<blockquote>");
    });

    it("removes custom callouts", () => {
      const markdown = ":::infoAlert\nSome info\n:::";
      const result = contentToStrings(markdown);

      expect(result.join("")).not.toContain(":::infoAlert");
    });
  });

  describe("getHtml", () => {
    it("joins array into HTML string", () => {
      const lines = ["<p>Line 1</p>", "<p>Line 2</p>", "<p>Line 3</p>"];
      const result = getHtml(lines);

      expect(result).toBe("<p>Line 1</p> <p>Line 2</p> <p>Line 3</p>");
    });

    it("slices array based on start and stop", () => {
      const lines = ["<p>Line 1</p>", "<p>Line 2</p>", "<p>Line 3</p>", "<p>Line 4</p>"];
      const result = getHtml(lines, 1, 3);

      expect(result).toBe("<p>Line 2</p> <p>Line 3</p>");
    });

    it("trims whitespace from lines", () => {
      const lines = ["  <p>Line 1</p>  ", "  <p>Line 2</p>  "];
      const result = getHtml(lines);

      expect(result).toBe("<p>Line 1</p> <p>Line 2</p>");
    });
  });

  describe("wait", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("waits for specified milliseconds", async () => {
      const promise = wait(5000);
      jest.advanceTimersByTime(5000);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
    });

    it("defaults to 10000 milliseconds", async () => {
      const promise = wait();
      expect(jest.getTimerCount()).toBe(1);
      jest.advanceTimersByTime(10000);
      await promise;

      expect(jest.getTimerCount()).toBe(0);
    });
  });
});
