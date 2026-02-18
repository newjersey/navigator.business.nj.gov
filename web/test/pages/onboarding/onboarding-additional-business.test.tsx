import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { templateEval } from "@/lib/utils/helpers";
import { evalHeaderStepsTemplate } from "@/lib/utils/onboardingPageHelpers";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockConfig } from "@/test/mock/mockUseConfig";
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
import { generateProfileData } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { createEmptyBusiness, UserData } from "@businessnjgovnavigator/shared/userData";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
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
    useMockConfig();
    setupStatefulUserDataContext();
    mockSuccessfulApiSignups();
  });

  it("displays Additional keyword in header", async () => {
    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    renderPage({});

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ page: 1 }) }),
        undefined,
        { shallow: true },
      );
    });

    const expectedTitle = templateEval(Config.onboardingDefaults.pageTitle, {
      Additional: "Additional",
    });
    const step = evalHeaderStepsTemplate({ current: 1, previous: 1 });

    expect(screen.getByText(composeOnBoardingTitle(step, expectedTitle))).toBeInTheDocument();
  });

  it("returns user to previous business without saving", async () => {
    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    const initialBusiness = generateBusiness({});
    const initialData = generateUserDataForBusiness(initialBusiness);
    renderPage({ userData: initialData });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ page: 1 }) }),
        undefined,
        { shallow: true },
      );
    });

    const previousBusinessName = getNavBarBusinessTitle(
      initialBusiness,
      IsAuthenticated.TRUE === "TRUE",
    );
    const expectedText = templateEval(Config.onboardingDefaults.returnToPreviousBusiness, {
      previousBusiness: previousBusinessName,
    });

    await userEvent.click(screen.getByText(expectedText));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(ROUTES.dashboard);
    });
    expect(currentUserData()).toEqual(initialData);
  });

  it("onboards and saves an additional empty business", async () => {
    const userId = "user-id";
    const emptyBusiness = createEmptyBusiness({ userId: userId });
    const initialBusiness = generateBusiness({ userId: userId });
    const initialData = generateUserDataForBusiness(initialBusiness);
    expect(Object.keys(initialData.businesses)).toHaveLength(1);

    useMockRouter({ isReady: true, query: { additionalBusiness: "true" } });
    const { page } = renderPage({ userData: initialData });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.objectContaining({ query: expect.objectContaining({ page: 1 }) }),
        undefined,
        { shallow: true },
      );
    });

    await page.chooseRadio("business-persona-starting");
    await page.visitStep(2);

    const newBusinessId = currentBusiness().id;
    expect(currentBusiness().profileData.businessPersona).toEqual("STARTING");
    // React 19: selectByValue is now async for proper state handling
    await page.selectByValue("Industry", "e-commerce");

    await page.clickNext();

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

    expect(currentUserData()).toEqual(
      expect.objectContaining({
        ...expectedUserData,
        businesses: expect.objectContaining({
          [initialBusiness.id]: initialBusiness,
          [newBusinessId]: expect.objectContaining({
            ...expectedUserData.businesses[newBusinessId],
            dateCreatedISO: expect.any(String),
            lastUpdatedISO: expect.any(String),
          }),
        }),
      }),
    );
  });

  it("navigates to the unsupported page with additionalBusiness param when additional business is being added", async () => {
    const initialBusiness = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
      }),
      id: "initial-business-id",
    });
    const initialData = generateUserDataForBusiness(initialBusiness);

    useMockRouter({ isReady: true, query: { [QUERIES.additionalBusiness]: "true" } });

    const { page } = renderPage({ userData: initialData });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        {
          pathname: expect.any(String),
          query: { additionalBusiness: "true", page: 1 },
        },
        undefined,
        { shallow: true },
      );
    });

    await page.chooseRadio("business-persona-foreign");
    await page.visitStep(2);

    // Wait for the checkbox to be available, then click it
    const checkbox = await screen.findByLabelText(nexusNoneOfTheAboveCheckboxLabel);
    await userEvent.click(checkbox);

    await page.clickNext();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: ROUTES.unsupported,
        query: {
          [QUERIES.additionalBusiness]: "true",
          [QUERIES.previousBusinessId]: "initial-business-id",
        },
      });
    });
  });
});
