import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { getMergedConfig } from "@/contexts/configContext";
import { generateFormationProfileData } from "@/test/helpers/helpers-formation";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import {
  FormationLegalType,
  generateBusiness,
  GetFilingResponse,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { generateFormationData, generateGetFilingResponse } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/data-hooks/useDocuments");
const Config = getMergedConfig();

describe("Formation - <FormationSuccessPage />", () => {
  let getFilingResponse: GetFilingResponse;

  beforeEach(() => {
    vi.resetAllMocks();
    useMockDocuments({});
  });

  const renderSuccessPage = (
    overrides: Partial<GetFilingResponse>,
    profileOverrides: Partial<ProfileData> = {}
  ): void => {
    getFilingResponse = generateGetFilingResponse({ success: true, ...overrides });
    const profileData = generateFormationProfileData(profileOverrides);

    const business = generateBusiness({
      profileData,
      formationData: generateFormationData(
        { getFilingResponse },
        profileData.legalStructureId as FormationLegalType
      ),
    });
    render(<FormationSuccessPage business={business} />);
  };

  it("displays success page, documents, entity id, confirmation id", () => {
    setMockDocumentsResponse({
      formationDoc: "testForm.pdf",
      certifiedDoc: "testCert.pdf",
      standingDoc: "testStand.pdf",
    });
    renderSuccessPage({});
    expect(screen.getByText(Config.formation.successPage.header)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.successPage.subheader)).toBeInTheDocument();
    expect(screen.getByText(getFilingResponse.entityId)).toBeInTheDocument();
    expect(screen.getByText(getFilingResponse.confirmationNumber)).toBeInTheDocument();
    expect(screen.getByTestId(Config.formation.successPage.formationDocLabel)).toHaveAttribute(
      "href",
      "testForm.pdf"
    );
    expect(screen.getByTestId(Config.formation.successPage.standingDocLabel)).toHaveAttribute(
      "href",
      "testStand.pdf"
    );
    expect(screen.getByTestId(Config.formation.successPage.certifiedDocLabel)).toHaveAttribute(
      "href",
      "testCert.pdf"
    );
  });

  it("does not display documents when they are not present", () => {
    renderSuccessPage(
      { certifiedDoc: "" },
      { documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" } }
    );
    expect(screen.queryByTestId(Config.formation.successPage.certifiedDocLabel)).not.toBeInTheDocument();
  });
});
