import { SignUpModal } from "@/components/auth/SignUpModal";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
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
const mockSession = session as jest.Mocked<typeof session>;

describe("SignUpModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
  });

  const setModalIsVisible = jest.fn();

  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, modalIsVisible = true): RenderResult => {
    return render(withAuthAlert(<SignUpModal />, isAuthenticated, { modalIsVisible, setModalIsVisible }));
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
