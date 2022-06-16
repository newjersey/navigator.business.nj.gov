import { SelfRegToast } from "@/components/auth/SelfRegToast";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { render, screen } from "@testing-library/react";

jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

describe("SelfRegToast", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  const setRegistrationAlertStatus = jest.fn();
  const setupHookWithAuth = (
    isAuthenticated: IsAuthenticated,
    registrationAlertStatus: RegistrationStatus
  ) => {
    render(
      withAuthAlert(<SelfRegToast />, isAuthenticated, {
        registrationAlertStatus,
        setRegistrationAlertStatus,
      })
    );
  };

  it("updates registration status when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, "IN_PROGRESS");
    expect(setRegistrationAlertStatus).toBeCalledWith("SUCCESS");
  });

  it("shows registration success toast when user is authenticated and had completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.TRUE, "SUCCESS");
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestSuccessBody))).toBeInTheDocument();
    expect(screen.getByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))).toBeInTheDocument();
    expect(screen.getByTestId("congratulations-logo")).toBeInTheDocument();
    expect(screen.getByTestId("reg-toast")).toBeInTheDocument();
  });

  it("does not show registration success toast when user is not authenticated and had not completed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "IN_PROGRESS");
    expect(screen.queryByTestId("reg-toast")).not.toBeInTheDocument();
  });

  it("shows duplicate registration error toast alert when user had failed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "DUPLICATE_ERROR");
    expect(
      screen.getByText(markdownToText(Config.selfRegistration.errorTextDuplicateSignUp))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });

  it("shows general registration error toast alert when user had failed the registration process", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, "RESPONSE_ERROR");
    expect(screen.getByText(markdownToText(Config.selfRegistration.errorTextGeneric))).toBeInTheDocument();
    expect(
      screen.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
  });
});
