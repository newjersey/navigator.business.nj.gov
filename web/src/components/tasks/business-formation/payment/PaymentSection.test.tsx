import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateFormationSubmitError,
  generateFormationSubmitResponse,
  generateUser,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  mockApiResponse,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import { mockPush } from "@/test/mock/mockRouter";
import { userDataUpdatedNTimes } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import FormationErrors from "@businessnjgovnavigator/content/fieldConfig/formation-error.json";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  ProfileData,
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

describe("Formation - PaymentSection", () => {
  const defaultContent = {
    officialFormationDocument: {
      contentMd: "Official formation document",
      cost: 125,
    },
    certificateOfStanding: {
      contentMd: "Certificate of standing",
      cost: 50,
      optionalLabel: "",
    },
    certifiedCopyOfFormationDocument: {
      contentMd: "Certified copy of formation document",
      cost: 25,
      optionalLabel: "",
    },
  };
  const displayContent = generateFormationDisplayContent({
    "limited-liability-company": defaultContent,
  });

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    initialUser?: Partial<BusinessUser>
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(
        formationFormData,
        profileData.legalStructureId as FormationLegalType
      ),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const page = preparePage(
      generateUserData({
        profileData,
        formationData,
        user,
      }),
      displayContent
    );

    await page.submitBusinessNameTab();
    await page.submitBusinessTab();
    await page.submitContactsTab();
    await page.submitReviewTab();
    return page;
  };

  it("auto-fills fields from userData if it exists", async () => {
    const page = await getPageHelper(
      {},
      {
        paymentType: "CC",
        contactFirstName: `John`,
        contactLastName: `Smith`,
        contactPhoneNumber: `6024153214`,
        annualReportNotification: true,
        corpWatchNotification: true,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: true,
      }
    );

    expect(screen.getByText(Config.businessFormationDefaults.creditCardPaymentTypeLabel)).toBeInTheDocument();
    expect(page.getInputElementByLabel("Contact first name").value).toBe("John");
    expect(page.getInputElementByLabel("Contact last name").value).toBe("Smith");
    expect(page.getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
    expect(page.getInputElementByLabel(Config.businessFormationDefaults.optInAnnualReportText).checked).toBe(
      true
    );
    expect(page.getInputElementByLabel(Config.businessFormationDefaults.optInCorpWatchText).checked).toBe(
      true
    );
    expect(page.getInputElementByLabel("Official formation document").checked).toBe(true);
    expect(page.getInputElementByLabel("Certificate of standing").checked).toBe(false);
    expect(page.getInputElementByLabel("Certified copy of formation document").checked).toBe(true);
    expect(page.getInputElementByLabel("Credit card").checked).toBe(true);
    expect(page.getInputElementByLabel("E check").checked).toBe(false);
  });

  it("updates total and subtotals correctly", async () => {
    const page = await getPageHelper(
      {},
      {
        paymentType: undefined,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: false,
      }
    );

    expect(screen.getByLabelText("Subtotal")).toHaveTextContent("125");
    page.selectCheckbox("Certificate of standing");
    expect(screen.getByLabelText("Subtotal")).toHaveTextContent("175");
    page.selectCheckbox("Certified copy of formation document");
    expect(screen.getByLabelText("Subtotal")).toHaveTextContent("200");
    expect(screen.getByLabelText("Total")).toHaveTextContent("200");
    page.selectCheckbox("Certificate of standing");
    expect(screen.getByLabelText("Subtotal")).toHaveTextContent("150");
    expect(screen.getByLabelText("Total")).toHaveTextContent("150");
    fireEvent.click(screen.getByLabelText("Credit card"));
    expect(screen.getByLabelText("Total")).toHaveTextContent(
      (
        150 +
        Number.parseFloat(Config.businessFormationDefaults.creditCardPaymentCostInitial) +
        Number.parseFloat(Config.businessFormationDefaults.creditCardPaymentCostExtra)
      ).toString()
    );
    fireEvent.click(screen.getByLabelText("E check"));
    const numberOfDocuments = 2;
    expect(screen.getByLabelText("Total")).toHaveTextContent(
      (
        150 +
        Number.parseFloat(Config.businessFormationDefaults.achPaymentCost) * numberOfDocuments
      ).toString()
    );
  });

  it("uses name from profile when business formation data is not set", async () => {
    const page = await getPageHelper(
      {},
      {
        contactFirstName: "",
        contactLastName: "",
      },
      { name: "Mike Jones" }
    );

    expect(page.getInputElementByLabel("Contact first name").value).toEqual("Mike");
    expect(page.getInputElementByLabel("Contact last name").value).toEqual("Jones");
  });

  it("uses name from formation data when it exists", async () => {
    const page = await getPageHelper(
      {},
      {
        contactFirstName: "Actual",
        contactLastName: "Name",
      },
      { name: "Some Wrong Name" }
    );

    expect(page.getInputElementByLabel("Contact first name").value).toEqual("Actual");
    expect(page.getInputElementByLabel("Contact last name").value).toEqual("Name");
  });

  it("redirects to payment redirect URL on success", async () => {
    mockApiResponse(
      generateFormationSubmitResponse({
        success: true,
        redirect: "www.example.com",
      })
    );

    const page = await getPageHelper({}, {});
    await page.clickSubmit();
    expect(mockPush).toHaveBeenCalledWith("www.example.com");
  });

  it("displays error messages on error and hides error when payment page is revisited", async () => {
    mockApiResponse(
      generateFormationSubmitResponse({
        success: false,
        errors: [
          generateFormationSubmitError({
            field: "some field 1",
            message: "very bad input",
            type: "RESPONSE",
          }),
          generateFormationSubmitError({
            field: "some field 2",
            message: "must be nj zipcode",
            type: "RESPONSE",
          }),
        ],
      })
    );

    const page = await getPageHelper({}, {});
    await page.clickSubmit();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByText("some field 1")).toBeInTheDocument();
    expect(screen.getByText("very bad input")).toBeInTheDocument();
    expect(screen.getByText("some field 2")).toBeInTheDocument();
    expect(screen.getByText("must be nj zipcode")).toBeInTheDocument();

    fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));

    await waitFor(() => {
      expect(screen.getByTestId("review-section")).toBeInTheDocument();
    });

    await page.submitReviewTab();

    expect(screen.queryByText("some field 1")).not.toBeInTheDocument();
    expect(screen.queryByText("very bad input")).not.toBeInTheDocument();
    expect(screen.queryByText("some field 2")).not.toBeInTheDocument();
    expect(screen.queryByText("must be nj zipcode")).not.toBeInTheDocument();
  });

  describe("required fields", () => {
    it("Contact first name", async () => {
      const page = await getPageHelper({}, { contactFirstName: "" }, { name: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Contact last name", async () => {
      const page = await getPageHelper({}, { contactLastName: "" }, { name: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Contact phone number", async () => {
      const page = await getPageHelper({}, { contactPhoneNumber: "" });
      await page.clickSubmit();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });

    it("Payment type", async () => {
      const page = await getPageHelper({}, { paymentType: undefined });
      await page.clickSubmit();
      expect(screen.getByText(Config.businessFormationDefaults.paymentTypeErrorText)).toBeInTheDocument();
      expect(
        screen.getByText(
          FormationErrors.inlineErrors.find((i) => i.fields.includes("paymentType"))?.label as string,
          {
            exact: false,
          }
        )
      ).toBeInTheDocument();
      expect(userDataUpdatedNTimes()).toEqual(3);
    });
  });
});
