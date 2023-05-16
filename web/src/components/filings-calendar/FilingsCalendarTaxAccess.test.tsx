import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  FormationData,
  FormationLegalType,
  generateUserData,
  getCurrentDateISOString,
  OperatingPhases,
  UserData,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFilingData,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { createTheme, ThemeProvider } from "@mui/material";
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
let setRegistrationModalIsVisible: jest.Mock;

const renderFilingsCalendarTaxAccess = (initialUserData?: UserData): void => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const renderUnauthenticatedFilingsCalendarTaxAccess = (initialUserData?: UserData): void => {
  render(
    withAuthAlert(
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>,
      IsAuthenticated.FALSE,
      { registrationModalIsVisible: false, setRegistrationModalIsVisible }
    )
  );
};

describe("<FilingsCalendarTaxAccess />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({ onboardingFormProgress: "COMPLETED" });
    setRegistrationModalIsVisible = jest.fn();
    setupStatefulUserDataContext();
    useMockRouter({});
  });

  const generateTaxFilingUserData = (params: {
    publicFiling: boolean;
    formedInNavigator?: boolean;
    businessName?: string;
    responsibleOwnerName?: string;
    taxId?: string;
  }): UserData => {
    const legalStructureId = randomLegalStructure({ requiresPublicFiling: params.publicFiling }).id;

    let formationData: FormationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
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

    return generateUserData({
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
      }),
      formationData: formationData,
      taxFilingData: generateTaxFilingData({ state: undefined }),
    });
  };

  describe("guest mode / query param behavior", () => {
    it("opens the sign up modal when button is clicked in up and running guest mode", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });

      renderUnauthenticatedFilingsCalendarTaxAccess(userData);
      openModal();
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
      await waitFor(() => {
        return expect(setRegistrationModalIsVisible).toHaveBeenCalledWith(true);
      });
    });

    it("updates userData with return link when the button is clicked in up and running guest mode", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });
      renderUnauthenticatedFilingsCalendarTaxAccess(userData);
      openModal();
      await waitFor(() => {
        return expect(currentUserData().preferences.returnToLink).toEqual(
          `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`
        );
      });
    });

    it("opens tax modal if the query parameter openTaxFilingsModal is true and shallow reloads", async () => {
      const userData = generateUserData({
        profileData: generateProfileData({
          operatingPhase: "GUEST_MODE_OWNING",
        }),
      });
      useMockRouter({ query: { openTaxFilingsModal: "true" }, isReady: true });
      renderFilingsCalendarTaxAccess(userData);
      await screen.findByTestId("modal-content");
      expect(mockPush).toHaveBeenCalledWith({ pathname: ROUTES.dashboard }, undefined, { shallow: true });
    });
  });

  const userDataWithPrefilledFields = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "123456789123",
    businessName: "MrFakesHotDogBonanza",
  });

  const pendingStateUserData = {
    ...userDataWithPrefilledFields,
    taxFilingData: generateTaxFilingData({
      registeredISO: getCurrentDateISOString(),
      state: "PENDING",
    }),
  };

  it("opens tax access modal when on button click", () => {
    renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
    fireEvent.click(screen.getByTestId("get-tax-access"));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
  });

  it("displays alert on success", async () => {
    mockApi.postTaxFilingsOnboarding.mockResolvedValue({
      ...userDataWithPrefilledFields,
      taxFilingData: generateTaxFilingData({
        state: "SUCCESS",
        registeredISO: getCurrentDateISOString(),
      }),
    });

    renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
    openModal();
    clickSave();
    await waitFor(() => {
      return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
    });
    await screen.findByTestId("tax-success");
    expect(screen.getByText(Config.taxCalendar.snackbarSuccessHeader)).toBeInTheDocument();
  });

  describe("different taxFiling states and update behavior", () => {
    it("does not do taxFiling lookup on page load if not registered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          registeredISO: undefined,
        }),
      });
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
    });

    it("does taxFiling lookup on page load if registered", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue(userDataWithPrefilledFields);
      renderFilingsCalendarTaxAccess({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          registeredISO: getCurrentDateISOString(),
        }),
      });
      expect(mockApi.postTaxFilingsLookup).toHaveBeenCalled();
      await waitFor(() => {
        return expect(userDataUpdatedNTimes()).toEqual(1);
      });
    });

    it("shows button component when state is FAILED and unregistered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          registeredISO: undefined,
          errorField: undefined,
        }),
      });
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("shows button component when state is undefined and unregistered", async () => {
      renderFilingsCalendarTaxAccess({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: undefined,
          registeredISO: undefined,
        }),
      });
      expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.getByTestId("button-container")).toBeInTheDocument();
    });

    it("hides pending and button components when state is SUCCESS", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue({
        ...pendingStateUserData,
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
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("hides pending and button components when state is API_ERROR but registered", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue({
        ...pendingStateUserData,
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
        return expect(currentUserData().taxFilingData.state).toEqual("API_ERROR");
      });
      expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("button-container")).not.toBeInTheDocument();
    });

    it("shows registration followup component when state is SUCCESS but it's before the Saturday after registration", async () => {
      mockApi.postTaxFilingsLookup.mockResolvedValue({
        ...pendingStateUserData,
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
        return expect(currentUserData().taxFilingData.state).toEqual("PENDING");
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
