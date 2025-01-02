/* eslint-disable @typescript-eslint/no-explicit-any */

import { displayContent } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks
} from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import { FormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateFormationFormData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { screen } from "@testing-library/react";

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

describe("<NonprofitProvisions />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  const provisions = [
    {
      radio: "nonprofitBoardMemberQualificationsSpecified",
      terms: "nonprofitBoardMemberQualificationsTerms",
    },
    { radio: "nonprofitBoardMemberRightsSpecified", terms: "nonprofitBoardMemberRightsTerms" },
    { radio: "nonprofitTrusteesMethodSpecified", terms: "nonprofitTrusteesMethodTerms" },
    { radio: "nonprofitAssetDistributionSpecified", terms: "nonprofitAssetDistributionTerms" },
  ];

  describe("hasNonprofitBoardMembers", () => {
    it("resets all other provisions questions and terms when No is selected", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberQualificationsSpecified: "IN_FORM",
          nonprofitBoardMemberQualificationsTerms: "some terms here",
          nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
        }
      );
      page.chooseRadio(`hasNonprofitBoardMembers-false`);
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.hasNonprofitBoardMembers).toEqual(false);
      expect(
        currentBusiness().formationData.formationFormData.nonprofitBoardMemberQualificationsSpecified
      ).toBeUndefined();
      expect(
        currentBusiness().formationData.formationFormData.nonprofitBoardMemberRightsSpecified
      ).toBeUndefined();
      expect(
        currentBusiness().formationData.formationFormData.nonprofitTrusteesMethodSpecified
      ).toBeUndefined();
      expect(
        currentBusiness().formationData.formationFormData.nonprofitAssetDistributionSpecified
      ).toBeUndefined();
      expect(
        currentBusiness().formationData.formationFormData.nonprofitBoardMemberQualificationsTerms
      ).toEqual("");
      expect(currentBusiness().formationData.formationFormData.nonprofitBoardMemberRightsTerms).toEqual("");
      expect(currentBusiness().formationData.formationFormData.nonprofitTrusteesMethodTerms).toEqual("");
      expect(currentBusiness().formationData.formationFormData.nonprofitAssetDistributionTerms).toEqual("");
    });

    it("removes field interaction and error text when resetting fields", async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        {
          hasNonprofitBoardMembers: true,
          nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
        }
      );
      page.chooseRadio("nonprofitBoardMemberRightsSpecified-IN_FORM");
      expect(screen.queryByText(Config.formation.general.genericErrorText)).not.toBeInTheDocument();
      page.fillText("Nonprofit board member rights terms", "");
      expect(screen.getByText(Config.formation.general.genericErrorText)).toBeInTheDocument();

      page.chooseRadio("hasNonprofitBoardMembers-false");
      page.chooseRadio("hasNonprofitBoardMembers-true");
      expect(screen.queryByText(Config.formation.general.genericErrorText)).not.toBeInTheDocument();
    });
  });

  describe.each(provisions)("when has board members is true", (args) => {
    describe(`${args.radio}`, () => {
      it("shows text field when IN_FORM is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, [args.radio]: undefined }
        );
        const termsLabel = camelCaseToSentence(args.terms);
        expect(screen.queryByLabelText(termsLabel)).not.toBeInTheDocument();
        page.chooseRadio(`${args.radio}-IN_FORM`);
        expect(screen.getByLabelText(termsLabel)).toBeInTheDocument();
      });

      it("does not show text field when IN_BYLAWS is selected", async () => {
        const page = await getPageHelper(
          { legalStructureId: "nonprofit" },
          { hasNonprofitBoardMembers: true, [args.radio]: undefined }
        );
        const termsLabel = camelCaseToSentence(args.terms);
        expect(screen.queryByLabelText(termsLabel)).not.toBeInTheDocument();
        page.chooseRadio(`${args.radio}-IN_BYLAWS`);
        expect(screen.queryByLabelText(termsLabel)).not.toBeInTheDocument();
      });
    });
  });

  describe.each(provisions)("when has no board members", (args) => {
    it(`does not show ${args.radio} when board members is false`, async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        { hasNonprofitBoardMembers: false }
      );
      const termsLabel = camelCaseToSentence(args.terms);
      expect(screen.queryByLabelText(termsLabel)).not.toBeInTheDocument();
      expect(screen.queryByText((Config.formation.fields as any)[args.radio].body)).not.toBeInTheDocument();

      page.chooseRadio(`hasNonprofitBoardMembers-true`);
      expect(screen.getByText((Config.formation.fields as any)[args.radio].body)).toBeInTheDocument();
    });

    it(`does not show ${args.radio} when board members is undefined`, async () => {
      const page = await getPageHelper(
        { legalStructureId: "nonprofit" },
        { hasNonprofitBoardMembers: undefined }
      );
      const termsLabel = camelCaseToSentence(args.terms);
      expect(screen.queryByLabelText(termsLabel)).not.toBeInTheDocument();
      expect(screen.queryByText((Config.formation.fields as any)[args.radio].body)).not.toBeInTheDocument();

      page.chooseRadio(`hasNonprofitBoardMembers-true`);
      expect(screen.getByText((Config.formation.fields as any)[args.radio].body)).toBeInTheDocument();
    });
  });
});
