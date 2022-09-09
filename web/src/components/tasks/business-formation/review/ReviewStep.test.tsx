import {
  generateFormationDisplayContent,
  generateFormationFormData,
  generateUserData,
} from "@/test/factories";
import { markdownToText, withMarkup } from "@/test/helpers";
import { generateFormationProfileData, preparePage, useSetupInitialMocks } from "@/test/helpers-formation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationFormData, FormationLegalType, ProfileData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";

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
jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
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
    const formationData = {
      formationFormData: generateFormationFormData(
        formationFormData,
        profileData.legalStructureId as FormationLegalType
      ),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    const page = preparePage(
      generateUserData({
        profileData,
        formationData,
      }),
      generateFormationDisplayContent({})
    );

    await page.stepperClickToReviewStep();
  };

  it("displays the business step when the edit button in the main business section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name-section"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the location section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-location-section"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the contacts step when the edit button in the registered agent section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-registered-agent-section"));
    expect(screen.getByTestId("contacts-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the business purpose section is clicked", async () => {
    await renderStep({}, { businessPurpose: "some purpose" });
    fireEvent.click(screen.getByTestId("edit-business-purpose"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the business step when the edit button in the provisions section is clicked", async () => {
    await renderStep({}, { provisions: ["some provision"] });
    fireEvent.click(screen.getByTestId("edit-provisions"));
    expect(screen.getByTestId("business-step")).toBeInTheDocument();
  });

  it("displays the contacts step when the edit button in the signatures section is clicked", async () => {
    await renderStep({}, {});
    fireEvent.click(screen.getByTestId("edit-signature-section"));
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
    expect(screen.queryByTestId("edit-members-section")).not.toBeInTheDocument();
  });

  it("displays business purpose on review step", async () => {
    await renderStep({}, { businessPurpose: "some cool purpose" });
    expect(screen.getByTestId("business-purpose")).toBeInTheDocument();
    expect(screen.getByText("some cool purpose")).toBeInTheDocument();
  });

  it("does not display business purpose within review step when purpose does not exist", async () => {
    await renderStep({}, { businessPurpose: "" });
    expect(screen.queryByTestId("business-purpose")).not.toBeInTheDocument();
  });

  it("displays provisions on review step", async () => {
    await renderStep({}, { provisions: ["provision1", "provision2"] });
    expect(screen.getByTestId("provisions")).toBeInTheDocument();
    expect(screen.getByText("provision1")).toBeInTheDocument();
    expect(screen.getByText("provision2")).toBeInTheDocument();
    expect(
      screen.getAllByText(Config.businessFormationDefaults.reviewStepProvisionsSubheader, { exact: false })
    ).toHaveLength(2);
  });

  it("does not display provisions within review step when they are empty", async () => {
    await renderStep({}, { provisions: [] });
    expect(screen.queryByTestId("provisions")).not.toBeInTheDocument();
  });

  it("displays different titles when legalStructure is a ForProfit Corporation", async () => {
    await renderStep({ legalStructureId: "c-corporation" }, {});
    expect(
      screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepDirectorsHeader))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepIncorporatorsHeader))
    ).toBeInTheDocument();
  });

  it("displays different titles when legalStructure is an llc", async () => {
    await renderStep({ legalStructureId: "limited-liability-company" }, {});
    expect(
      screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepMembersHeader))
    ).toBeInTheDocument();
    expect(
      screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepSignaturesHeader))
    ).toBeInTheDocument();
  });

  describe("when lp", () => {
    const legalStructureId = "limited-partnership";

    it("does not display the members section", async () => {
      await renderStep({ legalStructureId }, {});
      expect(screen.queryByTestId("edit-members-section")).not.toBeInTheDocument();
    });

    it("displays withdrawals on review step", async () => {
      await renderStep({ legalStructureId }, { withdrawals: "withdrawl stuff" });
      expect(
        screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepWithdrawalsHeader))
      ).toBeInTheDocument();
      expect(screen.getByText("withdrawl stuff")).toBeInTheDocument();
    });

    it("displays dissolution on review step", async () => {
      await renderStep({ legalStructureId }, { dissolution: "dissolution stuff" });
      expect(
        screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepDissolutionHeader))
      ).toBeInTheDocument();
      expect(screen.getByText("dissolution stuff")).toBeInTheDocument();
    });

    it("displays combined-investment on review step", async () => {
      await renderStep({ legalStructureId }, { combinedInvestment: "combinedInvestment stuff" });
      expect(
        screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepCombinedInvestmentHeader))
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
      expect(
        screen.getByText(markdownToText(Config.businessFormationDefaults.reviewStepPartnershipHeader))
      ).toBeInTheDocument();
      expect(
        getByMarkup(
          markdownToText(Config.businessFormationDefaults.reviewStepPartnershipYesLimitedPartnerBody)
        )
      ).toBeInTheDocument();
      expect(screen.getByText("partnerTerms whatever")).toBeInTheDocument();
      expect(
        getByMarkup(
          markdownToText(Config.businessFormationDefaults.reviewStepPartnershipNoCanReceiveDistributions)
        )
      ).toBeInTheDocument();
      expect(screen.queryByText("get distro terms")).not.toBeInTheDocument();
      expect(
        getByMarkup(
          markdownToText(Config.businessFormationDefaults.reviewStepPartnershipYesCanMakeDistributions)
        )
      ).toBeInTheDocument();
      expect(screen.getByText("make distro terms")).toBeInTheDocument();
    });
  });

  describe("when llc", () => {
    const legalStructureId = "limited-liability-company";

    it("displays the contacts step when the edit button in the members section is clicked", async () => {
      await renderStep({ legalStructureId }, {});
      fireEvent.click(screen.getByTestId("edit-members-section"));
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
      expect(
        screen.queryByText(markdownToText(Config.businessFormationDefaults.reviewStepPartnershipHeader))
      ).not.toBeInTheDocument();
    });

    it("does not display withdrawals on review step", async () => {
      await renderStep({ legalStructureId }, { withdrawals: "withdrawl stuff" });
      expect(
        screen.queryByText(markdownToText(Config.businessFormationDefaults.reviewStepWithdrawalsHeader))
      ).not.toBeInTheDocument();
    });

    it("does not display dissolution on review step", async () => {
      await renderStep({ legalStructureId }, { dissolution: "dissolution stuff" });
      expect(
        screen.queryByText(markdownToText(Config.businessFormationDefaults.reviewStepDissolutionHeader))
      ).not.toBeInTheDocument();
    });

    it("does not display combined-investment on review step", async () => {
      await renderStep({ legalStructureId }, { combinedInvestment: "combinedInvestment stuff" });
      expect(
        screen.queryByText(
          markdownToText(Config.businessFormationDefaults.reviewStepCombinedInvestmentHeader)
        )
      ).not.toBeInTheDocument();
    });
  });
});
