import { AuthContext } from "@/contexts/authContext";
import { IntercomContext, IntercomContextType } from "@/contexts/intercomContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { UserDataProvider } from "@/lib/data-hooks/UserDataProvider";
import { useUserData } from "@/lib/data-hooks/useUserData";
import * as buildUserRoadmap from "@/lib/roadmap/buildUserRoadmap";
import { UserDataStorage, UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { UpdateQueue } from "@/lib/UpdateQueue";
import NJEDAFundingsOnboardingPage from "@/pages/njeda";
import { generateFunding, generateRoadmap } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { selectByValue } from "@/test/pages/profile/profile-helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { UserDataError } from "@businessnjgovnavigator/shared/types";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement, useState } from "react";
import { SWRConfig } from "swr";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  getUserData: jest.fn(),
  postUserData: jest.fn(),
}));
jest.mock("@/lib/roadmap/buildUserRoadmap", () => ({ buildUserRoadmap: jest.fn() }));
jest.mock("@/lib/utils/analytics-helpers", () => ({ setAnalyticsDimensions: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;
const mockBuildUserRoadmap = buildUserRoadmap as jest.Mocked<typeof buildUserRoadmap>;
const Config = getMergedConfig();

const LocalUserDataProbe = (): ReactElement => {
  const { business, userData } = useUserData();
  return (
    <div
      data-testid="local-user-data"
      data-user-id={userData?.user.id}
      data-sector-id={business?.profileData.sectorId}
    />
  );
};

interface TestAppProps {
  readonly children: ReactElement;
  readonly storage: UserDataStorage;
}

const TestApp = ({ children, storage }: TestAppProps): ReactElement => {
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue>();
  const [userDataError, setUserDataError] = useState<UserDataError>();
  const intercom: IntercomContextType = {
    setOperatingPhaseId: jest.fn(),
    setLegalStructureId: jest.fn(),
    setIndustryId: jest.fn(),
    setBusinessPersona: jest.fn(),
  };

  return (
    <SWRConfig value={{ provider: () => new Map(), shouldRetryOnError: false }}>
      <AuthContext.Provider
        value={{
          state: {
            activeUser: undefined,
            isAuthenticated: IsAuthenticated.UNKNOWN,
          },
          dispatch: jest.fn(),
        }}
      >
        <UpdateQueueContext.Provider value={{ updateQueue, setUpdateQueue }}>
          <UserDataErrorContext.Provider value={{ userDataError, setUserDataError }}>
            <RoadmapContext.Provider value={{ roadmap: undefined, setRoadmap: jest.fn() }}>
              <IntercomContext.Provider value={intercom}>
                <UserDataProvider userDataStorage={storage}>
                  <>
                    <LocalUserDataProbe />
                    {children}
                  </>
                </UserDataProvider>
              </IntercomContext.Provider>
            </RoadmapContext.Provider>
          </UserDataErrorContext.Provider>
        </UpdateQueueContext.Provider>
      </AuthContext.Provider>
    </SWRConfig>
  );
};

describe("NJEDA with UserDataProvider", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    mockBuildUserRoadmap.buildUserRoadmap.mockResolvedValue(generateRoadmap({}));
  });

  it("creates local user data and filters funding without authentication", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const storage = UserDataStorageFactory();
    const matchingFunding = generateFunding({
      agency: ["njeda"],
      sector: ["clean-energy"],
      employeesRequired: "n/a",
      homeBased: "yes",
      county: ["All"],
      name: "Matching funding",
    });
    const nonMatchingFunding = generateFunding({
      agency: ["other-agency"],
      sector: ["clean-energy"],
      employeesRequired: "n/a",
      homeBased: "yes",
      county: ["All"],
      name: "Other funding",
    });

    render(
      <ThemeProvider theme={createTheme()}>
        <TestApp storage={storage}>
          <NJEDAFundingsOnboardingPage fundings={[matchingFunding, nonMatchingFunding]} noAuth />
        </TestApp>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("local-user-data")).toHaveAttribute("data-user-id");
    });
    await user.click(
      screen.getByText(Config.fundingsOnboardingModal.nonProfitQuestion.responses.yes),
    );
    await user.type(screen.getByRole("textbox"), "2");
    selectByValue("Sector", "clean-energy");
    await user.click(screen.getByText(Config.fundingsOnboardingModal.saveButtonText));

    const storedUserData = storage.getCurrentUserData();
    expect(storedUserData?.businesses[storedUserData.currentBusinessId].profileData.sectorId).toBe(
      "clean-energy",
    );
    expect(screen.getByTestId(`${matchingFunding.id}-button`)).toBeInTheDocument();
    expect(screen.queryByTestId(`${nonMatchingFunding.id}-button`)).not.toBeInTheDocument();
    expect(mockApi.getUserData).not.toHaveBeenCalled();
    expect(mockApi.postUserData).not.toHaveBeenCalled();
    expect(consoleError.mock.calls.flat().join(" ")).not.toContain("Maximum update depth exceeded");

    consoleError.mockRestore();
  });
});
