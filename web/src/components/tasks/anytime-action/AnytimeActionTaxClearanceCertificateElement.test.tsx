import * as materialUi from "@mui/material";
import {fireEvent, render, screen, within} from "@testing-library/react";
import {
  AnytimeActionTaxClearanceCertificateElement
} from "@/components/tasks/anytime-action/AnytimeActionTaxClearanceCertificateElement";
import {AnytimeActionLicenseReinstatement, AnytimeActionTask} from "@/lib/types/types";
import {useMockBusiness} from "@/test/mock/mockUseUserData";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}


describe("<AnyTimeActionTaxClearanceCertificateReviewElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderComponent = (anytimeAction:  AnytimeActionLicenseReinstatement | AnytimeActionTask): void => {
    render(
      <AnytimeActionTaxClearanceCertificateElement anytimeAction={anytimeAction}/>
    );
  };

  it("render tax clearance review main header", () => {
    renderComponent({
      callToActionLink: undefined,
      callToActionText: undefined,
      contentMd: "",
      issuingAgency: "",
      summaryDescriptionMd: "",
      urlSlug: "",
      name: "Tax Clearance Certificate",
      industryIds:[], sectorIds: [], applyToAllUsers: false, filename: "filename"});
    const mainHeader = screen.getByText("Tax Clearance Certificate");
    expect(mainHeader).toBeInTheDocument();
  });

  it("renders the requirements tab on load", () => {
    renderComponent({
      callToActionLink: undefined,
      callToActionText: undefined,
      contentMd: "",
      issuingAgency: "",
      summaryDescriptionMd: "",
      urlSlug: "",
      name: "Tax Clearance Certificate",
      industryIds:[], sectorIds: [], applyToAllUsers: false, filename: "filename"});
    expect(screen.getByTestId("requirements-tab")).toBeInTheDocument();
  });

  it("renders the eligibility tab on click", () => {
    renderComponent({
      callToActionLink: undefined,
      callToActionText: undefined,
      contentMd: "",
      issuingAgency: "",
      summaryDescriptionMd: "",
      urlSlug: "",
      name: "Tax Clearance Certificate",
      industryIds:[], sectorIds: [], applyToAllUsers: false, filename: "filename"});
    fireEvent.click(screen.getByTestId("stepper-1"));
    expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
  });

  it("renders the review tab on click", () => {
    renderComponent({
      callToActionLink: undefined,
      callToActionText: undefined,
      contentMd: "",
      issuingAgency: "",
      summaryDescriptionMd: "",
      urlSlug: "",
      name: "Tax Clearance Certificate",
      industryIds:[], sectorIds: [], applyToAllUsers: false, filename: "filename"});
    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(screen.getByTestId("review-tab")).toBeInTheDocument();
  });

});
