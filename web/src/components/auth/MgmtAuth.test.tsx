import { MgmtAuth } from "@/components/auth/MgmtAuth";
import * as api from "@/lib/api-client/apiClient";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

vi.mock("@/lib/api-client/apiClient", () => ({ post: vi.fn() }));

const mockApi = api as vi.Mocked<typeof api>;

describe("<MgmtAuth />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    password = "";
    isAuthed = false;
  });

  let password = "";
  const setPassword = (value: string): void => {
    password = value;
  };
  let isAuthed = false;
  const setIsAuthed = (value: boolean): void => {
    isAuthed = value;
  };

  it("sets the password field on change", async () => {
    mockApi.post.mockReturnValue(Promise.resolve());

    render(<MgmtAuth password={password} setPassword={setPassword} setIsAuthed={setIsAuthed} />);
    const pwField = screen.getByTestId("mgmt-password-field");
    fireEvent.change(pwField, { target: { value: "1234" } });
    expect(password).toBe("1234");
  });

  it("calls the api on submission and sets isAuthed to true on success", async () => {
    mockApi.post.mockReturnValue(Promise.resolve());

    render(<MgmtAuth password={password} setPassword={setPassword} setIsAuthed={setIsAuthed} />);
    const pwField = screen.getByTestId("mgmt-password-field");
    fireEvent.change(pwField, { target: { value: "1234" } });
    fireEvent.click(screen.getByTestId("mgmt-submit-bttn"));
    await waitFor(() => {
      return expect(mockApi.post).toHaveBeenCalled();
    });
    expect(isAuthed).toEqual(true);
  });

  it("submits the form when clicking enter", async () => {
    mockApi.post.mockReturnValue(Promise.resolve());

    render(<MgmtAuth password={password} setPassword={setPassword} setIsAuthed={setIsAuthed} />);
    const pwField = screen.getByTestId("mgmt-password-field");
    fireEvent.change(pwField, { target: { value: "1234" } });
    fireEvent.keyPress(pwField, { key: "Enter", keyCode: 13 });
    await waitFor(() => {
      return expect(mockApi.post).toHaveBeenCalled();
    });
    expect(isAuthed).toEqual(true);
  });

  it("calls the api on submission and doesn't change isAuthed to true on failure", async () => {
    mockApi.post.mockReturnValue(Promise.reject());

    render(<MgmtAuth password={password} setPassword={setPassword} setIsAuthed={setIsAuthed} />);
    const pwField = screen.getByTestId("mgmt-password-field");
    fireEvent.change(pwField, { target: { value: "1234" } });
    fireEvent.click(screen.getByTestId("mgmt-submit-bttn"));
    await waitFor(() => {
      return expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });
    expect(mockApi.post).toHaveBeenCalled();
    expect(isAuthed).toEqual(false);
  });
});
