import { SelfRegToast, UseAuthModal, UseAuthToast } from "@/components/SignUpDialogs";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateUser, generateUserData } from "@/test/factories";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";
import * as session from "../lib/auth/sessionHelper";

jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;
const mockSession = session as jest.Mocked<typeof session>;

describe("SignUpDialogs", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  describe("SelfRegToast", () => {
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
        expect(
          subject.getByText(markdownToText(Config.selfRegistration.errorTextGeneric))
        ).toBeInTheDocument();
        expect(
          subject.queryByText(markdownToText(Config.navigationDefaults.guestSuccessTitle))
        ).not.toBeInTheDocument();
        expect(subject.queryByTestId("congratulations-logo")).not.toBeInTheDocument();
      });
    });
  });

  describe("UseAuthToast", () => {
    const setAlertIsVisible = jest.fn();
    const setupHookWithAuth = (isAuthenticated: IsAuthenticated, alertIsVisible = true): RenderResult => {
      return render(withAuthAlert(<UseAuthToast />, isAuthenticated, { alertIsVisible, setAlertIsVisible }));
    };

    it("shows registration alert when user is in guest mode", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      await waitFor(() =>
        expect(
          subject.getByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
        ).toBeInTheDocument()
      );
    });

    it("is able to close registration alert when user is in guest mode", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      fireEvent.click(subject.getByLabelText("close"));
      await waitFor(() => expect(setAlertIsVisible).toBeCalledWith(false));
    });

    it("does not show registration alert when alertIsVisible is false", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE, false);
      await waitFor(() =>
        expect(
          subject.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
        ).not.toBeInTheDocument()
      );
    });

    it("does not show registration alert when user is authenticated", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.TRUE);
      await waitFor(() =>
        expect(
          subject.queryByText(markdownToText(Config.navigationDefaults.guestAlertTitle))
        ).not.toBeInTheDocument()
      );
    });

    it("goes to self-reg when link is clicked", async () => {
      const user = generateUser({ name: undefined, email: "test@example.com" });
      const userData = generateUserData({ user });
      useMockUserData(userData);
      mockApi.postSelfReg.mockResolvedValue({
        authRedirectURL: "www.example.com",
        userData,
      });
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      fireEvent.click(subject.getByText(markdownToText(Config.navigationDefaults.guestAlertBody)));

      await waitFor(() => {
        expect(mockApi.postSelfReg).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalled();
      });
    });
  });

  describe("UseAuthModal", () => {
    const setModalIsVisible = jest.fn();

    const setupHookWithAuth = (isAuthenticated: IsAuthenticated, modalIsVisible = true): RenderResult => {
      return render(withAuthAlert(<UseAuthModal />, isAuthenticated, { modalIsVisible, setModalIsVisible }));
    };

    it("shows registration alert when user is in guest mode", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      await waitFor(() =>
        expect(subject.getByText(Config.navigationDefaults.guestModalBody)).toBeInTheDocument()
      );
    });

    it("does not show registration modal when user is in guest mode and it's disabled", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE, false);
      await waitFor(() =>
        expect(subject.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument()
      );
    });

    it("returns user to previous page when modal is closed", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      fireEvent.click(subject.getByLabelText("close"));
      await waitFor(() => {
        expect(setModalIsVisible).toHaveBeenCalledWith(false);
      });
    });

    it("does not show registration alert when user is in authenticated", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.TRUE);
      await waitFor(() =>
        expect(subject.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument()
      );
    });

    it("goes to self-reg when link is clicked", async () => {
      const user = generateUser({ name: undefined, email: "test@example.com" });
      const userData = generateUserData({ user });
      useMockUserData(userData);
      mockApi.postSelfReg.mockResolvedValue({
        authRedirectURL: "www.example.com",
        userData,
      });
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      fireEvent.click(subject.getByText(Config.navigationDefaults.guestModalButtonText));

      await waitFor(() => {
        expect(mockApi.postSelfReg).toHaveBeenCalled();
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it("goes to myNJ when Log-in link is clicked", async () => {
      const subject = setupHookWithAuth(IsAuthenticated.FALSE);
      fireEvent.click(subject.getByText(markdownToText(Config.navigationDefaults.guestModalSubText)));
      await waitFor(() => {
        expect(mockSession.triggerSignIn).toHaveBeenCalled();
      });
    });
  });
});
