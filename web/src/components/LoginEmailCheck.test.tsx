import { LoginEmailCheck } from "@/components/LoginEmailCheck";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { triggerSignIn } from "@/lib/auth/sessionHelper";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postUserEmailCheck: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({
  triggerSignIn: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<LoginEmailCheck />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("calls triggerSignIn when a matching user is found", async () => {
    const email = "test@example.com";
    mockApi.postUserEmailCheck.mockReturnValue(Promise.resolve({ email, found: true }));
    render(<LoginEmailCheck />);

    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: email } });
    const submitButton = screen.getByRole("button", { name: Config.checkAccountEmailPage.inputButton });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(triggerSignIn).toHaveBeenCalled();
    });
  });

  it("displays an error when a matching user is not found", async () => {
    const email = "test@example.com";
    mockApi.postUserEmailCheck.mockReturnValue(Promise.reject(404));
    render(<LoginEmailCheck />);

    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: email } });
    const submitButton = screen.getByRole("button", { name: Config.checkAccountEmailPage.inputButton });
    fireEvent.click(submitButton);

    expect(await screen.findByText(Config.checkAccountEmailPage.emailNotFoundError)).toBeInTheDocument();
    await waitFor(() => {
      expect(triggerSignIn).not.toHaveBeenCalled();
    });
  });

  it("displays an error when an invalid email address is entered", async () => {
    const invalidEmail = "what is an email, even?";
    render(<LoginEmailCheck />);

    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: invalidEmail } });
    const submitButton = screen.getByRole("button", { name: Config.checkAccountEmailPage.inputButton });
    fireEvent.click(submitButton);

    expect(await screen.findByText(Config.checkAccountEmailPage.invalidEmailError)).toBeInTheDocument();
    await waitFor(() => {
      expect(triggerSignIn).not.toHaveBeenCalled();
    });
  });

  it("displays a default error message if an unknown error occurs", async () => {
    render(<LoginEmailCheck />);
    const email = "test@example.com";
    // Doesn't matter what status code we use here, as long as it's not
    // one that we currently account for in our error handling.
    mockApi.postUserEmailCheck.mockReturnValue(Promise.reject(418));

    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: email } });
    const submitButton = screen.getByRole("button", { name: Config.checkAccountEmailPage.inputButton });
    fireEvent.click(submitButton);

    expect(await screen.findByText(Config.checkAccountEmailPage.defaultErrorMessage)).toBeInTheDocument();
    await waitFor(() => {
      expect(triggerSignIn).not.toHaveBeenCalled();
    });
  });

  it("submits the form when the user presses enter", async () => {
    const email = "test@example.com";
    mockApi.postUserEmailCheck.mockReturnValue(Promise.resolve({ email, found: true }));

    render(<LoginEmailCheck />);

    const emailField = screen.getByLabelText("Email");
    fireEvent.change(emailField, { target: { value: email } });
    fireEvent.keyDown(emailField, { key: "Enter" });

    await waitFor(() => {
      expect(triggerSignIn).toHaveBeenCalled();
    });
  });
});
