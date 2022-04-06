import * as sessionHelper from "@/lib/auth/sessionHelper";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import { generateProfileData } from "@/test/factories";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import { ProfileDocuments } from "@businessnjgovnavigator/shared/";
import { act, render, waitFor } from "@testing-library/react";
import React from "react";

const mockGetSignedS3Link = (sessionHelper as jest.Mocked<typeof sessionHelper>).getSignedS3Link;

jest.mock("@/lib/auth/sessionHelper", () => ({
  getSignedS3Link: jest.fn((url) => `${url}`),
}));

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("useDocuments", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  const setupHook = (): {
    documents: ProfileDocuments | undefined;
    checkData: () => Promise<void>;
  } => {
    const returnVal = {
      documents: undefined,
      checkData: () => Promise.resolve(),
    };
    function TestComponent() {
      Object.assign(returnVal, useDocuments());
      return null;
    }
    render(<TestComponent />);
    return returnVal;
  };

  it("generates documents on load", async () => {
    useMockUserData({
      profileData: generateProfileData({
        documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
      }),
    });
    setupHook();
    await waitFor(() => expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3));
    expect(mockGetSignedS3Link).toBeCalledWith("whatever.pdf");
    expect(mockGetSignedS3Link).toBeCalledWith("zp.zip");
    expect(mockGetSignedS3Link).toBeCalledWith("lol.pdf");
  });

  it("regenerates documents when calling checkData", async () => {
    useMockUserData({
      profileData: generateProfileData({
        documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
      }),
    });
    const { checkData } = setupHook();
    checkData();
    await waitFor(() => expect(mockGetSignedS3Link).toHaveBeenCalledTimes(6));
  });

  it("regenerates documents every 15 minutes", async () => {
    jest.useFakeTimers();
    useMockUserData({
      profileData: generateProfileData({
        documents: { certifiedDoc: "zp.zip", formationDoc: "whatever.pdf", standingDoc: "lol.pdf" },
      }),
    });
    setupHook();
    await waitFor(() => expect(mockGetSignedS3Link).toHaveBeenCalledTimes(3));
    act(() => {
      jest.advanceTimersByTime(900000);
    });
    await waitFor(() => expect(mockGetSignedS3Link).toHaveBeenCalledTimes(6));
    act(() => {
      jest.advanceTimersByTime(900000);
    });
    await waitFor(() => expect(mockGetSignedS3Link).toHaveBeenCalledTimes(9));
  });
});
