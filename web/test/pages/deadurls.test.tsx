import * as api from "@/lib/api-client/apiClient";
import { generateDeadLinksCsv, LINK_CATEGORY_LABELS } from "@/lib/static/admin/deadLinkReport";
import { ContentDeadLink } from "@/lib/static/admin/findDeadLinks";
import DeadUrlsPage from "@/pages/mgmt/deadurls";
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

  describe("after a scan completes", () => {
    const results: ContentDeadLink[] = [
      {
        file: "/content/src/roadmaps/tasks/task1.md",
        slug: "task1",
        displayName: "Task One",
        collection: "Tasks",
        cmsEditUrl: "/mgmt/cms#/collections/tasks/entries/task1",
        pageUrl: "",
        deadUrls: [
          {
            url: "https://gone.example.com",
            field: "body",
            context: "see https://gone.example.com",
            statusCode: 404,
            statusText: "Not Found",
            category: "dead",
          },
          {
            url: "http://insecure.example.com",
            field: "body",
            context: "see http://insecure.example.com",
            statusCode: null,
            statusText: "Unreachable over http; works over https",
            category: "httpsOnly",
          },
        ],
      },
    ];

    afterEach(() => {
      jest.useRealTimers();
    });

    // Fake timers let the status poll fire inside act(), so effects in the results view
    // (like GenericButton measuring itself) flush before assertions run.
    const completeScan = async (): Promise<void> => {
      jest.useFakeTimers();
      global.fetch = jest.fn((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.endsWith("/status")
                ? { checkedUrls: 2, totalUrls: 2, isComplete: true, results, error: null }
                : { status: "started" },
            ),
        }),
      ) as jest.Mock;
      mockApi.post.mockResolvedValue({});

      render(<DeadUrlsPage noAuth={true} />);
      fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
      fireEvent.click(screen.getByText("Submit"));
      fireEvent.click(await screen.findByText("Start Dead Link Check"));
      await act(() => jest.advanceTimersByTimeAsync(2500));
    };

    it("labels each flagged URL with its category", async () => {
      await completeScan();

      expect(
        screen.getByText(new RegExp(`${LINK_CATEGORY_LABELS.dead}: 404 Not Found`)),
      ).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(`${LINK_CATEGORY_LABELS.httpsOnly}: Unreachable over http`)),
      ).toBeInTheDocument();
    });

    it("downloads the results as a CSV file", async () => {
      await completeScan();
      const createObjectURL = jest.fn<string, [Blob]>(() => "blob:dead-urls");
      window.URL.createObjectURL = createObjectURL;
      window.URL.revokeObjectURL = jest.fn();
      let downloadedFilename = "";
      jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        downloadedFilename = this.download;
      });

      fireEvent.click(screen.getByText("Download CSV"));

      expect(downloadedFilename).toBe("dead-urls-report.csv");
      const blob = createObjectURL.mock.calls[0][0];
      expect(blob.type).toBe("text/csv;charset=utf-8");
      // Decoding the blob strips the byte order mark, so compare without it.
      expect(await readBlobText(blob)).toBe(generateDeadLinksCsv(results).replace(/^\uFEFF/, ""));
    });
  });
});

// jsdom's Blob does not implement text(), so read it the older way.
const readBlobText = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    // eslint-disable-next-line unicorn/prefer-blob-reading-methods
    reader.readAsText(blob);
  });
