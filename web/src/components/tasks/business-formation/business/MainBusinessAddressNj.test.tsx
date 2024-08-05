import { getMergedConfig } from "@/contexts/configContext";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { currentBusiness } from "@/test/mock/withStatefulUserData";
import {
  FormationFormData,
  PublicFilingLegalType,
  castPublicFilingLegalTypeToFormationType,
} from "@businessnjgovnavigator/shared/formationData";
import { generateBusiness, generateFormationFormData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { fireEvent, screen } from "@testing-library/react";
import { displayContent } from "../contacts/testHelpers";

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
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

const getPageHelper = async (
  formationFormData: Partial<FormationFormData>
): Promise<FormationPageHelpers> => {
  const profileData = generateFormationProfileData({ businessPersona: "STARTING" });
  const formationData = {
    formationFormData: generateFormationFormData(formationFormData, {
      legalStructureId: castPublicFilingLegalTypeToFormationType(
        profileData.legalStructureId as PublicFilingLegalType,
        "STARTING"
      ),
    }),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameSearch: undefined,
    businessNameAvailability: undefined,
    dbaBusinessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
  };

  const business = generateBusiness({ profileData, formationData });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (business.profileData as any).municipality = formationData.formationFormData.addressMunicipality;
  const page = preparePage({ business, displayContent });
  await page.stepperClickToBusinessStep();
  return page;
};

describe("<MainBusinessAddressNj />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const Config = getMergedConfig();
  const emptyAddress: Partial<FormationFormData> = {
    addressLine1: "",
    addressLine2: "",
    addressMunicipality: undefined,
    addressZipCode: "",
  };

  it("shows option header and expand button", () => {
    getPageHelper(emptyAddress);
    expect(screen.queryByLabelText("Address line1")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Address line2")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Address municipality")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Address zip code")).not.toBeInTheDocument();

    expect(screen.getByTestId("main-business-address-container-header")).toBeInTheDocument();

    expect(screen.getByText(Config.formation.sections.addressAddButtonText)).toBeInTheDocument();
  });

  it("expands to show new content when optional", () => {
    getPageHelper(emptyAddress);

    const expandButton = screen.getByText(Config.formation.sections.addressAddButtonText);
    fireEvent.click(expandButton);

    expect(screen.getByLabelText("Address line1")).toBeInTheDocument();
    expect(screen.getByLabelText("Address line2")).toBeInTheDocument();
    expect(screen.getByLabelText("Address municipality")).toBeInTheDocument();
    expect(screen.getByLabelText("Address zip code")).toBeInTheDocument();
  });

  it("shows inline errors when missing address1 as NJ", async () => {
    await getPageHelper({ addressLine1: "" });
    fireEvent.blur(screen.getByLabelText("Address line1"));
    expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
  });

  it("does show inline errors when missing city as NJ", async () => {
    await getPageHelper({ addressMunicipality: undefined });
    fireEvent.blur(screen.getByTestId("addressMunicipality"));
    expect(screen.getByText(Config.formation.fields.addressMunicipality.error)).toBeInTheDocument();
  });

  it("does show inline errors when missing zipcode as NJ", async () => {
    await getPageHelper({ addressZipCode: "" });
    fireEvent.blur(screen.getByLabelText("Address zip code"));
    expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
  });

  it("should NOT require Address fields for state business for API submission", async () => {
    const page = await getPageHelper(emptyAddress);
    await attemptApiSubmission(page);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  describe("requires complete address", () => {
    it.each([
      ["addressLine1", ""],
      ["addressMunicipality", undefined],
      ["addressZipCode", ""],
    ])("shows an error on submission when missing address field", async (field, initialValue) => {
      const page = await getPageHelper({
        [field]: initialValue,
        legalType: "limited-liability-company",
      });
      await attemptApiSubmission(page);

      expect(screen.getByRole("alert")).toHaveTextContent(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (Config.formation.fields as any)[field].label
      );
    });
  });

  describe("NJ zipCode validation", () => {
    it("displays error message when non-NJ zipCode is entered in main Address", async () => {
      const page = await getPageHelper({ addressZipCode: "" });
      page.fillText("Address zip code", "22222");
      expect(screen.getByText(Config.formation.fields.addressZipCode.error)).toBeInTheDocument();
    });

    it("doesn't allow non-numeric zipCode is entered in main Address", async () => {
      const page = await getPageHelper({ addressZipCode: "" });
      page.fillText("Address zip code", "AAAAA");
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("");
    });

    it("passes zipCode validation in main Address", async () => {
      const page = await getPageHelper({ addressZipCode: "" });
      page.fillText("Address zip code", "07001");
      await page.submitBusinessStep();
      expect(currentBusiness().formationData.formationFormData.addressZipCode).toEqual("07001");
    });
  });
});

const attemptApiSubmission = async (page: FormationPageHelpers): Promise<void> => {
  await page.stepperClickToReviewStep();
  await page.clickSubmit();
  await page.stepperClickToBusinessStep();
};
