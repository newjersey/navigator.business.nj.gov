/* eslint-disable @typescript-eslint/no-explicit-any */

import { getDollarValue } from "@/lib/utils/formatters";
import { generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import {
  BusinessUser,
  FormationFormData,
  FormationLegalType,
  generateBusiness,
  generateFormationFormData,
  generateUser,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { FormationDbaDisplayContent } from "@businessnjgovnavigator/shared/types";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

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
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - BillingStep", () => {
  const displayContent: FormationDbaDisplayContent = {
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const subtotalLabel = Config.formation.fields.paymentType.costSubtotalLabel;
  const totalLabel = "Total";

  const composeSubTotalAria = (subTotalNumber: number): string => {
    return `${subtotalLabel} ${getDollarValue(subTotalNumber)}`;
  };

  const composeTotalAria = (totalNumber: number): string => {
    return `* ${totalLabel} ${getDollarValue(totalNumber)}`;
  };

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    initialUser?: Partial<BusinessUser>,
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
      },
    );

    expect(
      screen.getByText(Config.formation.fields.paymentType.creditCardLabel),
    ).toBeInTheDocument();
    expect(page.getInputElementByLabel("Contact first name").value).toBe("John");
    expect(page.getInputElementByLabel("Contact last name").value).toBe("Smith");
    expect(page.getInputElementByLabel("Contact phone number").value).toBe("(602) 415-3214");
    expect(
      page.getInputElementByLabel(Config.formation.fields.annualReportNotification.checkboxText)
        .checked,
    ).toBe(true);
    expect(
      page.getInputElementByLabel(Config.formation.fields.corpWatchNotification.checkboxText)
        .checked,
    ).toBe(true);

    expect(
      page.getInputElementByParentTestId("officialFormationDocument-checkbox", { type: "checkbox" })
        .checked,
    ).toBe(true);
    expect(
      page.getInputElementByParentTestId("certificateOfStanding-checkbox", { type: "checkbox" })
        .checked,
    ).toBe(false);
    expect(
      page.getInputElementByParentTestId("certifiedCopyOfFormationDocument-checkbox", {
        type: "checkbox",
      }).checked,
    ).toBe(true);

    expect(
      page.getInputElementByLabel(Config.formation.fields.paymentType.creditCardLabel).checked,
    ).toBe(true);
    expect(page.getInputElementByLabel(Config.formation.fields.paymentType.achLabel).checked).toBe(
      false,
    );
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
          },
        );
        const officialFormationCost = Number.parseInt(
          Config.formation.fields.officialFormationDocument.cost,
        );
        const standingCost = Number.parseInt(Config.formation.fields.certificateOfStanding.cost);
        const expectedTotal = officialFormationCost + standingCost;

        expect(
          screen.getByRole("generic", { name: composeTotalAria(expectedTotal) }),
        ).toHaveTextContent(getDollarValue(expectedTotal));
        expect(
          screen.getByRole("generic", { name: composeSubTotalAria(expectedTotal) }),
        ).toHaveTextContent(getDollarValue(expectedTotal));
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
          },
        );

        const officialFormationCost = Number.parseInt(
          Config.formation.fields.officialFormationDocument.cost,
        );
        const standingCost = Number.parseInt(
          (Config.formation.fields.certificateOfStanding.overrides as any)[legalStructureId].cost,
        );
        const expectedTotal = officialFormationCost + standingCost;

        expect(
          screen.getByRole("generic", { name: composeSubTotalAria(expectedTotal) }),
        ).toHaveTextContent(expectedTotal.toString());
        expect(
          screen.getByRole("generic", { name: composeTotalAria(expectedTotal) }),
        ).toHaveTextContent(expectedTotal.toString());
      });
    }
  });

  it("updates total and subtotals correctly", async () => {
    const officialFormationCost = Number.parseInt(
      Config.formation.fields.officialFormationDocument.cost,
    );
    const certifiedCopyCost = Number.parseInt(
      Config.formation.fields.certifiedCopyOfFormationDocument.cost,
    );
    const certificateStandingCost = Number.parseInt(
      Config.formation.fields.certificateOfStanding.cost,
    );

    const ccInitialCost = Number.parseFloat(
      Config.formation.fields.paymentType.paymentCosts.creditCardInitial,
    );
    const ccExtraCost = Number.parseFloat(
      Config.formation.fields.paymentType.paymentCosts.creditCardExtra,
    );
    const achCost = Number.parseFloat(Config.formation.fields.paymentType.paymentCosts.ach);

    const page = await getPageHelper(
      { legalStructureId: "limited-liability-company" },
      {
        paymentType: undefined,
        officialFormationDocument: true,
        certificateOfStanding: false,
        certifiedCopyOfFormationDocument: false,
      },
    );

    expect(
      screen.getByRole("generic", { name: composeSubTotalAria(officialFormationCost) }),
    ).toHaveTextContent(officialFormationCost.toString());
    page.selectCheckboxByTestId("certificateOfStanding");
    expect(
      screen.getByRole("generic", {
        name: composeSubTotalAria(officialFormationCost + certificateStandingCost),
      }),
    ).toHaveTextContent((officialFormationCost + certificateStandingCost).toString());
    page.selectCheckboxByTestId("certifiedCopyOfFormationDocument");
    expect(
      screen.getByRole("generic", {
        name: composeSubTotalAria(
          officialFormationCost + certificateStandingCost + certifiedCopyCost,
        ),
      }),
    ).toHaveTextContent(
      (officialFormationCost + certificateStandingCost + certifiedCopyCost).toString(),
    );
    expect(
      screen.getByRole("generic", {
        name: composeTotalAria(officialFormationCost + certificateStandingCost + certifiedCopyCost),
      }),
    ).toHaveTextContent(
      (officialFormationCost + certificateStandingCost + certifiedCopyCost).toString(),
    );
    page.selectCheckboxByTestId("certificateOfStanding");
    const finalTotal = officialFormationCost + certifiedCopyCost;

    expect(
      screen.getByRole("generic", { name: composeSubTotalAria(finalTotal) }),
    ).toHaveTextContent(finalTotal.toString());
    expect(screen.getByRole("generic", { name: composeTotalAria(finalTotal) })).toHaveTextContent(
      finalTotal.toString(),
    );

    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.creditCardLabel));
    expect(
      screen.getByRole("generic", {
        name: composeTotalAria(finalTotal + ccInitialCost + ccExtraCost),
      }),
    ).toHaveTextContent((finalTotal + ccInitialCost + ccExtraCost).toString());
    fireEvent.click(screen.getByLabelText(Config.formation.fields.paymentType.achLabel));
    const numberOfDocuments = 2;
    expect(
      screen.getByRole("generic", {
        name: composeTotalAria(finalTotal + achCost * numberOfDocuments),
      }),
    ).toHaveTextContent((finalTotal + achCost * numberOfDocuments).toString());
  });

  it("uses name from profile when business formation data is not set", async () => {
    const page = await getPageHelper(
      {},
      {
        contactFirstName: "",
        contactLastName: "",
      },
      { name: "Mike Jones" },
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
      { name: "Some Wrong Name" },
    );

    expect(page.getInputElementByLabel("Contact first name").value).toEqual("Actual");
    expect(page.getInputElementByLabel("Contact last name").value).toEqual("Name");
  });

  describe("required fields", () => {
    it("Contact first name", async () => {
      const page = await getPageHelper({}, { contactFirstName: "" }, { name: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.contactFirstName.label,
      );
      expect(screen.getByText(Config.formation.fields.contactFirstName.error)).toBeInTheDocument();
    });

    it("Contact last name", async () => {
      const page = await getPageHelper({}, { contactLastName: "" }, { name: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.contactLastName.label,
      );
      expect(screen.getByText(Config.formation.fields.contactLastName.error)).toBeInTheDocument();
    });

    it("Contact phone number", async () => {
      const page = await getPageHelper({}, { contactPhoneNumber: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.formation.fields.contactPhoneNumber.label,
      );
      expect(
        screen.getByText(Config.formation.fields.contactPhoneNumber.error),
      ).toBeInTheDocument();
    });

    it("Payment type", async () => {
      const page = await getPageHelper({}, { paymentType: undefined });
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.formation.fields.paymentType.label,
      );
    });
  });

  const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
    await page.stepperClickToReviewStep();
    await page.clickSubmit();
    await page.stepperClickToBillingStep();
  };
});
