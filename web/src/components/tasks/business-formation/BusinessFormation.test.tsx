import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { Task } from "@/lib/types/types";
import { getDollarValue } from "@/lib/utils/formatters";
import { generateEmptyFormationData, generateFormationDbaContent, generateTask } from "@/test/factories";
import {
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  FormationData,
  FormationIncorporator,
  FormationMember,
  UserData,
  defaultDateFormat,
  generateBusiness,
  generateMunicipality,
  generateUserDataForBusiness,
  getCurrentBusiness,
  getCurrentDate,
  getCurrentDateInNewJerseyFormatted,
} from "@businessnjgovnavigator/shared";
import {
  generateFormationData,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateProfileData,
  generateUserData,
} from "@businessnjgovnavigator/shared/test/";

import { Content } from "@/components/Content";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import * as materialUi from "@mui/material";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

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
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  it("does not show form for non-formation legal structure", () => {
    const profileData = generateProfileData({ legalStructureId: "sole-proprietorship" });
    preparePage({ business: { profileData }, displayContent });
    expect(screen.queryByTestId("formation-form")).not.toBeInTheDocument();
  });

  it("shows default intro content for in-state formation", () => {
    preparePage({
      business: {
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
          businessPersona: "STARTING",
        }),
      },
      displayContent,
    });

    useMockBusiness(generateBusiness({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("formation-form")).toContainHTML(
      renderToStaticMarkup(Content({ children: Config.formation.intro.default }))
    );
  });

  it("shows override intro content for foreign formation", () => {
    preparePage({
      business: {
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
          businessPersona: "FOREIGN",
        }),
      },
      displayContent,
    });

    useMockBusiness(generateBusiness({})); // necessary for renderToStaticMarkup for Content
    expect(screen.getByTestId("formation-form")).toContainHTML(
      renderToStaticMarkup(Content({ children: Config.formation.intro.foreign }))
    );
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
        preparePage({ business: { formationData }, displayContent, task });
      });
      expect(mockApi.getCompletedFiling).toHaveBeenCalled();
      const expectedBusiness = {
        ...getCurrentBusiness(userDataReturnFromApi),
        formationData: {
          ...getCurrentBusiness(userDataReturnFromApi).formationData,
          completedFilingPayment: true,
        },
      };
      await waitFor(() => {
        expect(currentBusiness()).toEqual(expectedBusiness);
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

    it("refetches getCompletedFiling when getFilingResponse is initially unsuccessful", async () => {
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
        getFilingResponse: generateGetFilingResponse({
          certifiedDoc: "",
          confirmationNumber: "",
          entityId: "",
          formationDoc: "",
          standingDoc: "",
          success: false,
          transactionDate: "",
        }),
      });

      const validGetFilingResponse = generateGetFilingResponse({ success: true });

      const userDataReturnFromApi = generateUserDataForBusiness(
        generateBusiness({
          formationData: generateFormationData({
            formationResponse: generateFormationSubmitResponse({ success: true }),
            getFilingResponse: validGetFilingResponse,
          }),
        })
      );

      mockApi.getCompletedFiling.mockResolvedValue(userDataReturnFromApi);

      await act(async () => {
        preparePage({ business: { formationData }, displayContent, task });
      });

      expect(mockApi.getCompletedFiling).toHaveBeenCalled();
      await waitFor(() => {
        expect(currentBusiness().formationData?.getFilingResponse).toEqual(validGetFilingResponse);
      });
      expect(currentBusiness().formationData?.completedFilingPayment).toBeTruthy();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith({ pathname: `/tasks/${task.urlSlug}` }, undefined, {
          shallow: true,
        });
      });
    });

    it("shows success page when user has successfully paid", async () => {
      formationData = generateFormationData({
        formationResponse: generateFormationSubmitResponse({ success: true }),
        getFilingResponse: generateGetFilingResponse({ success: true }),
      });
      await act(async () => {
        preparePage({ business: { formationData }, displayContent, task });
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
          preparePage({ business: { formationData }, displayContent, task });
        });
        expect(mockApi.getCompletedFiling).toHaveBeenCalled();
        const expectedBusiness = {
          ...getCurrentBusiness(userDataReturnFromApi),
          formationData: {
            ...getCurrentBusiness(userDataReturnFromApi).formationData,
            completedFilingPayment: true,
          },
        };
        await waitFor(() => {
          expect(currentBusiness()).toEqual(expectedBusiness);
        });
      });

      it("replaces URL", async () => {
        await act(async () => {
          preparePage({ business: { formationData }, displayContent, task });
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
          preparePage({ business: { formationData }, displayContent, task });
        });
        expect(mockApi.getCompletedFiling).toHaveBeenCalled();
        await waitFor(() => {
          expect(currentBusiness().formationData.completedFilingPayment).toEqual(true);
        });
      });

      it("displays error message", async () => {
        await act(async () => {
          preparePage({ business: { formationData }, displayContent, task });
        });
        await waitFor(() => {
          expect(screen.getByTestId("api-error-text")).toBeInTheDocument();
        });
      });

      it("resets completedFilingPayment and brings back to review page", async () => {
        await act(async () => {
          preparePage({ business: { formationData }, displayContent, task });
        });

        fireEvent.click(screen.getByText(Config.formation.interimSuccessPage.buttonText));
        fireEvent.click(screen.getByText(Config.formation.interimSuccessPage.modalContinue));

        await screen.findByTestId("review-step");
        expect(screen.queryByText("api-error-text")).not.toBeInTheDocument();
        expect(currentBusiness().formationData.completedFilingPayment).toEqual(false);
      });
    });
  });

  it("renders success page when userData has formationResponse", () => {
    const getFilingResponse = generateGetFilingResponse({ success: true });
    const profileData = generateFormationProfileData({});
    const formationData = generateFormationData({ getFilingResponse });
    preparePage({ business: { profileData, formationData }, displayContent });
    expect(screen.getByText(Config.formation.successPage.header)).toBeInTheDocument();
  });

  it("fills multi-step form, submits, and updates userData when LLC", async () => {
    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({
      legalStructureId,
    });
    const formationData = generateEmptyFormationData();
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLC");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");

    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    const member: FormationMember = {
      name: "Ava Curie",
      addressLine1: "160 Something Ave",
      addressLine2: "Office of the President",
      addressCity: "Apt 1",
      addressState: { shortCode: "FL", name: "Florida" },
      addressZipCode: "32003",
      addressCountry: "US",
      businessLocationType: "US",
    };
    expect(screen.getByText(Config.formation.fields.members.placeholder)).toBeInTheDocument();

    await page.fillAndSubmitAddressModal(member, "members");
    page.fillText("Signer 0", "Elrond");
    page.checkSignerBox(0, "signers");
    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);
    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
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

    const formationData = generateEmptyFormationData();
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

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

    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.queryByText(Config.formation.fields.members.placeholder)).not.toBeInTheDocument();

    page.fillText("Signer 0", "Elrond");
    page.selectByText("Signer title 0", "General Partner");
    page.checkSignerBox(0, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);
    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLC");
    expect(formationFormData.businessStartDate).toEqual(
      getCurrentDateInNewJerseyFormatted(defaultDateFormat)
    );
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual(undefined);
    expect(formationFormData.additionalProvisions).toEqual(undefined);
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
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LLP");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));

    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.queryByText(Config.formation.fields.members.placeholder)).not.toBeInTheDocument();

    page.fillText("Signer 0", "Elrond");
    page.checkSignerBox(0, "signers");
    page.clickAddNewSigner();
    page.fillText("Signer 1", "Gandalf");
    page.checkSignerBox(1, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
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
    const formationData = generateEmptyFormationData();
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

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
    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.queryByText(Config.formation.fields.members.placeholder)).not.toBeInTheDocument();

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
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();

    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual(undefined);
    expect(formationFormData.additionalProvisions).toEqual(undefined);
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
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "LP");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
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
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.queryByText(Config.formation.fields.members.placeholder)).not.toBeInTheDocument();

    const incorporators: FormationIncorporator = {
      name: "Jane Parks",
      addressLine1: "1600 Pennsylvania Ave NW",
      addressLine2: "Office of the President",
      addressCity: "New Orleans",
      addressState: { shortCode: "LA", name: "Louisiana" },
      addressZipCode: "20500",
      addressCountry: "US",
      title: "General Partner",
      businessLocationType: "US",
      signature: false,
    };

    expect(screen.getByText(Config.formation.fields.incorporators.placeholder)).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(incorporators, "incorporators");
    page.checkSignerBox(0, "incorporators");
    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.overrides["limited-partnership"].cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
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
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    const member: FormationMember = {
      name: "Emily Jones",
      addressLine1: "160 Something Ave",
      addressLine2: "Office of the President",
      addressCity: "3rd Floor",
      addressState: { shortCode: "FL", name: "Florida" },
      addressZipCode: "34997",
      addressCountry: "US",
      businessLocationType: "US",
    };

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "CORPORATION");
    page.fillText("Business total stock", "123");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");
    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.getByText(Config.formation.fields.directors.placeholder)).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(member, "members");

    expect(screen.getByText(Config.formation.fields.incorporators.placeholder)).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(member, "incorporators");
    page.checkSignerBox(0, "incorporators");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.overrides["c-corporation"].cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();

    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
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

  it("fills multi-step form, submits, and updates userData when nonprofit", async () => {
    const legalStructureId = "nonprofit";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = generateEmptyFormationData();
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    const trustee: FormationMember = {
      name: "Emily Jones",
      addressLine1: "160 Something Ave",
      addressLine2: "Office of the President",
      addressCity: "3rd Floor",
      addressState: { shortCode: "FL", name: "Florida" },
      addressZipCode: "34997",
      addressCountry: "US",
      businessLocationType: "US",
    };

    await page.fillAndSubmitBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "A NJ NONPROFIT CORPORATION");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow, "Business start date");
    page.chooseRadio("isVeteranNonprofit-true");

    fireEvent.click(screen.getByText(Config.formation.sections.addressAddButtonText));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "08001");
    page.selectByText("Address municipality", "Newark");

    page.chooseRadio("hasNonprofitBoardMembers-true");
    page.chooseRadio("nonprofitBoardMemberQualificationsSpecified-IN_BYLAWS");
    page.chooseRadio("nonprofitBoardMemberRightsSpecified-IN_BYLAWS");
    page.chooseRadio("nonprofitTrusteesMethodSpecified-IN_BYLAWS");
    page.chooseRadio("nonprofitAssetDistributionSpecified-IN_FORM");
    page.fillText("Nonprofit asset distribution terms", "some terms here");

    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(screen.getByText(Config.formation.fields.trustees.placeholder)).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(trustee, "members");

    expect(screen.getByText(Config.formation.fields.incorporators.placeholder)).toBeInTheDocument();
    await page.fillAndSubmitAddressModal(trustee, "incorporators");
    page.checkSignerBox(0, "incorporators");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.overrides.nonprofit.cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.overrides.nonprofit.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();

    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("A NJ NONPROFIT CORPORATION");
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members).toEqual([trustee]);
    expect(formationFormData.incorporators).toEqual([
      {
        ...trustee,
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

    expect(formationFormData.isVeteranNonprofit).toEqual(true);
    expect(formationFormData.hasNonprofitBoardMembers).toEqual(true);
    expect(formationFormData.nonprofitBoardMemberRightsSpecified).toEqual("IN_BYLAWS");
    expect(formationFormData.nonprofitBoardMemberQualificationsSpecified).toEqual("IN_BYLAWS");
    expect(formationFormData.nonprofitTrusteesMethodSpecified).toEqual("IN_BYLAWS");
    expect(formationFormData.nonprofitAssetDistributionSpecified).toEqual("IN_FORM");
    expect(formationFormData.nonprofitAssetDistributionTerms).toEqual("some terms here");
  }, 60000);

  it("fills multi-step form, submits, and updates userData when foreign nonprofit", async () => {
    const legalStructureId = "nonprofit";
    const profileData = generateFormationProfileData({
      legalStructureId,
      businessPersona: "FOREIGN",
    });
    const formationData = generateEmptyFormationData();
    const page = preparePage({
      business: { profileData, formationData },
      displayContent,
      municipalities: [generateMunicipality({ displayName: "Newark", name: "Newark" })],
    });

    await page.fillAndSubmitNexusBusinessNameStep("Pizza Joint");

    page.selectByText("Business suffix", "A NJ NONPROFIT CORPORATION");
    const threeDaysFromNow = getCurrentDate().add(3, "days");

    page.selectDate(threeDaysFromNow, "Foreign date of formation");
    page.fillText("Foreign state of formation", "MA");
    page.selectDate(threeDaysFromNow, "Business start date");

    fireEvent.click(screen.getByTestId("address-radio-intl"));
    page.fillText("Address line1", "1234 main street");
    page.fillText("Address line2", "Suite 304");
    page.fillText("Address zip code", "0800231");
    page.fillText("Address country", "Canada");
    page.fillText("Address province", "Quebec");

    fireEvent.click(screen.getByText(Config.formation.fields.businessPurpose.addButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessStep();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    page.fillText("Signer 0", "Elrond");
    page.selectByText("Signer title 0", "Chairman of the Board");
    page.checkSignerBox(0, "signers");

    await page.submitContactsStep();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    page.selectCheckbox(Config.formation.fields.corpWatchNotification.checkboxText);

    page.selectCheckboxByTestId("certificateOfStanding");
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");

    const expectedTotalCost =
      Number.parseInt(Config.formation.fields.certificateOfStanding.overrides["foreign-nonprofit"].cost) +
      Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost) +
      Number.parseInt(Config.formation.fields.officialFormationDocument.cost);

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();

    await page.submitBillingStep();
    await page.submitReviewStep();

    const formationFormData = currentBusiness().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("A NJ NONPROFIT CORPORATION");
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
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.signers).toEqual([
      {
        title: "Chairman of the Board",
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

    expect(formationFormData.isVeteranNonprofit).toEqual(undefined);
    expect(formationFormData.hasNonprofitBoardMembers).toEqual(undefined);
    expect(formationFormData.nonprofitBoardMemberRightsSpecified).toEqual(undefined);
    expect(formationFormData.nonprofitBoardMemberQualificationsSpecified).toEqual(undefined);
    expect(formationFormData.nonprofitTrusteesMethodSpecified).toEqual(undefined);
    expect(formationFormData.nonprofitAssetDistributionSpecified).toEqual(undefined);
  }, 60000);

  describe("businessStartDate", () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it("when user is in US Eastern Timezone, initial value is current date in NJ", async () => {
      const dateFormat = "MM/DD/YYYY";
      const expectedDateString = getCurrentDateInNewJerseyFormatted(dateFormat);

      const page = preparePage({
        business: {
          profileData: generateProfileData({
            legalStructureId: "limited-liability-company",
            businessPersona: "STARTING",
          }),
          formationData: generateEmptyFormationData(),
        },
        displayContent,
      });
      await page.fillAndSubmitBusinessNameStep("Pizza Joint");
      expect(screen.getByTestId("date-businessStartDate")).toHaveValue(expectedDateString);
    });

    it("when user is in Phillipine Timezone, initial value is current date in NJ", async () => {
      const mockDate = new Date("2020-04-13T00:00:00.000+08:00");
      const expectedDateString = "04/12/2020";

      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const page = preparePage({
        business: {
          profileData: generateProfileData({
            legalStructureId: "limited-liability-company",
            businessPersona: "STARTING",
          }),
          formationData: generateEmptyFormationData(),
        },
        displayContent,
      });
      await page.fillAndSubmitBusinessNameStep("Pizza Joint");
      expect(screen.getByTestId("date-businessStartDate")).toHaveValue(expectedDateString);
    });

    it("when user is in US Pacific Timezone, initial value is current date in NJ", async () => {
      const mockDate = new Date("2020-04-13T22:00:00.000-08:00");
      const expectedDateString = "04/14/2020";

      jest.useFakeTimers();
      jest.setSystemTime(mockDate);

      const page = preparePage({
        business: {
          profileData: generateProfileData({
            legalStructureId: "limited-liability-company",
            businessPersona: "STARTING",
          }),
          formationData: generateEmptyFormationData(),
        },
        displayContent,
      });
      await page.fillAndSubmitBusinessNameStep("Pizza Joint");
      expect(screen.getByTestId("date-businessStartDate")).toHaveValue(expectedDateString);
    });
  });
});
