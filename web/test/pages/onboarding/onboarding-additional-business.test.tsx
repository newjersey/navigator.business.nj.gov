import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { evalHeaderStepsTemplate } from "@/lib/utils/onboardingPageHelpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  currentUserData,
  setupStatefulUserDataContext,
} from "@/test/mock/withStatefulUserData";
import {
  composeOnBoardingTitle,
  mockSuccessfulApiSignups,
  renderPage,
} from "@/test/pages/onboarding/helpers-onboarding";
import { generateProfileData, generateUserData } from "@businessnjgovnavigator/shared";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { UserData, createEmptyBusiness } from "@businessnjgovnavigator/shared/userData";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postNewsletter: jest.fn(),
  postUserTesting: jest.fn(),
  postGetAnnualFilings: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const Config = getMergedConfig();
const { none: nexusNoneOfTheAboveCheckboxLabel } =
  Config.profileDefaults.fields.foreignBusinessTypeIds.default.optionContent;

describe("onboarding - additional business", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
    mockSuccessfulApiSignups();
    jest.useFakeTimers();
  });

  it("displays Additional keyword in header", async () => {
    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    renderPage({});

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({ query: { page: 1 } }, undefined, { shallow: true });
    });

    const expectedTitle = templateEval(Config.onboardingDefaults.pageTitle, { Additional: "Additional" });
    const step = evalHeaderStepsTemplate({ current: 1, previous: 1 });

    expect(screen.getByText(composeOnBoardingTitle(step, expectedTitle))).toBeInTheDocument();
  });

  it("returns user to previous business without saving", async () => {
    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    const initialBusiness = generateBusiness(generateUserData({}), {});
    const initialData = generateUserDataForBusiness(initialBusiness);
    renderPage({ userData: initialData });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({ query: { page: 1 } }, undefined, { shallow: true });
    });

    const previousBusinessName = getNavBarBusinessTitle(initialBusiness, IsAuthenticated.TRUE === "TRUE");
    const expectedText = templateEval(Config.onboardingDefaults.returnToPreviousBusiness, {
      previousBusiness: previousBusinessName,
    });

    fireEvent.click(screen.getByText(expectedText));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
    expect(currentUserData()).toEqual(initialData);
  });

  it("onboards and saves an additional empty business", async () => {
    const emptyBusiness = createEmptyBusiness();
    const initialBusiness = generateBusiness(generateUserData({}), {});
    const initialData = generateUserDataForBusiness(initialBusiness);
    expect(Object.keys(initialData.businesses)).toHaveLength(1);

    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    const { page } = renderPage({ userData: initialData });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({ query: { page: 1 } }, undefined, { shallow: true });
    });

    page.chooseRadio("business-persona-starting");
    await page.visitStep(2);

    const newBusinessId = currentBusiness().id;
    expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");
    page.selectByValue("Industry", "e-commerce");

    page.clickNext();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.dashboard,
        query: { [QUERIES.fromAdditionalBusiness]: "true" },
      });
    });

    expect(mockApi.postNewsletter).not.toHaveBeenCalled();
    expect(mockApi.postUserTesting).not.toHaveBeenCalled();

    const expectedUserData: UserData = {
      ...initialData,
      currentBusinessId: newBusinessId,
      businesses: {
        [initialBusiness.id]: initialBusiness,
        [newBusinessId]: {
          ...emptyBusiness,
          id: newBusinessId,
          onboardingFormProgress: "COMPLETED",
          profileData: {
            ...emptyBusiness.profileData,
            businessPersona: "STARTING",
            businessName: "",
            industryId: "e-commerce",
            sectorId: "retail-trade-and-ecommerce",
            homeBasedBusiness: undefined,
            municipality: undefined,
          },
        },
      },
    };

    expect(currentUserData()).toEqual(expectedUserData);
  });

  it("navigates to the unsupported page with additionalBusiness param when additional business is being added", async () => {
    const initialBusiness = generateBusiness(generateUserData({}), {
      profileData: generateProfileData({
        businessPersona: "STARTING",
      }),
      id: "initial-business-id",
    });
    const initialData = generateUserDataForBusiness(initialBusiness);

    useMockRouter({ isReady: true, query: { [QUERIES.additionalBusiness]: "true" } });

    const { page } = renderPage({ userData: initialData });

    await waitFor(() => {
      page.chooseRadio("business-persona-foreign");
    });
    await page.visitStep(2);

    page.checkByLabelText(nexusNoneOfTheAboveCheckboxLabel);
    act(() => {
      return page.clickNext();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.unsupported,
        query: { [QUERIES.additionalBusiness]: "true", [QUERIES.previousBusinessId]: "initial-business-id" },
      });
    });
  });
});
