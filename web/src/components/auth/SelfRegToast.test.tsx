import { SelfRegToast } from "@/components/auth/SelfRegToast";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared";
import { render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

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
  ): RenderResult => {
    return render(
      withAuthAlert(<SelfRegToast />, isAuthenticated, {
        registrationAlertStatus,
        setRegistrationAlertStatus,
      })
    );
  };

  it("updates registration status when user is authenticated and had completed the registration process", async () => {
    setupHookWithAuth(IsAuthenticated.TRUE, "IN_PROGRESS");
    expect(setRegistrationAlertStatus).toBeCalledWith("SUCCESS");
  });

  it("shows registration success toast when user is authenticated and had completed the registration process", async () => {
    const subject = setupHookWithAuth(IsAuthenticated.TRUE, "SUCCESS");
    await waitFor(() => {
      expect(
        subject.getByText(markdownToText(Config.navigationDefaults.guestSuccessBody))
      ).toBeInTheDocument();
      expect(
        subject.getByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
      ).toBeInTheDocument();
      expect(subject.getByTestId("congratulations-logo")).toBeInTheDocument();
      expect(subject.getByTestId("reg-toast")).toBeInTheDocument();
    });
  });

  it("does not show registration success toast when user is not authenticated and had not completed the registration process", async () => {
    const subject = setupHookWithAuth(IsAuthenticated.FALSE, "IN_PROGRESS");
    await waitFor(() => expect(subject.queryByTestId("reg-toast")).not.toBeInTheDocument());
  });

  it("shows duplicate registration error toast alert when user had failed the registration process", async () => {
    const subject = setupHookWithAuth(IsAuthenticated.FALSE, "DUPLICATE_ERROR");
    await waitFor(() => {
      expect(
        subject.getByText(markdownToText(Config.selfRegistration.errorTextDuplicateSignup))
      ).toBeInTheDocument();
      expect(
        subject.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
      ).not.toBeInTheDocument();
      expect(subject.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
    });
  });

  it("shows general registration error toast alert when user had failed the registration process", async () => {
    const subject = setupHookWithAuth(IsAuthenticated.FALSE, "RESPONSE_ERROR");
    await waitFor(() => {
      expect(subject.getByText(markdownToText(Config.selfRegistration.errorTextGeneric))).toBeInTheDocument();
      expect(
        subject.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
      ).not.toBeInTheDocument();
      expect(subject.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
    });
  });
});
