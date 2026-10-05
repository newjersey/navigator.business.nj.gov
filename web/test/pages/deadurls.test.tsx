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
      global.fetch = jest.fn().mockImplementation(async (url: string) => ({
        ok: true,
        json: async (): Promise<unknown> =>
          url.endsWith("/status")
            ? { checkedUrls: 1, totalUrls: 1, isComplete: true, results: scanResults, error: null }
            : {},
      }));
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
  });
});
