import * as api from "@/lib/api-client/apiClient";
import DeadLinksPage from "@/pages/mgmt/deadlinks";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { Options } from "broken-link-checker";
import React from "react";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("broken-link-checker", () => ({
  HtmlUrlChecker: function SpyHtmlUrlChecker(
    options: Options,
    handlers: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly link?: ((result: any) => void) | undefined;
      readonly end?: (() => void) | undefined;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

describe("Deadlinks page", () => {
  it("displays content when password is successful", async () => {
    const subject = render(
      <DeadLinksPage
        deadTasks={["task1"]}
        deadContextualInfo={["info1"]}
        deadLinks={{
          deadLink1: ["http://www.deadlink.com"],
        }}
      />
    );
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();
    expect(subject.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();

    mockApi.post.mockResolvedValue({});

    fireEvent.change(subject.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(subject.getByText("Submit"));

    await waitFor(() => expect(subject.queryByText("task1")).toBeInTheDocument());
    expect(subject.queryByText("info1")).toBeInTheDocument();
    expect(subject.queryByText("http://www.deadlink.com")).toBeInTheDocument();
    expect(subject.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("hides content when password is unsuccessful", () => {
    const subject = render(
      <DeadLinksPage
        deadTasks={["task1"]}
        deadContextualInfo={["info1"]}
        deadLinks={{
          deadLink1: ["http://www.deadlink.com"],
        }}
      />
    );
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();
    expect(subject.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();

    mockApi.post.mockRejectedValue({});

    fireEvent.change(subject.getByLabelText("Password"), { target: { value: "bad password" } });
    fireEvent.click(subject.getByText("Submit"));

    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();
    expect(subject.queryByText("http://www.deadlink.com")).not.toBeInTheDocument();
    expect(subject.queryByLabelText("Password")).toBeInTheDocument();
  });
});
