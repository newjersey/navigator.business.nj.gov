import * as api from "@/lib/api-client/apiClient";
import DeadUrlsPage from "@/pages/mgmt/deadurls";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

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
});
