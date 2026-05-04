import * as api from "@/lib/api-client/apiClient";
import UnusedContent from "@/pages/mgmt/unusedContent";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({ post: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("Deadlinks page", () => {
  it("displays content when password is successful", async () => {
    render(
      <UnusedContent deadTasks={["task1"]} deadLicenseTasks={["licenseTask1"]} noAuth={true} />,
    );
    expect(screen.queryByText("task1")).not.toBeInTheDocument();
    expect(screen.queryByText("licenseTask1")).not.toBeInTheDocument();

    mockApi.post.mockResolvedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "ADMIN_PASSWORD" } });
    fireEvent.click(screen.getByText("Submit"));

    await screen.findByText("task1");
    expect(screen.getByText("licenseTask1")).toBeInTheDocument();
    expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
  });

  it("hides content when password is unsuccessful", async () => {
    render(
      <UnusedContent deadTasks={["task1"]} deadLicenseTasks={["licenseTask1"]} noAuth={true} />,
    );
    expect(screen.queryByText("task1")).not.toBeInTheDocument();
    expect(screen.queryByText("licenseTask1")).not.toBeInTheDocument();

    mockApi.post.mockRejectedValue({});

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "bad password" } });
    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      return expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });
    expect(screen.queryByText("task1")).not.toBeInTheDocument();
    expect(screen.queryByText("licenseTask1")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });
});
