import * as api from "@/lib/api-client/apiClient";
import { getDollarValue } from "@/lib/utils/helpers";
import {
  generateFormationData,
  generateFormationDisplayContent,
  generateFormationSubmitResponse,
  generateGetFilingResponse,
  generateProfileData,
  generateUserData,
} from "@/test/factories";
import { generateFormationProfileData, preparePage, useSetupInitialMocks } from "@/test/helpers-formation";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyFormationFormData,
  FormationLegalType,
  FormationLegalTypes,
  FormationMember,
  getCurrentDate,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router");
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

describe("<BusinessFormation />", () => {
  const displayContent = generateFormationDisplayContent({});

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  it("does not show form for non-formation legal structure", () => {
    const profileData = generateProfileData({ legalStructureId: "sole-proprietorship" });
    preparePage({ profileData }, displayContent);
    expect(screen.queryByTestId("formation-form")).not.toBeInTheDocument();
  });

  it("does not show form for non-formation legal structure when feature flag is not set", () => {
    const profileData = generateProfileData({ legalStructureId: "limited-liability-partnership" });
    process.env.FEATURE_BUSINESS_LLP = "false";
    preparePage({ profileData }, displayContent);
    expect(screen.queryByTestId("formation-form")).not.toBeInTheDocument();
    process.env.FEATURE_BUSINESS_LLP = "true";
  });

  it("shows form only for formation legal structure", () => {
    preparePage(
      { profileData: generateProfileData({ legalStructureId: "limited-liability-partnership" }) },
      displayContent
    );
    expect(screen.getByTestId("formation-form")).toBeInTheDocument();
    expect(screen.getByTestId("business-name-section")).toBeInTheDocument();
  });

  it("requests for getFiling and updates userData when at ?completeFiling=true query param and replaces URL", async () => {
    const formationData = generateFormationData({
      formationResponse: generateFormationSubmitResponse({ success: true }),
    });
    useMockRouter({ isReady: true, query: { completeFiling: "true" } });
    const newUserData = generateUserData({});
    mockApi.getCompletedFiling.mockResolvedValue(newUserData);

    preparePage({ formationData }, displayContent);
    expect(mockApi.getCompletedFiling).toHaveBeenCalled();
    await waitFor(() => expect(currentUserData()).toEqual(newUserData));
    expect(mockPush).toHaveBeenCalledWith({ pathname: "/tasks/form-business-entity" }, undefined, {
      shallow: true,
    });
  });

  it("renders success page when userData has formationResponse", () => {
    const getFilingResponse = generateGetFilingResponse({ success: true });
    const profileData = generateFormationProfileData({});
    const formationData = generateFormationData({ getFilingResponse });
    preparePage({ profileData, formationData }, displayContent);
    expect(screen.getByText(Config.businessFormationDefaults.successPageHeader)).toBeInTheDocument();
  });

  it("fills multi-tab form, submits, and updates userData when LLC", async () => {
    const legalStructureId = "limited-liability-company";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const page = preparePage({ profileData, formationData }, displayContent);

    await page.submitBusinessNameTab("Pizza Joint");

    page.selectByText("Business suffix", "LLC");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow);
    page.fillText("Business address line1", "1234 main street");
    page.fillText("Business address line2", "Suite 304");
    page.fillText("Business address zip code", "08001");

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessTab();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    const member: FormationMember = {
      name: "Joe Biden",
      addressLine1: "1600 Pennsylvania Ave NW",
      addressLine2: "Office of the President",
      addressCity: "Washington",
      addressState: "DC",
      addressZipCode: "20500",
    };
    expect(
      screen.getByText(displayContent[legalStructureId].members.placeholder as string)
    ).toBeInTheDocument();

    await page.fillAndSubmitMemberModal(member);

    page.fillText("Signer", "Elrond");
    page.selectCheckbox(`${Config.businessFormationDefaults.signatureColumnLabel}*`);
    await page.submitContactsTab();
    await page.submitReviewTab();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent[legalStructureId].certificateOfStanding.contentMd} ${displayContent[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent[legalStructureId].certificateOfStanding.cost +
      displayContent[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.clickSubmit();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLC");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format("YYYY-MM-DD"));
    expect(formationFormData.businessAddressLine1).toEqual("1234 main street");
    expect(formationFormData.businessAddressLine2).toEqual("Suite 304");
    expect(formationFormData.businessAddressState).toEqual("NJ");
    expect(formationFormData.businessAddressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressState).toEqual("NJ");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.members[0].name).toEqual(member.name);
    expect(formationFormData.members[0].addressLine1).toEqual(member.addressLine1);
    expect(formationFormData.members[0].addressLine2).toEqual(member.addressLine2);
    expect(formationFormData.members[0].addressCity).toEqual(member.addressCity);
    expect(formationFormData.members[0].addressState).toEqual("DC");
    expect(formationFormData.members[0].addressZipCode).toEqual("20500");
    expect(formationFormData.signer).toEqual({
      name: "Elrond",
      signature: true,
    });
    expect(formationFormData.additionalSigners).toEqual([]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  });

  it("fills multi-tab form, submits, and updates userData when LLP", async () => {
    const legalStructureId = "limited-liability-partnership";
    const profileData = generateFormationProfileData({ legalStructureId });
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
    };
    const page = preparePage({ profileData, formationData }, displayContent);

    await page.submitBusinessNameTab("Pizza Joint");

    page.selectByText("Business suffix", "LLP");
    const threeDaysFromNow = getCurrentDate().add(3, "days");
    page.selectDate(threeDaysFromNow);
    page.fillText("Business address line1", "1234 main street");
    page.fillText("Business address line2", "Suite 304");
    page.fillText("Business address zip code", "08001");

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
    page.fillText("Business purpose", "to take over the world");

    await page.submitBusinessTab();

    page.chooseRadio("registered-agent-manual");
    page.fillText("Agent name", "Hugo Weaving");
    page.fillText("Agent email", "name@example.com");
    page.fillText("Agent office address line1", "400 Pennsylvania Ave");
    page.fillText("Agent office address line2", "Suite 101");
    page.fillText("Agent office address city", "Newark");
    page.fillText("Agent office address zip code", "08002");

    expect(
      screen.queryByText(displayContent[legalStructureId].members.placeholder as string)
    ).not.toBeInTheDocument();

    page.fillText("Signer", "Elrond");
    page.selectCheckbox(`${Config.businessFormationDefaults.signatureColumnLabel}*`);
    await page.submitContactsTab();
    await page.submitReviewTab();

    page.fillText("Contact first name", "John");
    page.fillText("Contact last name", "Smith");
    page.fillText("Contact phone number", "123A45a678 90");
    fireEvent.click(screen.getByLabelText("Credit card"));
    page.selectCheckbox(Config.businessFormationDefaults.optInCorpWatchText);
    page.selectCheckbox(
      `${displayContent[legalStructureId].certificateOfStanding.contentMd} ${displayContent[legalStructureId].certificateOfStanding.optionalLabel}`
    );
    page.selectCheckbox(
      `${displayContent[legalStructureId].certifiedCopyOfFormationDocument.contentMd} ${displayContent[legalStructureId].certifiedCopyOfFormationDocument.optionalLabel}`
    );

    const expectedTotalCost =
      displayContent[legalStructureId].certificateOfStanding.cost +
      displayContent[legalStructureId].certifiedCopyOfFormationDocument.cost +
      displayContent[legalStructureId].officialFormationDocument.cost;

    expect(screen.getByText(getDollarValue(expectedTotalCost))).toBeInTheDocument();
    await page.clickSubmit();

    const formationFormData = currentUserData().formationData.formationFormData;
    await waitFor(() => {
      expect(formationFormData.businessName).toEqual("Pizza Joint");
    });
    expect(formationFormData.businessSuffix).toEqual("LLP");
    expect(formationFormData.businessStartDate).toEqual(threeDaysFromNow.format("YYYY-MM-DD"));
    expect(formationFormData.businessAddressLine1).toEqual("1234 main street");
    expect(formationFormData.businessAddressLine2).toEqual("Suite 304");
    expect(formationFormData.businessAddressState).toEqual("NJ");
    expect(formationFormData.businessAddressZipCode).toEqual("08001");
    expect(formationFormData.agentNumberOrManual).toEqual("MANUAL_ENTRY");
    expect(formationFormData.agentNumber).toEqual("");
    expect(formationFormData.agentName).toEqual("Hugo Weaving");
    expect(formationFormData.agentEmail).toEqual("name@example.com");
    expect(formationFormData.agentOfficeAddressLine1).toEqual("400 Pennsylvania Ave");
    expect(formationFormData.agentOfficeAddressLine2).toEqual("Suite 101");
    expect(formationFormData.agentOfficeAddressCity).toEqual("Newark");
    expect(formationFormData.agentOfficeAddressState).toEqual("NJ");
    expect(formationFormData.agentOfficeAddressZipCode).toEqual("08002");
    expect(formationFormData.businessPurpose).toEqual("to take over the world");
    expect(formationFormData.signer).toEqual({
      name: "Elrond",
      signature: true,
    });
    expect(formationFormData.additionalSigners).toEqual([]);
    expect(formationFormData.contactFirstName).toEqual("John");
    expect(formationFormData.contactLastName).toEqual("Smith");
    expect(formationFormData.contactPhoneNumber).toEqual("1234567890");
    expect(formationFormData.paymentType).toEqual("CC");
    expect(formationFormData.officialFormationDocument).toEqual(true);
    expect(formationFormData.certificateOfStanding).toEqual(true);
    expect(formationFormData.certifiedCopyOfFormationDocument).toEqual(true);
    expect(formationFormData.annualReportNotification).toEqual(true);
    expect(formationFormData.corpWatchNotification).toEqual(false);
  });

  it("navigates from business tab to payment tab and back to business tab", async () => {
    const page = preparePage({}, displayContent);
    await page.submitBusinessNameTab();
    await page.submitBusinessTab();
    await page.submitContactsTab();
    await page.submitReviewTab();

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
    await waitFor(() => {
      expect(screen.getByTestId("review-section")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
    await waitFor(() => {
      expect(screen.getByTestId("contacts-section")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
    await waitFor(() => {
      expect(screen.getByTestId("business-section")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
    await waitFor(() => {
      expect(screen.getByTestId("business-name-section")).toBeInTheDocument();
    });
  });

  it("loads different displayContent depending on users LegalStructureId", async () => {
    const profileData = generateFormationProfileData({});
    const page = preparePage({ profileData }, displayContent);
    await page.submitBusinessNameTab();
    await page.submitBusinessTab();
    expect(
      screen.getByText(
        `${displayContent[profileData.legalStructureId as FormationLegalType].agentNumberOrManual.contentMd}`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        `${
          displayContent[
            FormationLegalTypes.filter(
              (id: FormationLegalType) => id != profileData.legalStructureId
            ).pop() as FormationLegalType
          ].agentNumberOrManual.contentMd
        }`
      )
    ).not.toBeInTheDocument();
  });
});
