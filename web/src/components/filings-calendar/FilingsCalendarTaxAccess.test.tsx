import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import {
  generateFormationData,
  generateGetFilingResponse,
  generateProfileData,
  generateTaxFilingData,
  generateUserData,
  randomLegalStructure,
} from "@/test/factories";
import { withAuthAlert } from "@/test/helpers/helpers-renderers";
import { markdownToText, randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import {
  currentUserData,
  setupStatefulUserDataContext,
  userDataUpdatedNTimes,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  FormationData,
  FormationLegalType,
  getCurrentDateISOString,
  OperatingPhases,
  UserData,
} from "@businessnjgovnavigator/shared";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

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

const renderFilingsCalendarTaxAccess = (initialUserData?: UserData) => {
  render(
    <ThemeProvider theme={createTheme()}>
      <WithStatefulUserData initialUserData={initialUserData}>
        <FilingsCalendarTaxAccess />
      </WithStatefulUserData>
    </ThemeProvider>
  );
};

const renderUnauthenticatedFilingsCalendarTaxAccess = (initialUserData?: UserData) => {
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
    useMockUserData({});
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

  describe("when PublicFiling", () => {
    const userDataWithPrefilledFields = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "123456789123",
      businessName: "MrFakesHotDogBonanza",
    });

    const userDataMissingTaxId = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "",
      businessName: "MrFakesHotDogBonanza",
    });

    const userDataMissingBusinessName = generateTaxFilingUserData({
      publicFiling: true,
      taxId: "123456789123",
      businessName: "",
    });

    const taxIdDisplayFormat = "*23-456-789/123";

    sharedTestsWhenAllFieldsPrefilled(userDataWithPrefilledFields);

    it("pre-populates fields with userData values", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();
      expect((screen.queryByLabelText("Business name") as HTMLInputElement)?.value).toEqual(
        "MrFakesHotDogBonanza"
      );
      expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual(taxIdDisplayFormat);
    });

    it("does not show disclaimer text for TaxId", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();

      const taxInput = screen.getByTestId("taxIdInput");
      expect(within(taxInput).getByTestId("description")).toBeInTheDocument();
      expect(within(taxInput).queryByTestId("postDescription")).not.toBeInTheDocument();
    });

    it("does not lock businessName even if they have completed formation with us", () => {
      const userDataWithNavigatorFormation = generateTaxFilingUserData({
        publicFiling: true,
        formedInNavigator: true,
        taxId: "123456789123",
        businessName: "MrFakesHotDogBonanza",
      });

      renderFilingsCalendarTaxAccess(userDataWithNavigatorFormation);
      openModal();

      expect(screen.getByText(Config.profileDefaults.fields.businessName.default.header)).toBeInTheDocument();
      fireEvent.change(screen.getByTestId("businessName"), { target: { value: "MrFakesHotDogBonanza" } });
    });

    it("updates taxId but not BusinessName on submit", async () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          businessName: userDataWithPrefilledFields.profileData.businessName,
        }),
      });
      openModal();
      fireEvent.change(screen.getByLabelText("Business name"), {
        target: { value: "zoom" },
      });
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "999888777666" },
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().profileData.businessName).not.toEqual("zoom");
      });
      await waitFor(() => {
        return expect(currentUserData().profileData.taxId).toEqual("999888777666");
      });
      await waitFor(() => {
        return expect(currentUserData().profileData.encryptedTaxId).toEqual(undefined);
      });
    });

    it("displays in-line error and alert when businessName field is empty and save button is clicked", async () => {
      renderFilingsCalendarTaxAccess(userDataMissingBusinessName);
      openModal();
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxCalendar.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedTaxIdHelper)).not.toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when taxId field is empty and save button is clicked", async () => {
      renderFilingsCalendarTaxAccess(userDataMissingTaxId);
      openModal();
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when businessName field and taxId field is invalid and save button is clicked", async () => {
      const userDataMissingBoth = generateTaxFilingUserData({
        publicFiling: true,
        taxId: "123",
        businessName: "",
      });

      renderFilingsCalendarTaxAccess(userDataMissingBoth);
      openModal();
      clickSave();
      await waitFor(() => {
        return expect(userDataWasNotUpdated()).toEqual(true);
      });
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxCalendar.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays inline errors when api failed", async () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED" }),
        });
      });
      openModal();
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("FAILED");
      });
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(
        screen.queryByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)
      ).not.toBeInTheDocument();
    });

    it("states business name specific field error in alert if api fails", async () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: "businessName" }),
        });
      });
      openModal();
      clickSave();
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByText(Config.taxCalendar.failedBusinessFieldHelper)).toBeInTheDocument();
      expect(
        screen.queryByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)
      ).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedTaxIdHelper)).not.toBeInTheDocument();
    });

    it("displays error when the businessName field is empty on blur", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();
      fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Business name"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedBusinessFieldHelper)).toBeInTheDocument();
    });

    it("submits taxId and businessName to api", async () => {
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
      expect(mockApi.postTaxFilingsOnboarding).toHaveBeenCalledWith({
        taxId: userDataWithPrefilledFields.profileData.taxId,
        businessName: userDataWithPrefilledFields.profileData.businessName,
        encryptedTaxId: userDataWithPrefilledFields.profileData.encryptedTaxId,
      });
    });
  });

  describe("when TradeName", () => {
    const userDataWithPrefilledFields = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "123456789123",
      responsibleOwnerName: "FirstName LastName",
    });

    const userDataMissingTaxId = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "",
      responsibleOwnerName: "FirstName LastName",
    });

    const userDataMissingResponsibleOwnerName = generateTaxFilingUserData({
      publicFiling: false,
      taxId: "123456789123",
      responsibleOwnerName: "",
    });

    const taxIdDisplayFormat = "*23-456-789/123";

    sharedTestsWhenAllFieldsPrefilled(userDataWithPrefilledFields);

    it("pre-populates fields with userData values", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();
      expect((screen.queryByLabelText("Responsible owner name") as HTMLInputElement)?.value).toEqual(
        "FirstName LastName"
      );
      expect((screen.queryByLabelText("Tax id") as HTMLInputElement)?.value).toEqual(taxIdDisplayFormat);
    });

    it("shows disclaimer text for TaxId", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();

      expect(screen.getByText(Config.taxCalendar.modalHeader)).toBeInTheDocument();

      const taxInput = screen.getByTestId("taxIdInput");
      expect(within(taxInput).getByTestId("description")).toBeInTheDocument();
      expect(within(taxInput).getByTestId("postDescription")).toBeInTheDocument();
    });

    it("updates taxId and responsibleOwnerName on submit", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userDataWithPrefilledFields,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
        }),
      });

      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);

      openModal();
      fireEvent.change(screen.getByLabelText("Responsible owner name"), {
        target: { value: "zoom" },
      });
      fireEvent.change(screen.getByLabelText("Tax id"), {
        target: { value: "123456789000" },
      });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().profileData.responsibleOwnerName).toEqual("zoom");
      });
      await waitFor(() => {
        return expect(currentUserData().profileData.taxId).toEqual("123456789000");
      });
    });

    it("displays in-line error and alert when responsibleOwnerName field is empty and save button is clicked", () => {
      renderFilingsCalendarTaxAccess(userDataMissingResponsibleOwnerName);
      openModal();
      clickSave();

      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);

      expect(screen.getByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedTaxIdHelper)).not.toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();

      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when taxId field is empty and save button is clicked", () => {
      renderFilingsCalendarTaxAccess(userDataMissingTaxId);
      openModal();
      clickSave();
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
      expect(
        screen.queryByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)
      ).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays in-line error and alert when responsibleOwnerName field and taxId field is invalid and save button is clicked", () => {
      const userDataMissingBoth = generateTaxFilingUserData({
        publicFiling: false,
        taxId: "",
        responsibleOwnerName: "",
      });

      renderFilingsCalendarTaxAccess(userDataMissingBoth);
      openModal();
      clickSave();
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalErrorHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByRole("alert")).not.toHaveTextContent(Config.taxCalendar.modalBusinessFieldErrorName);

      expect(screen.getByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();

      expect(mockApi.postTaxFilingsOnboarding).not.toHaveBeenCalled();
    });

    it("displays error when the responsibleOwnerName field is empty on blur", () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      openModal();
      fireEvent.change(screen.getByLabelText("Responsible owner name"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Responsible owner name"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
    });

    it("displays alert & inline errors when api failed", async () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED" }),
        });
      });
      openModal();
      clickSave();
      await screen.findByRole("alert");

      expect(screen.getByRole("alert")).toHaveTextContent(
        markdownToText(Config.taxCalendar.failedErrorMessageHeader)
      );
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.modalTaxFieldErrorName);
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
    });

    it("states responsible owner name specific field error in alert if api fails", async () => {
      renderFilingsCalendarTaxAccess(userDataWithPrefilledFields);
      mockApi.postTaxFilingsOnboarding.mockImplementation(() => {
        return Promise.resolve({
          ...userDataWithPrefilledFields,
          taxFilingData: generateTaxFilingData({ state: "FAILED", errorField: "businessName" }),
        });
      });
      openModal();
      clickSave();
      await screen.findByRole("alert");
      expect(screen.getByRole("alert")).toHaveTextContent(Config.taxCalendar.failedErrorMessageHeader);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.taxCalendar.modalResponsibleOwnerFieldErrorName
      );
      expect(screen.getByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)).toBeInTheDocument();
      expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
    });

    it("submits taxId and responsibleOwnerName to api", async () => {
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
      expect(mockApi.postTaxFilingsOnboarding).toHaveBeenCalledWith({
        taxId: userDataWithPrefilledFields.profileData.taxId,
        businessName: userDataWithPrefilledFields.profileData.responsibleOwnerName,
        encryptedTaxId: userDataWithPrefilledFields.profileData.encryptedTaxId,
      });
    });
  });

  function sharedTestsWhenAllFieldsPrefilled(userData: UserData) {
    const pendingStateUserData = {
      ...userData,
      taxFilingData: generateTaxFilingData({
        registeredISO: getCurrentDateISOString(),
        state: "PENDING",
      }),
    };

    it("opens tax access modal when on button click", () => {
      renderFilingsCalendarTaxAccess(userData);
      fireEvent.click(screen.getByTestId("get-tax-access"));
      expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    });

    it("displays error when the taxId field is empty on blur", () => {
      renderFilingsCalendarTaxAccess(userData);
      openModal();
      fireEvent.change(screen.getByLabelText("Tax id"), { target: { value: "" } });
      fireEvent.blur(screen.getByLabelText("Tax id"));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByText(Config.taxCalendar.failedTaxIdHelper)).toBeInTheDocument();
    });

    it("displays alert on success", async () => {
      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });

      renderFilingsCalendarTaxAccess(userData);
      openModal();
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      await screen.findByTestId("tax-success");
      expect(screen.getByText(Config.taxCalendar.snackbarSuccessHeader)).toBeInTheDocument();
    });

    it("succeeds with 9-digit split-field tax id", async () => {
      renderFilingsCalendarTaxAccess({
        ...userData,
        profileData: {
          ...userData.profileData,
          taxId: "123456789",
        },
      });

      mockApi.postTaxFilingsOnboarding.mockResolvedValue({
        ...userData,
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });

      openModal();
      fireEvent.click(screen.getByLabelText("Tax id location"));
      fireEvent.change(screen.getByLabelText("Tax id location"), { target: { value: "123" } });
      clickSave();
      await waitFor(() => {
        return expect(currentUserData().taxFilingData.state).toEqual("SUCCESS");
      });
      await screen.findByTestId("tax-success");
      expect(screen.getByText(Config.taxCalendar.snackbarSuccessHeader)).toBeInTheDocument();
    });

    describe("on api failed state response", () => {
      it("displays unknown-error alert with unknown api error", async () => {
        renderFilingsCalendarTaxAccess(userData);
        mockApi.postTaxFilingsOnboarding.mockResolvedValue({
          ...userData,
          taxFilingData: generateTaxFilingData({
            state: "API_ERROR",
          }),
        });
        openModal();
        clickSave();
        await screen.findByRole("alert");
        expect(screen.getByRole("alert")).toHaveTextContent(
          markdownToText(Config.taxCalendar.failedUnknownMarkdown)
        );
        expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(Config.taxCalendar.failedTaxIdHelper)).not.toBeInTheDocument();
      });

      it("displays unknown-error alert with api 500 request failure", async () => {
        renderFilingsCalendarTaxAccess(userData);
        mockApi.postTaxFilingsOnboarding.mockReturnValue(Promise.reject(500));
        openModal();
        clickSave();
        await screen.findByRole("alert");
        expect(screen.getByRole("alert")).toHaveTextContent(
          markdownToText(Config.taxCalendar.failedUnknownMarkdown)
        );
        expect(screen.queryByText(Config.taxCalendar.failedBusinessFieldHelper)).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.taxCalendar.failedResponsibleOwnerFieldHelper)
        ).not.toBeInTheDocument();
        expect(screen.queryByText(Config.taxCalendar.failedTaxIdHelper)).not.toBeInTheDocument();
      });
    });

    describe("different taxFiling states and update behavior", () => {
      it("does not do taxFiling lookup on page load if not registered", async () => {
        renderFilingsCalendarTaxAccess({
          ...userData,
          taxFilingData: generateTaxFilingData({
            registeredISO: undefined,
          }),
        });
        expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
      });

      it("does taxFiling lookup on page load if registered", async () => {
        mockApi.postTaxFilingsLookup.mockResolvedValue(userData);
        renderFilingsCalendarTaxAccess({
          ...userData,
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
          ...userData,
          taxFilingData: generateTaxFilingData({
            state: "FAILED",
            registeredISO: undefined,
          }),
        });
        expect(mockApi.postTaxFilingsLookup).not.toHaveBeenCalled();
        expect(screen.queryByTestId("pending-container")).not.toBeInTheDocument();
        expect(screen.getByTestId("button-container")).toBeInTheDocument();
      });

      it("shows button component when state is undefined and unregistered", async () => {
        renderFilingsCalendarTaxAccess({
          ...userData,
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
  }

  const openModal = () => {
    fireEvent.click(screen.getByTestId("get-tax-access"));
  };

  const clickSave = () => {
    fireEvent.click(screen.getByTestId("modal-button-primary"));
  };
});
