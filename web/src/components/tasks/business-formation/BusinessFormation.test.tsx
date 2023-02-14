import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { Task } from "@/lib/types/types";
import { getDollarValue } from "@/lib/utils/formatters";
import {
  generateEmptyFormationData,
  generateFormationData,
  generateFormationDbaContent,
  generateFormationDisplayContentMap,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateProfileData,
  generateTask,
  generateUserData,
} from "@/test/factories";
import {
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import {
  castPublicFilingLegalTypeToFormationType,
  defaultDateFormat,
  FormationData,
  FormationIncorporator,
  FormationLegalType,
  FormationMember,
  generateMunicipality,
  getCurrentDate,
  publicFilingLegalTypes,
  UserData,
} from "@businessnjgovnavigator/shared";

import * as materialUi from "@mui/material";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<BusinessFormation />", () => {
  const displayContent = {
    formationDisplayContentMap: generateFormationDisplayContentMap({}),
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  it("does not show form for non-formation legal structure", () => {
    const profileData = generateProfileData({ legalStructureId: "sole-proprietorship" });
    preparePage({ profileData }, displayContent);
    expect(screen.queryByTestId("formation-form")).not.toBeInTheDocument();
  });

  it("casts legalStructureId to correct formationLegalStructure and renders correct content", () => {
    preparePage(
      {
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
          businessPersona: "FOREIGN",
        }),
      },
      {
        ...displayContent,
        formationDisplayContentMap: {
          ...displayContent.formationDisplayContentMap,
          "foreign-limited-liability-company": {
            ...displayContent.formationDisplayContentMap["foreign-limited-liability-company"],
            introParagraph: { contentMd: "roflcopter" },
          },
        },
      }
    );
    expect(screen.getByText("roflcopter")).toBeInTheDocument();
  });

  describe("when completedFilingPayment is true and no getFilingResponse exists", () => {
    let formationData: FormationData;
    let task: Task;

    beforeEach(() => {
      useMockRouter({ isReady: true });
      task = generateTask({ urlSlug: "some-formation-url" });
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
        getFilingResponse: undefined,
        completedFilingPayment: true,
      });
    });

    it("updates userData with getFilingResponse and completedFilingPayment", async () => {
      const userDataReturnFromApi = generateUserData({});
      mockApi.getCompletedFiling.mockResolvedValue(userDataReturnFromApi);
      await act(async () => {
        preparePage({ formationData }, displayContent, undefined, task);
      });
      expect(mockApi.getCompletedFiling).toHaveBeenCalled();
      const expectedUserData = {
        ...userDataReturnFromApi,
        formationData: {
          ...userDataReturnFromApi.formationData,
          completedFilingPayment: true,
        },
      };
      await waitFor(() => {
        expect(currentUserData()).toEqual(expectedUserData);
      });
    });
  });

  describe("when completeFiling=false query param", () => {
    let formationData: FormationData;
    let task: Task;

    beforeEach(() => {
      useMockRouter({ isReady: true, query: { completeFiling: "false" } });
      task = generateTask({});
    });

    it("directs user back to Review Step in form, without setting completedFilingPayment to true", async () => {
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
        getFilingResponse: undefined,
      });

      await act(async () => {
        preparePage({ formationData }, displayContent, undefined, task);
      });

      expect(screen.getByTestId("review-step")).toBeInTheDocument();
      expect(currentUserData().formationData.completedFilingPayment).toEqual(false);
      expect(mockPush).toHaveBeenCalledWith({ pathname: `/tasks/${task.urlSlug}` }, undefined, {
        shallow: true,
      });
    });

    it("shows success page when user has successfully paid", async () => {
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
        getFilingResponse: generateGetFilingResponse({ success: true }),
      });
      await act(async () => {
        preparePage({ formationData }, displayContent, undefined, task);
      });

      expect(screen.getByText(Config.formation.successPage.header)).toBeInTheDocument();
    });
  });

  describe("when completeFiling=true query param", () => {
    let formationData: FormationData;
    let task: Task;

    beforeEach(() => {
      useMockRouter({ isReady: true, query: { completeFiling: "true" } });
      task = generateTask({ urlSlug: "some-formation-url" });
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
      });
    });

    describe("on API getFiling success", () => {
      let userDataReturnFromApi: UserData;

      beforeEach(() => {
        userDataReturnFromApi = generateUserData({});
        mockApi.getCompletedFiling.mockResolvedValue(userDataReturnFromApi);
      });

      it("updates userData with getFilingResponse and completedFilingPayment", async () => {
        await act(async () => {
          preparePage({ formationData }, displayContent, undefined, task);
        });
        expect(mockApi.getCompletedFiling).toHaveBeenCalled();
        const expectedUserData = {
          ...userDataReturnFromApi,
          formationData: {
            ...userDataReturnFromApi.formationData,
            completedFilingPayment: true,
          },
        };
        await waitFor(() => {
          expect(currentUserData()).toEqual(expectedUserData);
        });
      });

      it("replaces URL", async () => {
        await act(async () => {
          preparePage({ formationData }, displayContent, undefined, task);
        });
        await waitFor(() => {
          return expect(mockPush).toHaveBeenCalledWith({ pathname: "/tasks/some-formation-url" }, undefined, {
            shallow: true,
          });
        });
      });
    });

    describe("on API getFiling error", () => {
      beforeEach(() => {
        mockApi.getCompletedFiling.mockRejectedValue({});
      });

      it("updates userData with completedFilingPayment", async () => {
        await act(async () => {
          preparePage({ formationData }, displayContent, undefined, task);
        });
        expect(mockApi.getCompletedFiling).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentUserData().formationData.completedFilingPayment).toEqual(true);
        });
      });

      it("displays error message", async () => {
        await act(async () => {
          preparePage({ formationData }, displayContent, undefined, task);
        });
        await waitFor(() => {
          expect(screen.getByTestId("api-error-text")).toBeInTheDocument();
        });
      });

      it("resets completedFilingPayment and brings back to review page", async () => {
        await act(async () => {
          preparePage({ formationData }, displayContent, undefined, task);
        });

        fireEvent.click(screen.getByText(Config.formation.interimSuccessPage.buttonText));
        fireEvent.click(screen.getByText(Config.formation.interimSuccessPage.modalContinue));

        await screen.findByTestId("review-step");
        expect(screen.queryByText("api-error-text")).not.toBeInTheDocument();
        expect(currentUserData().formationData.completedFilingPayment).toEqual(false);
      });
    });
  });

  it("renders success page when userData has formationResponse", () => {
    const getFilingResponse = generateGetFilingResponse({ success: true });
    const profileData = generateFormationProfileData({});
    const formationData = generateFormationData({ getFilingResponse });
    preparePage({ profileData, formationData }, displayContent);
    expect(screen.getByText(Config.formation.successPage.header)).toBeInTheDocument();
  });

  it("fills multi-step form, submits, and updates userData when LLC", async () => {
    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({
      legalStructureId,
    });
    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLC");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    const member: FormationMember = {
      name: "Joe Biden",
      addressLine1: "1600 Pennsylvania Ave NW",
      addressLine2: "Office of the President",
      addressCity: "Washington",
      addressState: { shortCode: "DC", name: "District of Columbia" },
      addressZipCode: "20500",
      addressCountry: "US",
      businessLocationType: "US",
    };
    expect(
      screen.getByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).toBeInTheDocument();

    await page.fillAndSubmitAddressModal(member, "members");
    page.fillText("Signer 0", "Elrond");
    page.checkSignerBox(0, "signers");
    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLC");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressState).toEqual({ name: "New Jersey", shortCode: "NJ" });
    expect(formationFormData.addressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.displayName).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual([
      {
        name: member.name,
        addressLine1: member.addressLine1,
        addressLine2: member.addressLine2,
        addressCity: member.addressCity,
        addressState: member.addressState,
        addressZipCode: member.addressZipCode,
        addressCountry: member.addressCountry,
        businessLocationType: member.businessLocationType,
        addressMunicipality: undefined,
        addressProvince: undefined,
      },
    ]);
    expect(formationFormData.signers).toEqual([
      {
        title: "Authorized Representative",
        name: "Elrond",
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("fills multi-step form, submits, and updates userData when FLC", async () => {
    const _legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({
      businessPersona: "FOREIGN",
      legalStructureId: _legalStructureId,
    });
    const legalStructureId = castPublicFilingLegalTypeToFormationType(
      _legalStructureId,
      profileData.businessPersona
    );

    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    await page.fillAndSubmitNexusBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLC");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Foreign date of formation");
    page.fillText("Foreign state of formation", "MA");

    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "01752");
    page.fillText("Address state", "Massachusetts");
    page.fillText("Address city", "Marlborough");

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.queryByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).not.toBeInTheDocument();

    page.fillText("Signer 0", "Elrond");
    page.selectByText("Signer title 0", "General Partner");
    page.checkSignerBox(0, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    console.log(formationFormData);
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLC");
    expect(formationFormData.businessStartDate).toEqual(getCurrentDate().format(defaultDateFormat));
    expect(formationFormData.foreignDateOfFormation).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressState).toEqual({ name: "Massachusetts", shortCode: "MA" });
    expect(formationFormData.addressZipCode).toEqual("01752");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.displayName).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual(undefined);
    expect(formationFormData.provisions).toEqual(undefined);
    expect(formationFormData.signers).toEqual([
      {
        title: "General Partner",
        name: "Elrond",
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("fills multi-step form, submits, and updates userData when LLP", async () => {
    const legalStructureId = "limited-liability-partnership";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLP");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.queryByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).not.toBeInTheDocument();

    page.fillText("Signer 0", "Elrond");
    page.checkSignerBox(0, "signers");
    page.clickAddNewSigner();
    page.fillText("Signer 1", "Gandalf");
    page.checkSignerBox(1, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLP");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressState).toEqual({ name: "New Jersey", shortCode: "NJ" });
    expect(formationFormData.addressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.name).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.signers).toEqual([
      {
        title: "Authorized Partner",
        name: "Elrond",
        signature: true,
      },
      {
        title: "Authorized Partner",
        name: "Gandalf",
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("fills multi-step form, submits, and updates userData when FLLP", async () => {
    const _legalStructureId = "limited-liability-partnership";
    const profileData = generateFormationProfileData({
      businessPersona: "FOREIGN",
      legalStructureId: _legalStructureId,
    });
    const legalStructureId = castPublicFilingLegalTypeToFormationType(
      _legalStructureId,
      profileData.businessPersona
    );
    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    await page.fillAndSubmitNexusBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLP");

    const threeDaysFromNow = getCurrentDate().add(3, "days");
    const oneHundredAndThirtyDaysFromNow = getCurrentDate().add(3, "days");

    page.selectDate(threeDaysFromNow, "Foreign date of formation");
    page.fillText("Foreign state of formation", "MA");
    page.selectDate(oneHundredAndThirtyDaysFromNow, "Business start date");
    fireEvent.click(screen.getByTestId("address-radio-intl"));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "0800231");
    page.fillText("Address country", "Canada");
    page.fillText("Address province", "Quebec");
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.queryByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).not.toBeInTheDocument();

    page.fillText("Signer 0", "Elrond");
    page.selectByText("Signer title 0", "General Partner");
    page.checkSignerBox(0, "signers");
    page.clickAddNewSigner();
    page.fillText("Signer 1", "Gandalf");
    page.selectByText("Signer title 1", "Authorized Representative");
    page.checkSignerBox(1, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLP");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressCountry).toEqual("CA");
    expect(formationFormData.addressZipCode).toEqual("0800231");
    expect(formationFormData.addressProvince).toEqual("Quebec");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.name).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual(undefined);
    expect(formationFormData.provisions).toEqual(undefined);
    expect(formationFormData.signers).toEqual([
      {
        title: "General Partner",
        name: "Elrond",
        signature: true,
      },
      {
        title: "Authorized Representative",
        name: "Gandalf",
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("fills multi-step form, submits, and updates userData when LP", async () => {
    const legalStructureId = "limited-partnership";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LP");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");
    page.fillText("Withdrawals", "to withdrawals over the world");
    page.fillText("Combined investment", "to invest over the world");
    page.fillText("Dissolution", "to dissolution over the world");
    page.chooseRadio("canCreateLimitedPartner-true");
    page.fillText("Create limited partner terms", "to create partners invest over the world");
    page.chooseRadio("canGetDistribution-true");
    page.fillText("Get distribution terms", "to get distribution over the world");
    page.chooseRadio("canMakeDistribution-false");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.queryByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).not.toBeInTheDocument();

    const incorporators: FormationIncorporator = {
      name: "Joe Biden",
      addressLine1: "1600 Pennsylvania Ave NW",
      addressLine2: "Office of the President",
      addressCity: "Washington",
      addressState: { shortCode: "DC", name: "District of Columbia" },
      addressZipCode: "20500",
      addressCountry: "US",
      title: "General Partner",
      businessLocationType: "US",
      signature: false,
    };

    expect(
      screen.getByText(
        displayContent.formationDisplayContentMap[legalStructureId].signatureHeader.placeholder as string
      )
    ).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(incorporators, "incorporators");
    page.checkSignerBox(0, "incorporators");
    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LP");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressState).toEqual({ name: "New Jersey", shortCode: "NJ" });
    expect(formationFormData.addressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.name).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.incorporators).toEqual([
      {
        ...incorporators,
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.withdrawals).toEqual("to withdrawals over the world");
    expect(formationFormData.combinedInvestment).toEqual("to invest over the world");
    expect(formationFormData.dissolution).toEqual("to dissolution over the world");
    expect(formationFormData.canCreateLimitedPartner).toEqual(true);
    expect(formationFormData.canMakeDistribution).toEqual(false);
    expect(formationFormData.canGetDistribution).toEqual(true);
    expect(formationFormData.createLimitedPartnerTerms).toEqual("to create partners invest over the world");
    expect(formationFormData.getDistributionTerms).toEqual("to get distribution over the world");
    expect(formationFormData.makeDistributionTerms).toEqual("");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("fills multi-step form, submits, and updates userData when corp", async () => {
    const legalStructureId = "c-corporation";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    const page = preparePage({ profileData, formationData }, displayContent, [
      generateMunicipality({ displayName: "Newark", name: "Newark" }),
    ]);

    const member: FormationMember = {
      name: "Joe Biden",
      addressLine1: "1600 Pennsylvania Ave NW",
      addressLine2: "Office of the President",
      addressCity: "Washington",
      addressState: { shortCode: "DC", name: "District of Columbia" },
      addressZipCode: "20500",
      addressCountry: "US",
      businessLocationType: "US",
    };

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "CORPORATION");
    page.fillText("Business total stock", "123");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.selectByText("Agent office address municipality", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.getByText(
        displayContent.formationDisplayContentMap[legalStructureId].members.placeholder as string
      )
    ).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(member, "members");

    expect(
      screen.getByText(
        displayContent.formationDisplayContentMap[legalStructureId].signatureHeader.placeholder as string
      )
    ).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(member, "incorporators");
    page.checkSignerBox(0, "incorporators");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent.formationDisplayContentMap[legalStructureId].certificateOfStanding.cost +
      displayContent.formationDisplayContentMap[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent.formationDisplayContentMap[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("CORPORATION");
    expect(formationFormData.businessTotalStock).toEqual("123");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format(defaultDateFormat));
    expect(formationFormData.addressLine1).toEqual("1234 main street");
    expect(formationFormData.addressLine2).toEqual("Suite 304");
    expect(formationFormData.addressState).toEqual({ name: "New Jersey", shortCode: "NJ" });
    expect(formationFormData.addressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressMunicipality?.name).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual([member]);
    expect(formationFormData.incorporators).toEqual([
      {
        ...member,
        title: "Incorporator",
        signature: true,
      },
    ]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  }, 60000);

  it("loads different displayContent depending on users LegalStructureId", async () => {
    const profileData = generateFormationProfileData({});
    const page = preparePage({ profileData }, displayContent);
    await page.fillAndSubmitBusinessNameStep();
    await page.submitBusinessStep();
    expect(
      screen.getByText(
        `${
          displayContent.formationDisplayContentMap[profileData.legalStructureId as FormationLegalType]
            .agentNumberOrManual.contentMd
        }`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        `${
          displayContent.formationDisplayContentMap[
            publicFilingLegalTypes.find((id: FormationLegalType) => {
              return id != profileData.legalStructureId;
            }) as FormationLegalType
          ].agentNumberOrManual.contentMd
        }`
      )
    ).not.toBeInTheDocument();
  });
});
