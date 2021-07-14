import { act, fireEvent, RenderResult } from "@testing-library/react";
import * as api from "@/lib/api-client/apiClient";
import * as mockRouter from "@/test/mock/mockRouter";
import { useMockRouter } from "@/test/mock/mockRouter";
import { renderWithUser } from "@/test/helpers";
import { generateUser } from "@/test/factories";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Signup } from "@/components/Signup";

jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

describe("<Signup />", () => {
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    mockApi.postSelfReg.mockResolvedValue({ authRedirectURL: "" });
    useMockRouter({});
  });

  const renderPage = (): void => {
    subject = renderWithUser(<Signup isOpen={true} onClose={jest.fn()} />, {
      isAuthenticated: IsAuthenticated.FALSE,
    });
  };

  it("redirects to roadmap page if user already signed in", () => {
    subject = renderWithUser(<Signup isOpen={true} onClose={jest.fn()} />, { user: generateUser({}) });
    expect(mockRouter.mockPush).toHaveBeenCalledWith("/roadmap");
  });

  it("collects name, email, and confirm email fields and submits to api", () => {
    renderPage();
    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-email@example.com", "confirm-email");
    clickSubmit();
    expect(mockApi.postSelfReg).toHaveBeenCalledWith({
      email: "some-email@example.com",
      confirmEmail: "some-email@example.com",
      name: "Some Name",
    });
  });

  it("redirects the user to the url returned by the api", (done) => {
    renderPage();
    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-email@example.com", "confirm-email");
    mockApi.postSelfReg.mockResolvedValue({ authRedirectURL: "www.example.com" });

    mockRouter.mockPush.mockImplementation((newUrl: string): void => {
      expect(newUrl).toEqual("www.example.com");
      done();
    });

    clickSubmit();
  });

  it("shows the user an error message if the emails don't match", () => {
    renderPage();
    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).not.toBeInTheDocument();

    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-other-email@example.com", "confirm-email");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).toBeInTheDocument();
    expect(mockApi.postSelfReg).not.toHaveBeenCalled();

    fillText("some-email@example.com", "confirm-email");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).not.toBeInTheDocument();
    expect(mockApi.postSelfReg).toHaveBeenCalled();
  });

  it("shows the user an error message if any fields empty", () => {
    renderPage();
    expect(subject.queryByTestId("error-alert-REQUIRED_FIELDS")).not.toBeInTheDocument();

    clickSubmit();
    expect(subject.queryByTestId("error-alert-REQUIRED_FIELDS")).toBeInTheDocument();
    expect(mockApi.postSelfReg).not.toHaveBeenCalled();

    fillText("Some Name", "name");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-REQUIRED_FIELDS")).toBeInTheDocument();

    fillText("", "name");
    fillText("some-email@example.com", "email");
    fillText("some-email@example.com", "confirm-email");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-REQUIRED_FIELDS")).toBeInTheDocument();

    fillText("Some Name", "name");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-REQUIRED_FIELDS")).not.toBeInTheDocument();
    expect(mockApi.postSelfReg).toHaveBeenCalled();
  });

  it("shows the user an error message if myNJ returns an duplicate_signup error", async () => {
    renderPage();
    expect(subject.queryByTestId("error-alert-DUPLICATE_SIGNUP")).not.toBeInTheDocument();

    const rejectedPromise = Promise.reject(409);
    mockApi.postSelfReg.mockReturnValue(rejectedPromise);

    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-email@example.com", "confirm-email");
    clickSubmit();
    await act(() => rejectedPromise.catch(() => {}));
    expect(subject.queryByTestId("error-alert-DUPLICATE_SIGNUP")).toBeInTheDocument();
  });

  it("shows the user an error message if myNJ returns an error", async () => {
    renderPage();
    expect(subject.queryByTestId("error-alert-GENERIC")).not.toBeInTheDocument();

    const rejectedPromise = Promise.reject(500);
    mockApi.postSelfReg.mockReturnValue(rejectedPromise);

    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-email@example.com", "confirm-email");
    clickSubmit();
    await act(() => rejectedPromise.catch(() => {}));
    expect(subject.queryByTestId("error-alert-GENERIC")).toBeInTheDocument();
  });

  const fillText = (textToFill: string, fieldId: string) => {
    fireEvent.change(subject.getByTestId(fieldId), { target: { value: textToFill } });
  };

  const clickSubmit = () => {
    fireEvent.click(subject.getByTestId("submit-selfreg"));
  };
});
