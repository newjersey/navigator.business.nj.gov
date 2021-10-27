import DeadLinksPage from "@/pages/mgmt/deadlinks";
import { fireEvent, render, waitFor } from "@testing-library/react";
import * as api from "@/lib/api-client/apiClient";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("Deadlinks page", () => {
  it("displays content when password is successful", async () => {
    const subject = render(<DeadLinksPage deadTasks={["task1"]} deadContextualInfo={["info1"]} />);
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();

    mockApi.post.mockResolvedValue({});

    fireEvent.change(subject.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(subject.getByText("Submit"));

    await waitFor(() => expect(subject.queryByText("task1")).toBeInTheDocument());
    expect(subject.queryByText("info1")).toBeInTheDocument();
    expect(subject.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("hides content when password is unsuccessful", () => {
    const subject = render(<DeadLinksPage deadTasks={["task1"]} deadContextualInfo={["info1"]} />);
    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();

    mockApi.post.mockRejectedValue({});

    fireEvent.change(subject.getByLabelText("Password"), { target: { value: "bad password" } });
    fireEvent.click(subject.getByText("Submit"));

    expect(subject.queryByText("task1")).not.toBeInTheDocument();
    expect(subject.queryByText("info1")).not.toBeInTheDocument();
    expect(subject.queryByLabelText("Password")).toBeInTheDocument();
  });
});
