import { getMergedConfig } from "@/contexts/configContext";
import { generateFormationDbaContent } from "@/test/factories";
import {
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { withMarkup } from "@/test/helpers/helpers-testing-library-selectors";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import {
  arrayOfCountriesObjects,
  castPublicFilingLegalTypeToFormationType,
  defaultDateFormat,
  FormationFormData,
  generateFormationFormData,
  generateFormationSigner,
  generateMunicipality,
  ProfileData,
  PublicFilingLegalType,
  randomInt,
} from "@businessnjgovnavigator/shared";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import * as materialUi from "@mui/material";
import { fireEvent, screen, within } from "@testing-library/react";

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

describe("Formation - ReviewStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const renderStep = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>
  ) => {
    const profileData = generateFormationProfileData(initialProfileData);
    const isForeign = profileData.businessPersona == "FOREIGN";
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: castPublicFilingLegalTypeToFormationType(
          profileData.legalStructureId as PublicFilingLegalType,
          profileData.businessPersona
        ),
      }),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    const page = preparePage(
      {
        profileData,
        formationData,
      },
      {
        formationDbaContent: generateFormationDbaContent({}),
      }
    );

    if (isForeign) {
      await page.fillAndSubmitNexusBusinessNameStep(formationFormData.businessName);
    }
    await page.stepperClickToReviewStep();
  };

  it("displays business name entered in step 1 as part of business designator line", async () => {
    const initialProfileData: Partial<ProfileData> = {
      businessName: "name in profile",
    };
    const formationFormData = { businessName: "name entered in step 1" };
    await renderStep(initialProfileData, formationFormData);
    const designatorSection = within(screen.getByTestId("review-suffix-and-start-date"));
    expect(designatorSection.getByText("name entered in step 1", { exact: false })).toBeInTheDocument();
    expect(designatorSection.queryByText("name in profile", { exact: false })).not.toBeInTheDocument();
  });

  it("displays the business step when the edit button in the main business section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name-step"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the location section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-location-step"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the contacts step when the edit button in the registered agent section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-registered-agent-step"));
    expect(screen.getByTestId("contacts-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the business purpose section is clicked", async () => {
    await renderStep({}, { businessPurpose: "some purpose" });
    fireEvent.click(screen.getByTestId("edit-business-purpose"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the provisions section is clicked", async () => {
    await renderStep({}, { provisions: ["some provision"] });
    fireEvent.click(screen.getByTestId("edit-provisions-step"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the contacts step when the edit button in the signatures section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-signature-step"));
    expect(screen.getByTestId("contacts-step")).toBeInTheDocument();
  });

  it("displays agent number on review step", async () => {
    await renderStep({}, { agentNumberOrManual: "NUMBER" });
    expect(screen.getByTestId("agent-number")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-manual-entry")).not.toBeInTheDocument();
  });

  it("displays manually entered registered agent info on review step", async () => {
    await renderStep({}, { agentNumberOrManual: "MANUAL_ENTRY" });
    expect(screen.queryByTestId("agent-number")).not.toBeInTheDocument();
    expect(screen.getByTestId("agent-manual-entry")).toBeInTheDocument();
  });

  it("does not display members section within review step when members do not exist", async () => {
    await renderStep({ legalStructureId: "limited-liability-company" }, { members: [] });
    expect(screen.queryByTestId("edit-members-step")).not.toBeInTheDocument();
  });

  it("displays business purpose on review step", async () => {
    await renderStep({}, { businessPurpose: "some cool purpose" });
    expect(screen.getByTestId("business-purpose")).toBeInTheDocument();
    expect(screen.getByText("some cool purpose")).toBeInTheDocument();
  });

  it("displays foreign date of formation within review step", async () => {
    await renderStep(
      { businessPersona: "FOREIGN" },
      { businessStartDate: getCurrentDate().format(defaultDateFormat), foreignDateOfFormation: "2021-01-01" }
    );
    expect(screen.getByTestId("foreign-date-of-formation")).toBeInTheDocument();
    expect(screen.getByText("01/01/2021")).toBeInTheDocument();
  });

  it("does not display foreign date of formation within review step when non-foreign", async () => {
    await renderStep({ businessPersona: "STARTING" }, {});
    expect(screen.queryByTestId("foreign-date-of-formation")).not.toBeInTheDocument();
  });

  it("display foreign state of formation within review step", async () => {
    await renderStep(
      { businessPersona: "FOREIGN" },
      { addressState: { name: "Alabama", shortCode: "AL" }, foreignStateOfFormation: "Virgin Islands" }
    );
    expect(screen.getByTestId("foreign-state-of-formation")).toBeInTheDocument();
    expect(screen.getByText("Virgin Islands")).toBeInTheDocument();
  });

  it("does not display foreign state of formation within review step when non-foreign", async () => {
    await renderStep({ businessPersona: "STARTING" }, {});
    expect(screen.queryByTestId("foreign-state-of-formation")).not.toBeInTheDocument();
  });

  it("does not display members section within review step when foreign", async () => {
    await renderStep({ businessPersona: "FOREIGN" }, {});
    expect(screen.queryByTestId("edit-members-step")).not.toBeInTheDocument();
  });

  it("does not include country in address when non-intl", async () => {
    await renderStep({ businessPersona: "FOREIGN" }, { addressCountry: "US", businessLocationType: "US" });
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      screen.queryByText(arrayOfCountriesObjects.find((cu) => cu.shortCode == "US")!.name, { exact: false })
    ).not.toBeInTheDocument();
  });

  it("include country in address when intl", async () => {
    await renderStep({ businessPersona: "FOREIGN" }, { addressCountry: "US", businessLocationType: "INTL" });
    expect(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      screen.getByText(arrayOfCountriesObjects.find((cu) => cu.shortCode == "US")!.name, { exact: false })
    ).toBeInTheDocument();
  });

  it("displays state name in address when non-intl", async () => {
    await renderStep(
      { businessPersona: "FOREIGN" },
      {
        addressState: { name: "Alabama", shortCode: "AL" },
        businessLocationType: "US",
        foreignStateOfFormation: "Alaska",
      }
    );
    expect(screen.getByText("Alabama", { exact: false })).toBeInTheDocument();
  });

  it("displays province name in address when intl", async () => {
    await renderStep(
      { businessPersona: "FOREIGN" },
      { addressProvince: "Random place whatever", businessLocationType: "INTL" }
    );
    expect(screen.getByText("Random place whatever", { exact: false })).toBeInTheDocument();
  });

  it("displays city name in address when non-nj", async () => {
    await renderStep(
      { businessPersona: "FOREIGN" },
      {
        foreignAddressCity: "Roflcopterville",
        businessLocationType: randomInt() % 2 ? "INTL" : "US",
      }
    );
    expect(screen.getByText("Roflcopterville", { exact: false })).toBeInTheDocument();
  });

  it("displays Municipality name in address when NJ", async () => {
    await renderStep(
      {
        businessPersona: "STARTING",
        municipality: generateMunicipality({
          displayName: "Some city",
        }),
      },
      {
        businessLocationType: "NJ",
      }
    );
    expect(screen.getByText("Some city", { exact: false })).toBeInTheDocument();
  });

  it("displays provisions on review step", async () => {
    await renderStep({}, { provisions: ["provision1", "provision2"] });
    expect(screen.getByTestId("provisions")).toBeInTheDocument();
    expect(screen.getByText("provision1")).toBeInTheDocument();
    expect(screen.getByText("provision2")).toBeInTheDocument();
    expect(
      screen.getAllByText(Config.formation.fields.provisions.reviewStepSubheader, { exact: false })
    ).toHaveLength(2);
  });

  it("does not display provisions within review step when they are empty", async () => {
    await renderStep({}, { provisions: [] });
    expect(screen.queryByTestId("provisions")).not.toBeInTheDocument();
  });

  it("displays different titles when legalStructure is a ForProfit Corporation", async () => {
    await renderStep({ legalStructureId: "c-corporation" }, {});
    expect(
      screen.getByText(markdownToText(Config.formation.fields.directors.reviewStepHeader))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.formation.fields.incorporators.reviewStepHeader))
    ).toBeInTheDocument();
  });

  it("displays different titles when legalStructure is an llc", async () => {
    await renderStep({ legalStructureId: "limited-liability-company" }, {});
    expect(
      screen.getByText(markdownToText(Config.formation.fields.members.reviewStepHeader))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.formation.fields.signers.reviewStepHeader))
    ).toBeInTheDocument();
  });

  it("does not displays signer titles when domestic", async () => {
    await renderStep(
      { businessPersona: "STARTING", legalStructureId: "limited-liability-company" },
      { signers: [generateFormationSigner({ name: "The Dude", title: "Authorized Partner" })] }
    );
    expect(
      screen.queryByText(markdownToText(Config.formation.fields.signers.reviewStepTitleLabel))
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Authorized Partner", { exact: false })).not.toBeInTheDocument();
  });

  it("displays signer titles when foreign", async () => {
    await renderStep(
      { businessPersona: "FOREIGN", legalStructureId: "limited-liability-company" },
      { signers: [generateFormationSigner({ name: "The Dude", title: "Authorized Partner" })] }
    );
    expect(
      screen.getByText(markdownToText(Config.formation.fields.signers.reviewStepTitleLabel))
    ).toBeInTheDocument();
    expect(screen.getByText("Authorized Partner", { exact: false })).toBeInTheDocument();
  });

  describe("when lp", () => {
    const legalStructureId = "limited-partnership";

    it("does not display the members section", async () => {
      await renderStep({ legalStructureId }, {});
      expect(screen.queryByTestId("edit-members-step")).not.toBeInTheDocument();
    });

    it("displays withdrawals on review step", async () => {
      await renderStep({ legalStructureId }, { withdrawals: "withdrawl stuff" });
      expect(screen.getByText(Config.formation.fields.withdrawals.reviewStepLabel)).toBeInTheDocument();
      expect(screen.getByText("withdrawl stuff")).toBeInTheDocument();
    });

    it("displays dissolution on review step", async () => {
      await renderStep({ legalStructureId }, { dissolution: "dissolution stuff" });
      expect(screen.getByText(Config.formation.fields.dissolution.reviewStepLabel)).toBeInTheDocument();
      expect(screen.getByText("dissolution stuff")).toBeInTheDocument();
    });

    it("displays combined-investment on review step", async () => {
      await renderStep({ legalStructureId }, { combinedInvestment: "combinedInvestment stuff" });
      expect(
        screen.getByText(Config.formation.fields.combinedInvestment.reviewStepLabel)
      ).toBeInTheDocument();
      expect(screen.getByText("combinedInvestment stuff")).toBeInTheDocument();
    });

    it("displays partnership rights on review step", async () => {
      await renderStep(
        { legalStructureId },
        {
          canCreateLimitedPartner: true,
          createLimitedPartnerTerms: "partnerTerms whatever",
          canGetDistribution: false,
          getDistributionTerms: "get distro terms",
          canMakeDistribution: true,
          makeDistributionTerms: "make distro terms",
        }
      );
      const getByMarkup = withMarkup(screen.getByText);
      expect(screen.getByText(Config.formation.partnershipRights.reviewStepHeader)).toBeInTheDocument();
      expect(
        getByMarkup(markdownToText(Config.formation.fields.canCreateLimitedPartner.reviewStepYes))
      ).toBeInTheDocument();
      expect(screen.getByText("partnerTerms whatever")).toBeInTheDocument();
      expect(
        getByMarkup(markdownToText(Config.formation.fields.canGetDistribution.reviewStepNo))
      ).toBeInTheDocument();
      expect(screen.queryByText("get distro terms")).not.toBeInTheDocument();
      expect(
        getByMarkup(markdownToText(Config.formation.fields.canMakeDistribution.reviewStepYes))
      ).toBeInTheDocument();
      expect(screen.getByText("make distro terms")).toBeInTheDocument();
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("displays the contacts step when the edit button in the members section is clicked", async () => {
      await renderStep({ legalStructureId }, {});
      fireEvent.click(screen.getByTestId("edit-members-step"));
      expect(screen.getByTestId("contacts-step")).toBeInTheDocument();
    });

    it("does not display partnership rights on review step", async () => {
      await renderStep(
        { legalStructureId },
        {
          canCreateLimitedPartner: true,
          createLimitedPartnerTerms: "partnerTerms whatever",
          canGetDistribution: false,
          getDistributionTerms: "get distro terms",
          canMakeDistribution: true,
          makeDistributionTerms: "make distro terms",
        }
      );
      expect(screen.queryByText(Config.formation.partnershipRights.reviewStepHeader)).not.toBeInTheDocument();
    });

    it("does not display withdrawals on review step", async () => {
      await renderStep({ legalStructureId }, { withdrawals: "withdrawl stuff" });
      expect(screen.queryByText(Config.formation.fields.withdrawals.reviewStepLabel)).not.toBeInTheDocument();
    });

    it("does not display dissolution on review step", async () => {
      await renderStep({ legalStructureId }, { dissolution: "dissolution stuff" });
      expect(screen.queryByText(Config.formation.fields.dissolution.reviewStepLabel)).not.toBeInTheDocument();
    });

    it("does not display combined-investment on review step", async () => {
      await renderStep({ legalStructureId }, { combinedInvestment: "combinedInvestment stuff" });
      expect(
        screen.queryByText(Config.formation.fields.combinedInvestment.reviewStepLabel)
      ).not.toBeInTheDocument();
    });
  });

  describe("billing step", () => {
    it("displays the billing step when the edit button in the billing contact section is clicked", async () => {
      await renderStep({}, {});
      fireEvent.click(screen.getByTestId("edit-billing-contact-step"));
      expect(screen.getByTestId("billing-step")).toBeInTheDocument();
    });

    it("displays the billing step when the edit button in the billing services section is clicked", async () => {
      await renderStep({}, {});
      fireEvent.click(screen.getByTestId("edit-billing-services-step"));
      expect(screen.getByTestId("billing-step")).toBeInTheDocument();
    });

    it("displays contact information", async () => {
      await renderStep(
        {},
        { contactFirstName: "Namey", contactLastName: "McNameFace", contactPhoneNumber: "123-456-7890" }
      );
      expect(screen.getByText("Namey")).toBeInTheDocument();
      expect(screen.getByText("McNameFace")).toBeInTheDocument();
      expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    });

    it("displays services payment type for CC", async () => {
      await renderStep({}, { paymentType: "CC" });
      expect(screen.getByText(Config.formation.fields.paymentType.creditCardLabel)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.paymentType.achLabel)).not.toBeInTheDocument();
    });

    it("displays services payment type for ACH", async () => {
      await renderStep({}, { paymentType: "ACH" });
      expect(screen.getByText(Config.formation.fields.paymentType.achLabel)).toBeInTheDocument();
      expect(screen.queryByText(Config.formation.fields.paymentType.creditCardLabel)).not.toBeInTheDocument();
    });

    it("displays documents as comma separated list", async () => {
      await renderStep(
        {},
        {
          officialFormationDocument: true,
          certifiedCopyOfFormationDocument: true,
          certificateOfStanding: false,
        }
      );
      const formationDocLabel = Config.formation.fields.officialFormationDocument.reviewStepLabel;
      const certifiedCopyLabel = Config.formation.fields.certifiedCopyOfFormationDocument.reviewStepLabel;
      expect(screen.getByText(`${formationDocLabel}, ${certifiedCopyLabel}`)).toBeInTheDocument();
    });
  });
});
