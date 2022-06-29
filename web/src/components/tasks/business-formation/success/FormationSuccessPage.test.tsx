import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { generateFormationData, generateGetFilingResponse, generateUserData } from "@/test/factories";
import { generateFormationProfileData } from "@/test/helpers-formation";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationLegalType, GetFilingResponse, ProfileData } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useDocuments");

describe("Formation - <FormationSuccessPage />", () => {
  let getFilingResponse: GetFilingResponse;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockDocuments({});
  });

  const renderSuccessPage = (
    overrides: Partial<GetFilingResponse>,
    profileOverrides: Partial<ProfileData> = {}
  ) => {
    getFilingResponse = generateGetFilingResponse({ success: true, ...overrides });
    const profileData = generateFormationProfileData(profileOverrides);

    const userData = generateUserData({
      profileData,
      formationData: generateFormationData(
        { getFilingResponse },
        profileData.legalStructureId as FormationLegalType
      ),
    });
    render(<FormationSuccessPage userData={userData} />);
  };

  it("displays success page, documents, entity id, confirmation id", () => {
    setMockDocumentsResponse({
      formationDoc: "testForm.pdf",
      certifiedDoc: "testCert.pdf",
      standingDoc: "testStand.pdf",
    });
    renderSuccessPage({});
    expect(screen.getByText(Config.businessFormationDefaults.successPageHeader)).toBeInTheDocument();
    expect(screen.getByText(Config.businessFormationDefaults.successPageSubheader)).toBeInTheDocument();
    expect(screen.getByText(getFilingResponse.entityId)).toBeInTheDocument();
    expect(screen.getByText(getFilingResponse.confirmationNumber)).toBeInTheDocument();
    expect(screen.getByTestId(Config.businessFormationDefaults.formationDocLabel)).toHaveAttribute(
      "href",
      "testForm.pdf"
    );
    expect(screen.getByTestId(Config.businessFormationDefaults.standingDocLabel)).toHaveAttribute(
      "href",
      "testStand.pdf"
    );
    expect(screen.getByTestId(Config.businessFormationDefaults.certifiedDocLabel)).toHaveAttribute(
      "href",
      "testCert.pdf"
    );
  });

  it("does not display documents when they are not present", () => {
    renderSuccessPage(
      { certifiedDoc: "" },
      { documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" } }
    );
    expect(screen.queryByTestId(Config.businessFormationDefaults.certifiedDocLabel)).not.toBeInTheDocument();
  });
});
