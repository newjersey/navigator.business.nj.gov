import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { randomPublicFilingLegalType } from "@/test/factories";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import {
  WithStatefulUserData,
  currentBusiness,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
} from "@/test/mock/withStatefulUserData";
import {
  Business,
  FormationData,
  FormationLegalType,
  OperatingPhases,
  UserData,
  createEmptyFormationFormData,
  generateBusiness,
  generateUserData,
  generateUserDataForBusiness,
  getCurrentDateISOString,
} from "@businessnjgovnavigator/shared";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { ThemeProvider, createTheme } from "@mui/material";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxFilingsOnboarding: jest.fn(),
  postTaxFilingsLookup: jest.fn(),
}));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

const Config = getMergedConfig();
let setShowNeedsAccountModal: jest.Mock;
const userData = generateUserData({});

const renderFilingsCalendarTaxAccess = (initialUserData?: UserData): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const renderUnauthenticatedFilingsCalendarTaxAccess = (business: Business): void => {
  render(
    withNeedsAccountContext(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(business)}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>,
      IsAuthenticated.FALSE,
      { showNeedsAccountModal: false, setShowNeedsAccountModal }
    )
  );
};

const modifyUserData = (userData: UserData, overrides: Partial<Business>): UserData => {
  return {
    ...userData,
    businesses: {
      ...userData.businesses,
      [userData.currentBusinessId]: {
        ...userData.businesses[userData.currentBusinessId],
        ...overrides,
      },
    },
  };
};

const mockApiResponse = (userData: UserData, overrides: Partial<Business>): void => {
  mockApi.postTaxFilingsLookup.mockResolvedValue(modifyUserData(userData, overrides));
};

describe("<FilingsCalendarTaxAccess />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setShowNeedsAccountModal = jest.fn();
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  const generateTaxFilingUserData = (params: {
    publicFiling: boolean;
    formedInNavigator?: boolean;
    businessName?: string;
    responsibleOwnerName?: string;
    taxId?: string;
    municipalityName?: string;
  }): UserData => {
    const legalStructureId = params.publicFiling
      ? randomPublicFilingLegalType()
      : randomLegalStructure({ requiresPublicFiling: false }).id;

    let formationData: FormationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };

    if (params.publicFiling) {
      formationData = generateFormationData(
        {
          completedFilingPayment: !!params.formedInNavigator,
          getFilingResponse: generateGetFilingResponse({ success: params.formedInNavigator }),
        },
        legalStructureId as FormationLegalType
      );
    }

    return generateUserDataForBusiness(
      generateBusiness(userData, {
        profileData: generateProfileData({
          legalStructureId: legalStructureId,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton;
            })
          ).id,
          taxId: params.taxId ? `*${params.taxId.slice(1)}` : "",
          encryptedTaxId: params.taxId ? `encrypted-${params.taxId}` : "",
          businessName: params.businessName || "",
          responsibleOwnerName: params.responsibleOwnerName || "",
          municipality: params.municipalityName
            ? { name: params.municipalityName, county: "", id: "", displayName: "" }
            : undefined,
        }),
        formationData: formationData,
        taxFilingData: generateTaxFilingData({ state: undefined }),
      })
    );
  };

  describe("guest mode / query param behavior", () => {
    it("opens the Needs Account modal when button is clicked in up and running guest mode", async () => {
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        }),
      });

      renderUnauthenticatedFilingsCalendarTaxAccess(business);
      openModal();
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
      await waitFor(() => {
        return expect(setShowNeedsAccountModal).toHaveBeenCalledWith(true);
      });
    });

    it("updates userData with return link when the button is clicked in up and running guest mode", async () => {
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        }),
      });
      renderUnauthenticatedFilingsCalendarTaxAccess(business);
      openModal();
      await waitFor(() => {
        return expect(currentBusiness().preferences.returnToLink).toEqual(
          `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`
        );
      });
    });

    it("opens tax modal if the query parameter openTaxFilingsModal is true and shallow reloads", async () => {
      const business = generateBusiness(userData, {
        profileData: generateProfileData({
          operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
        }),
      });
      const userDataForBusiness = generateUserDataForBusiness(business);
      useMockRouter({ query: { openTaxFilingsModal: "true" }, isReady: true });
      renderFilingsCalendarTaxAccess(userDataForBusiness);
      await screen.findByTestId("modal-content");
      expect(mockPush).toHaveBeenCalledWith({ pathname: ROUTES.dashboard }, undefined, { shallow: true });
    });
  });

  const userDataWithPrefilledFields = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "123456789123",
    businessName: "MrFakesHotDogBonanza",
  });

  const pendingStateUserData: UserData = modifyUserData(userDataWithPrefilledFields, {
    taxFilingData: generateTaxFilingData({
      registeredISO: getCurrentDateISOString(),
      state: "PENDING",
    }),
  });

  it("opens tax access modal when on button click", () => {
    renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("displays alert on success", async () => {
    mockApi.postTaxFilingsOnboarding.mockResolvedValue(
      modifyUserData(userDataWithPrefilledFields, {
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      })
    );

    renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
    openModal();
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().taxFilingData.state).toEqual("SUCCESS");
    });
    await screen.findByTestId("tax-success");
    expect(screen.getByText(Config.taxCalendar.snackbarSuccessHeader)).toBeInTheDocument();
  });

  it("closes the success alert when the close button is clicked", async () => {
    mockApi.postTaxFilingsOnboarding.mockResolvedValue(
      modifyUserData(userDataWithPrefilledFields, {
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      })
    );

    renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
    openModal();
    clickSave();
    await waitFor(() => {
      return expect(currentBusiness().taxFilingData.state).toEqual("SUCCESS");
    });
    await screen.findByTestId("tax-success");
    expect(screen.getByText(Config.taxCalendar.snackbarSuccessHeader)).toBeInTheDocument();
    expect(screen.getByTestId("close-icon-button")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-icon-button"));
    await waitFor(() => {
      expect(screen.queryByText(Config.taxCalendar.snackbarSuccessHeader)).not.toBeInTheDocument();
    });
  });

  describe("different taxFiling states and update behavior", () => {
    it("does not do taxFiling lookup on page load if not registered", async () => {
      renderFilingsCalendarTaxAccess(
        modifyUserData(userDataWithPrefilledFields, {
          taxFilingData: generateTaxFilingData({
            registeredISO: undefined,
          }),
        })
      );
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
    });

    it("does taxFiling lookup on page load if registered", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue(userDataWithPrefilledFields);
      renderFilingsCalendarTaxAccess(
        modifyUserData(userDataWithPrefilledFields, {
          taxFilingData: generateTaxFilingData({
            registeredISO: getCurrentDateISOString(),
          }),
        })
      );

      expect(mockApi.postTaxFilingsLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
    });

    it("shows button component when state is FAILED and unregistered", async () => {
      renderFilingsCalendarTaxAccess(
        modifyUserData(userDataWithPrefilledFields, {
          taxFilingData: generateTaxFilingData({
            state: "FAILED",
            registeredISO: undefined,
            errorField: undefined,
          }),
        })
      );
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("shows button component when state is undefined and unregistered", async () => {
      renderFilingsCalendarTaxAccess(
        modifyUserData(userDataWithPrefilledFields, {
          taxFilingData: generateTaxFilingData({
            state: undefined,
            registeredISO: undefined,
          }),
        })
      );
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("hides pending and button components when state is SUCCESS", async () => {
      mockApiResponse(pendingStateUserData, {
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          state: "SUCCESS",
        }),
      });

      renderFilingsCalendarTaxAccess(pendingStateUserData);

      expect(mockApi.postTaxFilingsLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentBusiness().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("hides pending and button components when state is API_ERROR but registered", async () => {
      mockApiResponse(pendingStateUserData, {
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
          state: "API_ERROR",
        }),
      });

      renderFilingsCalendarTaxAccess(pendingStateUserData);

      expect(mockApi.postTaxFilingsLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentBusiness().taxFilingData.state).toEqual("API_ERROR");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("shows registration followup component when state is SUCCESS but it's before the Saturday after registration", async () => {
      mockApiResponse(pendingStateUserData, {
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });
      renderFilingsCalendarTaxAccess(pendingStateUserData);

      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      expect(screen.queryByTestId("get-tax-access")).not.toBeInTheDocument();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("alert-content-container")).toBeInTheDocument();
    });

    it("shows pending component when state is PENDING", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue(pendingStateUserData);
      renderFilingsCalendarTaxAccess(pendingStateUserData);

      expect(mockApi.postTaxFilingsLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
      await waitFor(() => {
        return expect(currentBusiness().taxFilingData.state).toEqual("PENDING");
      });
      expect(screen.getByTestId("pending-container")).toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("alert-content-container")).not.toBeInTheDocument();
    });
  });

  const openModal = (): void => {
    fireEvent.click(screen.getByTestId("get-tax-access"));
  };

  const clickSave = (): void => {
    fireEvent.click(screen.getByTestId("modal-button-primary"));
  };
});
