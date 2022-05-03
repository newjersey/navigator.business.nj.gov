import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { generateFormationData, generateGetFilingResponse, generateUserData } from "@/test/factories";
import { generateLLCProfileData } from "@/test/helpers-formation";
import { setMockDocumentsResponse, useMockDocuments } from "@/test/mock/mockUseDocuments";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetFilingResponse, ProfileData } from "@businessnjgovnavigator/shared";
import { render, RenderResult } from "@testing-library/react";
import React from "react";

jest.mock("@/lib/data-hooks/useDocuments");

describe("Formation - <FormationSuccessPage />", () => {
  let getFilingResponse: GetFilingResponse;
  let subject: RenderResult;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockDocuments({});
  });

  const renderSuccessPage = (
    overrides: Partial<GetFilingResponse>,
    profileOverrides: Partial<ProfileData> = {}
  ) => {
    getFilingResponse = generateGetFilingResponse({ success: true, ...overrides });
    const userData = generateUserData({
      profileData: generateLLCProfileData(profileOverrides),
      formationData: generateFormationData({ getFilingResponse }),
    });
    subject = render(<FormationSuccessPage userData={userData} />);
  };

  it("displays success page, documents, entity id, confirmation id", async () => {
    setMockDocumentsResponse({
      formationDoc: "testForm.pdf",
      certifiedDoc: "testCert.pdf",
      standingDoc: "testStand.pdf",
    });
    renderSuccessPage({});
    expect(subject.getByText(Config.businessFormationDefaults.successPageHeader)).toBeInTheDocument();
    expect(subject.getByText(Config.businessFormationDefaults.successPageSubheader)).toBeInTheDocument();
    expect(subject.getByText(getFilingResponse.entityId)).toBeInTheDocument();
    expect(subject.getByText(getFilingResponse.confirmationNumber)).toBeInTheDocument();
    expect(
      subject.getByTestId(Config.businessFormationDefaults.formationDocLabel).getAttribute("href")
    ).toEqual("testForm.pdf");
    expect(
      subject.getByTestId(Config.businessFormationDefaults.standingDocLabel).getAttribute("href")
    ).toEqual("testStand.pdf");
    expect(
      subject.getByTestId(Config.businessFormationDefaults.certifiedDocLabel).getAttribute("href")
    ).toEqual("testCert.pdf");
  });

  it("does not display documents when they are not present", () => {
    renderSuccessPage(
      { certifiedDoc: "" },
      { documents: { certifiedDoc: "", formationDoc: "", standingDoc: "" } }
    );
    expect(subject.queryByTestId(Config.businessFormationDefaults.certifiedDocLabel)).not.toBeInTheDocument();
  });
});
