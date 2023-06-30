import { displayContent } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateFormationFormData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { screen } from "@testing-library/react";

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

describe("<NonprofitProvisions />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    municipalities?: Municipality[]
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: "nonprofit",
      }),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    const page = preparePage({
      business: generateBusiness({ profileData, formationData }),
      displayContent,
      municipalities,
    });
    await page.stepperClickToBusinessStep();
    return page;
  };

  describe("has board members", () => {
    describe("nonprofitBoardMemberQualificationsSpecified", () => {
      it("shows text field when IN_FORM is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitBoardMemberQualificationsSpecified: undefined }
        );
        expect(
          screen.queryByLabelText("Nonprofit board member qualifications terms")
        ).not.toBeInTheDocument();
        page.chooseRadio("nonprofitBoardMemberQualificationsSpecified-IN_FORM");
        expect(screen.getByLabelText("Nonprofit board member qualifications terms")).toBeInTheDocument();
      });

      it("does not show text field when IN_BYLAWS is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitBoardMemberQualificationsSpecified: undefined }
        );
        expect(
          screen.queryByLabelText("Nonprofit board member qualifications terms")
        ).not.toBeInTheDocument();
        page.chooseRadio("nonprofitBoardMemberQualificationsSpecified-IN_BYLAWS");
        expect(
          screen.queryByLabelText("Nonprofit board member qualifications terms")
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitBoardMemberRightsSpecified", () => {
      it("shows text field when IN_FORM is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitBoardMemberRightsSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit board member rights terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitBoardMemberRightsSpecified-IN_FORM");
        expect(screen.getByLabelText("Nonprofit board member rights terms")).toBeInTheDocument();
      });

      it("does not show text field when IN_BYLAWS is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitBoardMemberRightsSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit board member rights terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitBoardMemberRightsSpecified-IN_BYLAWS");
        expect(screen.queryByLabelText("Nonprofit board member rights terms")).not.toBeInTheDocument();
      });
    });

    describe("nonprofitTrusteesMethodSpecified", () => {
      it("shows text field when IN_FORM is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitTrusteesMethodSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit trustees method terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitTrusteesMethodSpecified-IN_FORM");
        expect(screen.getByLabelText("Nonprofit trustees method terms")).toBeInTheDocument();
      });

      it("does not show text field when IN_BYLAWS is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitTrusteesMethodSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit trustees method terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitTrusteesMethodSpecified-IN_BYLAWS");
        expect(screen.queryByLabelText("Nonprofit trustees method terms")).not.toBeInTheDocument();
      });
    });

    describe("nonprofitAssetDistributionSpecified", () => {
      it("shows text field when IN_FORM is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitAssetDistributionSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit asset distribution terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitAssetDistributionSpecified-IN_FORM");
        expect(screen.getByLabelText("Nonprofit asset distribution terms")).toBeInTheDocument();
      });

      it("does not show text field when IN_BYLAWS is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, nonprofitAssetDistributionSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit asset distribution terms")).not.toBeInTheDocument();
        page.chooseRadio("nonprofitAssetDistributionSpecified-IN_BYLAWS");
        expect(screen.queryByLabelText("Nonprofit asset distribution terms")).not.toBeInTheDocument();
      });
    });
  });

  describe("does not have board members", () => {
    describe("nonprofitBoardMemberQualificationsSpecified", () => {
      it("does not show nonprofitBoardMemberQualificationsSpecified when board members is undefined", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: false, nonprofitBoardMemberQualificationsSpecified: undefined }
        );
        expect(
          screen.queryByLabelText("Nonprofit board member qualifications terms")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitBoardMemberQualificationsSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitBoardMemberRightsSpecified", () => {
      it("does not show nonprofitBoardMemberRightsSpecified when there are no board members", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: false, nonprofitBoardMemberRightsSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit board member rights specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitBoardMemberRightsSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitTrusteesMethodSpecified", () => {
      it("does not show nonprofitTrusteesMethodSpecified when there are no board members", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: false, nonprofitTrusteesMethodSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit trustees methods specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitTrusteesMethodSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitAssetDistributionSpecified", () => {
      it("does not show nonprofitAssetDistributionSpecified when there are no board members", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: false, nonprofitAssetDistributionSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit asset distribution specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitAssetDistributionSpecified.body)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("when board members is undefined", () => {
    describe("nonprofitBoardMemberQualificationsSpecified", () => {
      it("does not show nonprofitBoardMemberQualificationsSpecified when board members is undefined", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: undefined, nonprofitBoardMemberQualificationsSpecified: undefined }
        );
        expect(
          screen.queryByLabelText("Nonprofit board member qualifications terms")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitBoardMemberQualificationsSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitBoardMemberRightsSpecified", () => {
      it("does not show nonprofitBoardMemberRightsSpecified when board members is undefined", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: undefined, nonprofitBoardMemberRightsSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit board member rights specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitBoardMemberRightsSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitTrusteesMethodSpecified", () => {
      it("does not show nonprofitTrusteesMethodSpecified when board members is undefined", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: undefined, nonprofitTrusteesMethodSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit trustees methods specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitTrusteesMethodSpecified.body)
        ).not.toBeInTheDocument();
      });
    });

    describe("nonprofitAssetDistributionSpecified", () => {
      it("does not show nonprofitAssetDistributionSpecified when board members is undefined", async () => {
        await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: undefined, nonprofitAssetDistributionSpecified: undefined }
        );
        expect(screen.queryByLabelText("Nonprofit asset distribution specified")).not.toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.nonprofitAssetDistributionSpecified.body)
        ).not.toBeInTheDocument();
      });
    });
  });
});
