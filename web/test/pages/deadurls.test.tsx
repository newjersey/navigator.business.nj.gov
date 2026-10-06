import * as api from "@/lib/api-client/apiClient";
import DeadUrlsPage from "@/pages/mgmt/deadurls";
import type { ContentDeadLink } from "@/lib/static/admin/findDeadLinks";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("DeadUrls page", () => {
  it("shows auth form initially and start button after auth", async () => {
    render(<DeadUrlsPage noAuth={true} />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.queryByText("Start Dead Link Check")).not.toBeInTheDocument();

    mockApi.post.mockResolvedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(screen.getByText("Submit"));

    await screen.findByText("Start Dead Link Check");
    expect(screen.getByText("Start Dead Link Check")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("hides content when password is unsuccessful", async () => {
    render(<DeadUrlsPage noAuth={true} />);

    expect(screen.getByLabelText("Password")).toBeInTheDocument();

    mockApi.post.mockRejectedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad password" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      return expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });
    expect(screen.queryByText("Start Dead Link Check")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  describe("downloading a completed scan", () => {
    const scanResults: ContentDeadLink[] = [
      {
        file: "/repo/content/src/roadmaps/tasks/register-llc.md",
        slug: "register-llc",
        displayName: "Register LLC",
        collection: "Tasks - All",
        cmsEditUrl: "/mgmt/cms#/collections/tasks/entries/register-llc",
        pageUrl: "/tasks/register-llc",
        deadUrls: [
          {
            url: "https://dead.example.com",
            field: "body",
            context: "see the dead link",
            statusCode: 404,
            statusText: "Not Found",
          },
        ],
      },
    ];
    let downloads: { blob: Blob; filename: string }[];
    let statusResults: ContentDeadLink[];
    const scanId = "7f3c2a90-0000-4000-8000-000000000001";
    const debugLogText = '{"event":"scan_started"}\n{"event":"scan_completed"}\n';

    const completeScan = async (): Promise<void> => {
      mockApi.post.mockResolvedValue({});
      render(<DeadUrlsPage noAuth={true} />);
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
      fireEvent.click(screen.getByText("Submit"));
      fireEvent.click(await screen.findByText("Start Dead Link Check"));
      await act(async () => {
        await jest.advanceTimersByTimeAsync(2500);
      });
      await screen.findByText("Download CSV");
    };

    // jsdom's Blob has no text() method
    const readText = (blob: Blob): Promise<string> =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.addEventListener("load", () => resolve(String(reader.result)));
        // eslint-disable-next-line unicorn/prefer-blob-reading-methods
        reader.readAsText(blob);
      });

    beforeEach(() => {
      jest.useFakeTimers();
      downloads = [];
      statusResults = scanResults;
      global.fetch = jest.fn().mockImplementation(async (url: string) => {
        if (url.startsWith("/api/mgmt/deadlinks/log")) {
          return { ok: true, text: async (): Promise<string> => debugLogText };
        }
        return {
          ok: true,
          json: async (): Promise<unknown> =>
            url.endsWith("/status")
              ? {
                  scanId,
                  startedAt: "2026-10-05T12:00:00.000Z",
                  completedAt: "2026-10-05T12:05:00.000Z",
                  logTruncated: false,
                  checkedUrls: 1,
                  totalUrls: 1,
                  isComplete: true,
                  results: statusResults,
                  error: null,
                }
              : {},
        };
      });
      URL.createObjectURL = jest.fn((blob: Blob) => {
        downloads.push({ blob, filename: "" });
        return "blob:download";
      });
      URL.revokeObjectURL = jest.fn();
      jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        downloads[downloads.length - 1].filename = this.download;
      });
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it("downloads the findings as a CSV with links resolved against the current site", async () => {
      await completeScan();

      fireEvent.click(screen.getByText("Download CSV"));

      expect(downloads).toHaveLength(1);
      expect(downloads[0].filename).toBe("content-hygiene-report.csv");
      expect(downloads[0].blob.type).toBe("text/csv;charset=utf-8");
      const csv = await readText(downloads[0].blob);
      expect(csv).toContain(`"${window.location.origin}/tasks/register-llc"`);
      expect(csv).toContain('"https://dead.example.com"');
    });

    it("still downloads the findings as an HTML report", async () => {
      await completeScan();

      fireEvent.click(screen.getByText("Download HTML"));

      expect(downloads).toHaveLength(1);
      expect(downloads[0].filename).toBe("dead-urls-report.html");
      expect(downloads[0].blob.type).toBe("text/html");
    });

    it("downloads the debug log for the completed scan", async () => {
      await completeScan();

      fireEvent.click(screen.getByTestId("download-debug-log"));
      await waitFor(() => expect(downloads).toHaveLength(1));

      expect(global.fetch).toHaveBeenCalledWith(`/api/mgmt/deadlinks/log?scanId=${scanId}`);
      expect(downloads[0].filename).toBe(`content-hygiene-debug-${scanId}.jsonl`);
      expect(downloads[0].blob.type).toBe("application/x-ndjson;charset=utf-8");
      expect(await readText(downloads[0].blob)).toBe(debugLogText);
    });

    it("shows an error and keeps the results when the debug log cannot be downloaded", async () => {
      await completeScan();
      (global.fetch as jest.Mock).mockImplementation(async () => ({ ok: false }));

      fireEvent.click(screen.getByTestId("download-debug-log"));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "The debug log could not be downloaded. Try again.",
      );
      expect(downloads).toHaveLength(0);
      expect(screen.getByText("Download CSV")).toBeInTheDocument();
    });

    it("offers the debug log while a scan is still running", async () => {
      mockApi.post.mockResolvedValue({});
      (global.fetch as jest.Mock).mockImplementation(async (url: string) => ({
        ok: true,
        json: async (): Promise<unknown> =>
          url.endsWith("/status")
            ? {
                scanId,
                startedAt: "2026-10-05T12:00:00.000Z",
                completedAt: null,
                logTruncated: true,
                checkedUrls: 1,
                totalUrls: 10,
                isComplete: false,
                results: null,
                error: null,
              }
            : {},
      }));
      render(<DeadUrlsPage noAuth={true} />);
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
      fireEvent.click(screen.getByText("Submit"));
      fireEvent.click(await screen.findByText("Start Dead Link Check"));
      await act(async () => {
        await jest.advanceTimersByTimeAsync(2500);
      });

      expect(await screen.findByTestId("download-debug-log")).toBeInTheDocument();
      expect(screen.queryByText("Download CSV")).not.toBeInTheDocument();
      expect(
        screen.getByText("The debug log reached its size limit. Some activity was omitted."),
      ).toBeInTheDocument();
    });

    it("shows the final status and redirect chain of a rate-limited link in the HTML report", async () => {
      statusResults = [
        {
          ...scanResults[0],
          deadUrls: [
            {
              url: "http://njeda.gov/example/",
              field: "body",
              context: "see the funding page",
              statusCode: 429,
              statusText: "Too Many Requests — failed after 3 attempts",
              attemptCount: 3,
              finalUrl: "https://www.njeda.gov/example/",
              redirects: [
                {
                  fromUrl: "http://njeda.gov/example/",
                  statusCode: 301,
                  toUrl: "https://www.njeda.gov/example/",
                },
              ],
            },
          ],
        },
      ];
      await completeScan();

      fireEvent.click(screen.getByText("Download HTML"));

      const html = await readText(downloads[0].blob);
      expect(html).toContain("429 Too Many Requests — failed after 3 attempts");
      expect(html).toContain(
        "Redirects: 301: http://njeda.gov/example/ → https://www.njeda.gov/example/",
      );
    });
  });
});
