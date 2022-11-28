import { generateFormationDisplayContent, generateUser, generateUserData } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers-formation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  generateFormationFormData,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => {
  return mockMaterialUI();
});
jest.mock("@/lib/data-hooks/useUserData", () => {
  return { useUserData: jest.fn() };
});
jest.mock("@/lib/data-hooks/useRoadmap", () => {
  return { useRoadmap: jest.fn() };
});
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});
jest.mock("@/lib/api-client/apiClient", () => {
  return {
    postBusinessFormation: jest.fn(),
    getCompletedFiling: jest.fn(),
    searchBusinessName: jest.fn(),
  };
});
jest.mock("@/lib/roadmap/buildUserRoadmap", () => {
  return { buildUserRoadmap: jest.fn() };
});

describe("Formation - BillingStep", () => {
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
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: profileData.legalStructureId as FormationLegalType,
      }),
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

    await page.stepperClickToBillingStep();
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

  describe("required fields", () => {
    it("Contact first name", async () => {
      const page = await getPageHelper({}, { contactFirstName: "" }, { name: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.contactFirstName
      );
      expect(
        screen.getByText(Config.businessFormationDefaults.contactFirstNameErrorText)
      ).toBeInTheDocument();
    });

    it("Contact last name", async () => {
      const page = await getPageHelper({}, { contactLastName: "" }, { name: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.contactLastName
      );
      expect(screen.getByText(Config.businessFormationDefaults.contactLastNameErrorText)).toBeInTheDocument();
    });

    it("Contact phone number", async () => {
      const page = await getPageHelper({}, { contactPhoneNumber: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.contactPhoneNumber
      );
      expect(
        screen.getByText(Config.businessFormationDefaults.contactPhoneNumberErrorText)
      ).toBeInTheDocument();
    });

    it("Payment type", async () => {
      const page = await getPageHelper({}, { paymentType: undefined });
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.paymentType
      );
      expect(screen.getByTestId("payment-alert")).toHaveTextContent(
        Config.businessFormationDefaults.paymentTypeErrorText
      );
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers) => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToBillingStep();
  };
});
