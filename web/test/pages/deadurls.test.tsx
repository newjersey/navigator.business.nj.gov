import * as api from "@/lib/api-client/apiClient";
import DeadUrlsPage from "@/pages/mgmt/deadurls";
import { fireEvent, render, screen } from "@testing-library/react";
import { Options } from "broken-link-checker";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("broken-link-checker", () => {
  return {
    HtmlUrlChecker: function SpyHtmlUrlChecker(
      options: Options,
      handlers: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        link?: ((result: any) => void) | undefined;
        end?: (() => void) | undefined;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enqueue = (pageUrl: any): any => {
        if (!handlers.link || !handlers.end) {
          return;
        }
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
  };
});

describe("DeadUrls page", () => {
  it("displays content when password is successful", async () => {
    render(
      <DeadUrlsPage
        deadLinks={{
          deadLink1: ["http://www.deadlink.com"],
        }}
        noAuth={true}
      />
    );
    expect(screen.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();

    mockApi.post.mockResolvedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(screen.getByText("Submit"));

    await screen.findByText("http://www.deadlink.com");
    expect(screen.getByText("http://www.deadlink.com")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("hides content when password is unsuccessful", () => {
    render(
      <DeadUrlsPage
        deadLinks={{
          deadLink1: ["http://www.deadlink.com"],
        }}
        noAuth={true}
      />
    );
    expect(screen.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();

    mockApi.post.mockRejectedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad password" } });
    fireEvent.click(screen.getByText("Submit"));

    expect(screen.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});
