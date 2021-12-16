import { Signup } from "@/components/Signup";
import { SelfRegDefaults } from "@/display-defaults/SelfRegDefaults";
import * as api from "@/lib/api-client/apiClient";
import { SelfRegResponse } from "@/lib/types/types";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { act, fireEvent, render, RenderResult } from "@testing-library/react";
import React from "react";

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
    subject = render(<Signup isOpen={true} onClose={jest.fn()} />);
  };

  const renderAndFillForm = (name: string, email: string): Promise<SelfRegResponse> => {
    renderPage();

    const returnedPromise = Promise.resolve({ authRedirectURL: "www.example.com" });
    mockApi.postSelfReg.mockReturnValue(returnedPromise);

    fillText(name, "name");
    fillText(email, "email");
    fillText(email, "confirm-email");
    return returnedPromise;
  };

  it("collects name, email, and confirm email fields and submits to api", async () => {
    const returnedPromise = renderAndFillForm("Some Name", "some-email@example.com");
    clickSubmit();
    await act(() => returnedPromise);
    expect(mockApi.postSelfReg).toHaveBeenCalledWith({
      email: "some-email@example.com",
      confirmEmail: "some-email@example.com",
      name: "Some Name",
      receiveNewsletter: true,
      userTesting: true,
    });
  });

  it("allows a user to uncheck to opt out of newsletter", async () => {
    const returnedPromise = renderAndFillForm("Some Name", "some-email@example.com");
    fireEvent.click(subject.getByLabelText(SelfRegDefaults.newsletterCheckboxLabel));
    clickSubmit();
    await act(() => returnedPromise);
    expect(mockApi.postSelfReg).toHaveBeenCalledWith({
      email: "some-email@example.com",
      confirmEmail: "some-email@example.com",
      name: "Some Name",
      receiveNewsletter: false,
      userTesting: true,
    });
  });

  it("allows a user to uncheck to opt out of user testing", async () => {
    const returnedPromise = renderAndFillForm("Some Name", "some-email@example.com");
    fireEvent.click(subject.getByLabelText(SelfRegDefaults.userTestingCheckboxLabel));
    clickSubmit();
    await act(() => returnedPromise);
    expect(mockApi.postSelfReg).toHaveBeenCalledWith({
      email: "some-email@example.com",
      confirmEmail: "some-email@example.com",
      name: "Some Name",
      receiveNewsletter: true,
      userTesting: false,
    });
  });

  it("shows loading spinner while request is being processed", async () => {
    const returnedPromise = renderAndFillForm("Some Name", "some-email@example.com");
    expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    clickSubmit();
    expect(subject.queryByTestId("loading-spinner")).toBeInTheDocument();
    await act(() => returnedPromise);
    expect(subject.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  it("redirects the user to the url returned by the api", async () => {
    const returnedPromise = renderAndFillForm("Some Name", "some-email@example.com");
    clickSubmit();
    await act(() => returnedPromise);
    expect(mockPush).toHaveBeenCalledWith("www.example.com");
  });

  it("shows the user an error message if the emails don't match", async () => {
    renderPage();
    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).not.toBeInTheDocument();

    fillText("Some Name", "name");
    fillText("some-email@example.com", "email");
    fillText("some-other-email@example.com", "confirm-email");
    clickSubmit();
    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).toBeInTheDocument();
    expect(mockApi.postSelfReg).not.toHaveBeenCalled();

    const resolvedPromise = Promise.resolve({ authRedirectURL: "www.example.com" });
    mockApi.postSelfReg.mockReturnValue(resolvedPromise);
    fillText("some-email@example.com", "confirm-email");
    clickSubmit();

    await act(() => resolvedPromise);

    expect(subject.queryByTestId("error-alert-EMAILS_DO_NOT_MATCH")).not.toBeInTheDocument();
    expect(mockApi.postSelfReg).toHaveBeenCalled();
  });

  it("shows the user an error message if any fields empty", async () => {
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

    const resolvedPromise = Promise.resolve({ authRedirectURL: "www.example.com" });
    mockApi.postSelfReg.mockReturnValue(resolvedPromise);
    fillText("Some Name", "name");
    clickSubmit();

    await act(() => resolvedPromise);
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
