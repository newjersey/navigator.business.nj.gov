/* eslint-disable @typescript-eslint/no-explicit-any */

import { displayContent } from "@/components/tasks/business-formation/contacts/testHelpers";
import { getMergedConfig } from "@/contexts/configContext";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
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

  const provisions = [
    {
      radio: "nonprofitBoardMemberQualificationsSpecified",
      terms: "nonprofitBoardMemberQualificationsTerms",
    },
    { radio: "nonprofitBoardMemberRightsSpecified", terms: "nonprofitBoardMemberRightsTerms" },
    { radio: "nonprofitTrusteesMethodSpecified", terms: "nonprofitTrusteesMethodTerms" },
    { radio: "nonprofitAssetDistributionSpecified", terms: "nonprofitAssetDistributionTerms" },
  ];

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
