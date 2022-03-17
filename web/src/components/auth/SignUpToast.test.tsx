import { SignUpToast } from "@/components/auth/SignUpToast";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateUser, generateUserData } from "@/test/factories";
import { markdownToText, withAuthAlert } from "@/test/helpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, RenderResult, waitFor } from "@testing-library/react";
import React from "react";

jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router");
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;

describe("SignUpToast", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });
  const setAlertIsVisible = jest.fn();
  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, alertIsVisible = true): RenderResult => {
    return render(withAuthAlert(<SignUpToast />, isAuthenticated, { alertIsVisible, setAlertIsVisible }));
  };

  it("shows registration alert when user is in guest mode", async () => {
    const subject = setupHookWithAuth(IsAuthenticated.FALSE);
    await waitFor(() =>
      expect(subject.getByText(markdownToText(Config.navigationDefaults.guestAlertTitle))).toBeInTheDocument()
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
