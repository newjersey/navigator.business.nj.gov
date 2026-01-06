import { displayContent } from "@/components/tasks/business-formation/contacts/testHelpers";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  FormationFormData,
  FormationLegalType,
} from "@businessnjgovnavigator/shared/formationData";
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
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("<SuffixDropdown />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    legalType: FormationLegalType,
    formationFormData?: Partial<FormationFormData>,
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData({ legalStructureId: legalType });
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData || {}, {
        legalStructureId: legalType,
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
    });
    await page.stepperClickToBusinessStep();
    return page;
  };

  describe("accessibility", () => {
    it("displays the label text", async () => {
      await getPageHelper("limited-liability-company");

      expect(screen.getByText(Config.formation.fields.businessSuffix.label)).toBeInTheDocument();
    });

    it("can be accessed by its label using getByLabelText", async () => {
      await getPageHelper("limited-liability-company");

      const select = screen.getByLabelText(Config.formation.fields.businessSuffix.label);
      expect(select).toBeInTheDocument();
    });
  });

  describe("display of selected value", () => {
    it("displays the selected suffix value", async () => {
      await getPageHelper("limited-liability-company", { businessSuffix: "L.L.C." });

      const select = screen.getByTestId("business-suffix-main");
      expect(select).toHaveTextContent("L.L.C.");
    });

    it("displays empty when no suffix is selected", async () => {
      await getPageHelper("limited-liability-company", { businessSuffix: undefined });

      const select = screen.getByTestId("business-suffix-main");
      expect(select).toHaveTextContent("");
    });
  });
});
