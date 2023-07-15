import { SignUpModal } from "@/components/auth/SignUpModal";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness, useMockUserData } from "@/test/mock/mockUseUserData";
import { generateUser, generateUserData } from "@businessnjgovnavigator/shared";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;
const mockSession = session as jest.Mocked<typeof session>;

describe("SignUpModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setRegistrationModalIsVisible = jest.fn();

  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, registrationModalIsVisible = true): void => {
    render(
      withAuthAlert(<SignUpModal />, isAuthenticated, {
        registrationModalIsVisible,
        setRegistrationModalIsVisible,
      })
    );
  };

  it("shows registration alert when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByText(Config.navigationDefaults.guestModalBody)).toBeInTheDocument();
  });

  it("does not show registration modal when user is in guest mode and it's disabled", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, false);
    expect(screen.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument();
  });

  it("returns user to previous page when modal is closed", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByLabelText("close"));
    expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(false);
  });

  it("does not show registration alert when user is in authenticated", () => {
    setupHookWithAuth(IsAuthenticated.TRUE);
    expect(screen.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument();
  });

  it("goes to self-reg when link is clicked", async () => {
    const user = generateUser({ name: undefined, email: "test@example.com" });
    const userData = generateUserData({ user });
    useMockUserData(userData);
    mockApi.postSelfReg.mockResolvedValue({
      authRedirectURL: "www.example.com",
      userData,
    });
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(Config.navigationDefaults.guestModalButtonText));
    await waitFor(() => {
      expect(mockApi.postSelfReg).toHaveBeenCalled();
    });
    expect(mockPush).toHaveBeenCalled();
  });

  it("goes to myNJ when Log-in link is clicked", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(markdownToText(Config.navigationDefaults.guestModalSubText)));
    expect(mockSession.triggerSignIn).toHaveBeenCalled();
  });
});
