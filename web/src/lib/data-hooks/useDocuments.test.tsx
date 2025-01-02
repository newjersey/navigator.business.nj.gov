import * as sessionHelper from "@/lib/auth/sessionHelper";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import { useMockBusiness, useMockProfileData } from "@/test/mock/mockUseUserData";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";
import { act, render, waitFor } from "@testing-library/react";

const mockGetSignedS3Link = (sessionHelper as vi.Mocked<typeof sessionHelper>).getSignedS3Link;

vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/auth/sessionHelper", () => ({
  getSignedS3Link: vi.fn((url) => `${url}`),
}));

describe("useDocuments", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockBusiness({});
  });

  const setupHook = (): {
    documents: ProfileDocuments | undefined;
    checkData: () => Promise<void>;
  } => {
    const returnVal = {
      documents: undefined,
      checkData: (): Promise<void> => {
        return Promise.resolve();
      },
    };
    function TestComponent(): null {
      Object.assign(returnVal, useDocuments());
      return null;
    }
    render(<TestComponent />);
    return returnVal;
  };

  it("generates documents on load", async () => {
    useMockProfileData({
      documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
    });
    setupHook();
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3);
    });
    expect(mockGetSignedS3Link).toHaveBeenCalledWith("whatever.pdf");
    expect(mockGetSignedS3Link).toHaveBeenCalledWith("zp.zip");
    expect(mockGetSignedS3Link).toHaveBeenCalledWith("lol.pdf");
  });

  it("regenerates documents when calling checkData", async () => {
    useMockProfileData({
      documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
    });
    const { checkData } = setupHook();
    checkData();
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(6);
    });
  });

  it("regenerates documents every 15 minutes", async () => {
    vi.useFakeTimers();
    useMockProfileData({
      documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
    });
    act(() => {
      setupHook();
    });
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3);
    });
    act(() => {
      vi.advanceTimersByTime(900000);
    });
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(6);
    });
    act(() => {
      vi.advanceTimersByTime(900000);
    });
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(9);
    });
  });

  it("does not regenerate documents before 15 minutes", async () => {
    vi.useFakeTimers();
    useMockProfileData({
      documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
    });
    act(() => {
      setupHook();
    });
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3);
    });
    act(() => {
      vi.advanceTimersByTime(840000);
    });
    await waitFor(() => {
      return expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3);
    });
  });
});
