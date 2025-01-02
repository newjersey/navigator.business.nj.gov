/* eslint-disable @typescript-eslint/no-explicit-any */

import { getMergedConfig } from "@/contexts/configContext";
import { TasksDisplayContent } from "@/lib/types/types";
import { generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks
} from "@/test/helpers/helpers-formation";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  generateBusiness,
  generateFormationFormData,
  generateUser,
  ProfileData
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

const Config = getMergedConfig();

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/data-hooks/useDocuments");
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: vi.fn(),
  getCompletedFiling: vi.fn(),
  searchBusinessName: vi.fn(),
}));

describe("Formation - BillingStep", () => {
  const displayContent: TasksDisplayContent = {
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useSetupInitialMocks();
  });

  const subtotalLabel = Config.formation.fields.paymentType.costSubtotalLabel;
  const totalLabel = "Total";

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
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    const user = initialUser ? generateUser(initialUser) : generateUser({});
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const page = preparePage({
      business: generateBusiness({
        profileData,
        formationData,
      }),
      displayContent,
      user,
    });

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

    expect(screen.getByText(Config.formation.fields.paymentType.creditCardLabel)).toBeInTheDocument();
    expect(page.getInputElementByLabel("Contact first name").value).toBe("John");
    expect(page.getInputElementByLabel("Contact last name").value).toBe("Smith");
    expect(page.getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
    expect(
      page.getInputElementByLabel(Config.formation.fields.annualReportNotification.checkboxText).checked
    ).toBe(true);
    expect(
      page.getInputElementByLabel(Config.formation.fields.corpWatchNotification.checkboxText).checked
    ).toBe(true);

    expect(
      page.getInputElementByParentTestId("officialFormationDocument-checkbox", { type: "checkbox" }).checked
    ).toBe(true);
    expect(
      page.getInputElementByParentTestId("certificateOfStanding-checkbox", { type: "checkbox" }).checked
    ).toBe(false);
    expect(
      page.getInputElementByParentTestId("certifiedCopyOfFormationDocument-checkbox", { type: "checkbox" })
        .checked
    ).toBe(true);

    expect(page.getInputElementByLabel(Config.formation.fields.paymentType.creditCardLabel).checked).toBe(
      true
    );
    expect(page.getInputElementByLabel(Config.formation.fields.paymentType.achLabel).checked).toBe(false);
  });

  describe("certificateOfStanding", () => {
    const defaultCostIds = ["limited-liability-company", "limited-liability-partnership"];
    const overriddenCostIds = ["s-corporation", "c-corporation", "limited-partnership"];

    for (const legalStructureId of defaultCostIds) {
      it(`uses default cost for ${legalStructureId}`, async () => {
        await getPageHelper(
          { legalStructureId },
          {
            paymentType: undefined,
            officialFormationDocument: true,
            certificateOfStanding: true,
            certifiedCopyOfFormationDocument: false,
          }
        );
        const officialFormationCost = Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
        const standingCost = Number.parseInt(Config.formation.fields.certificateOfStanding.cost);
        const expectedTotal = officialFormationCost + standingCost;

        expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(expectedTotal.toString());
        expect(screen.getByLabelText(totalLabel)).toHaveTextContent(expectedTotal.toString());
      });
    }

    for (const legalStructureId of overriddenCostIds) {
      it(`uses override cost for ${legalStructureId}`, async () => {
        await getPageHelper(
          { legalStructureId },
          {
            paymentType: undefined,
            officialFormationDocument: true,
            certificateOfStanding: true,
            certifiedCopyOfFormationDocument: false,
          }
        );

        const officialFormationCost = Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
        const standingCost = Number.parseInt(
          (Config.formation.fields.certificateOfStanding.overrides as any)[legalStructureId].cost
        );
        const expectedTotal = officialFormationCost + standingCost;

        expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(expectedTotal.toString());
        expect(screen.getByLabelText(totalLabel)).toHaveTextContent(expectedTotal.toString());
      });
    }
  });

  it("updates total and subtotals correctly", async () => {
    const officialFormationCost = Number.parseInt(Config.formation.fields.officialFormationDocument.cost);
    const certifiedCopyCost = Number.parseInt(Config.formation.fields.certifiedCopyOfFormationDocument.cost);
    const certificateStandingCost = Number.parseInt(Config.formation.fields.certificateOfStanding.cost);

    const ccInitialCost = Number.parseFloat(
      Config.formation.fields.paymentType.paymentCosts.creditCardInitial
    );
    const ccExtraCost = Number.parseFloat(Config.formation.fields.paymentType.paymentCosts.creditCardExtra);
    const achCost = Number.parseFloat(Config.formation.fields.paymentType.paymentCosts.ach);

    const page = await getPageHelper(
      { legalStructureId: "limited-liability-company" },
      {
        paymentType: undefined,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: false,
      }
    );

    expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(officialFormationCost.toString());
    page.selectCheckboxByTestId("certificateOfStanding");
    expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(
      (officialFormationCost + certificateStandingCost).toString()
    );
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");
    expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(
      (officialFormationCost + certificateStandingCost + certifiedCopyCost).toString()
    );
    expect(screen.getByLabelText(totalLabel)).toHaveTextContent(
      (officialFormationCost + certificateStandingCost + certifiedCopyCost).toString()
    );
    page.selectCheckboxByTestId("certificateOfStanding");
    const finalTotal = officialFormationCost + certifiedCopyCost;

    expect(screen.getByLabelText(subtotalLabel)).toHaveTextContent(finalTotal.toString());
    expect(screen.getByLabelText(totalLabel)).toHaveTextContent(finalTotal.toString());

    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    expect(screen.getByLabelText(totalLabel)).toHaveTextContent(
      (finalTotal + ccInitialCost + ccExtraCost).toString()
    );
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.achLabel));
    const numberOfDocuments = 2;
    expect(screen.getByLabelText(totalLabel)).toHaveTextContent(
      (finalTotal + achCost * numberOfDocuments).toString()
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
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.contactFirstName.label);
      expect(screen.getByText(Config.formation.fields.contactFirstName.error)).toBeInTheDocument();
    });

    it("Contact last name", async () => {
      const page = await getPageHelper({}, { contactLastName: "" }, { name: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.contactLastName.label);
      expect(screen.getByText(Config.formation.fields.contactLastName.error)).toBeInTheDocument();
    });

    it("Contact phone number", async () => {
      const page = await getPageHelper({}, { contactPhoneNumber: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(Config.formation.fields.contactPhoneNumber.label);
      expect(screen.getByText(Config.formation.fields.contactPhoneNumber.error)).toBeInTheDocument();
    });

    it("Payment type", async () => {
      const page = await getPageHelper({}, { paymentType: undefined });
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(Config.formation.fields.paymentType.label);
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToBillingStep();
  };
});
