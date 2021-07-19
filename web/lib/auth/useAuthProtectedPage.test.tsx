import { withUser } from "@/test/helpers";
import { useRouter } from "next/router";
import { useAuthProtectedPage } from "./useAuthProtectedPage";
import { IsAuthenticated } from "./AuthContext";
import { render } from "@testing-library/react";

jest.mock("next/router");

describe("useAuthProtectedPage", () => {
  let mockPush: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockPush,
    });
  });

  const setupHookWithAuth = (isAuth: IsAuthenticated): void => {
    function TestComponent() {
      useAuthProtectedPage();
      return null;
    }
    render(withUser(<TestComponent />, { isAuthenticated: isAuth }));
  };

  it("redirects to homepage when user is not authed", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("does nothing when user is authed", () => {
    setupHookWithAuth(IsAuthenticated.TRUE);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("does nothing when we havent loaded auth state yet", () => {
    setupHookWithAuth(IsAuthenticated.UNKNOWN);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
