import { renderWithUser } from "../../test/helpers";
import { BusinessUser } from "../types/types";
import { generateUser } from "../../test/factories";
import { useRouter } from "next/router";
import { useAuthProtectedPage } from "./useAuthProtectedPage";

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

  const setupHookWithUser = (currentUser: BusinessUser | undefined): void => {
    function TestComponent() {
      useAuthProtectedPage();
      return null;
    }
    renderWithUser(<TestComponent />, currentUser, jest.fn());
  };

  it("redirects to homepage when user is not authed", () => {
    setupHookWithUser(undefined);
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("does nothing when user is authed", () => {
    const currentUser = generateUser({});
    setupHookWithUser(currentUser);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
