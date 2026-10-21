import * as session from "@/lib/auth/sessionHelper";
import LoginProfileNJPage, { getStaticProps } from "@/pages/login-profile-nj";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { render, waitFor } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerProfileNJSignIn: jest.fn() }));

const mockSession = session as jest.Mocked<typeof session>;

describe("login-profile-nj page", () => {
  const originalFlag = process.env.FEATURE_PROFILE_NJ_LOGIN;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
    mockSession.triggerProfileNJSignIn.mockResolvedValue();
  });

  afterEach(() => {
    if (originalFlag === undefined) {
      delete process.env.FEATURE_PROFILE_NJ_LOGIN;
    } else {
      process.env.FEATURE_PROFILE_NJ_LOGIN = originalFlag;
    }
  });

  it("starts the ProfileNJ sign-in once on mount", async () => {
    render(<LoginProfileNJPage />);
    await waitFor(() => {
      expect(mockSession.triggerProfileNJSignIn).toHaveBeenCalledTimes(1);
    });
  });

  it("logs the error when starting the ProfileNJ sign-in fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const failure = new Error("redirect failed");
    mockSession.triggerProfileNJSignIn.mockRejectedValue(failure);

    render(<LoginProfileNJPage />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to start ProfileNJ sign-in", failure);
    });
    consoleErrorSpy.mockRestore();
  });

  it("is not found when the flag is unset", () => {
    delete process.env.FEATURE_PROFILE_NJ_LOGIN;
    expect(getStaticProps()).toEqual({ notFound: true });
  });

  it("is not found when the flag is false", () => {
    process.env.FEATURE_PROFILE_NJ_LOGIN = "false";
    expect(getStaticProps()).toEqual({ notFound: true });
  });

  it("renders without auth when the flag is true", () => {
    process.env.FEATURE_PROFILE_NJ_LOGIN = "true";
    expect(getStaticProps()).toEqual({ props: { noAuth: true } });
  });
});
