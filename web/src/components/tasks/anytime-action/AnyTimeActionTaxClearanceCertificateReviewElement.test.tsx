import * as materialUi from "@mui/material";
import { render, screen, within } from "@testing-library/react";
import {
  AnyTimeActionTaxClearanceCertificateReviewElement
} from "@/components/tasks/anytime-action/AnyTimeActionTaxClearanceCertificateReviewElement";

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
  });

  const renderComponent = (): void => {
    render(
          <AnyTimeActionTaxClearanceCertificateReviewElement />
    );
  };

  it("render tax clearance review main header", () => {
    renderComponent();
    const mainHeader = screen.getByTestId("reviewMainHeader");
    expect(within(mainHeader).getByText("Check Eligibility")).toBeInTheDocument();
  });

  it("render tax clearance review reason section header", () => {
    renderComponent();
    const reasonHeader = screen.getByTestId("certificationReasonHeader");
    expect(within(reasonHeader).getByText("Reason for Certification")).toBeInTheDocument();
  });


  it("render tax clearance review issuing agency label", () => {
    renderComponent();
    const taxIssuingAgencyLabel = screen.getByTestId("taxIssuingAgencyLabel");
    expect(within(taxIssuingAgencyLabel).getByText("What agency is requesting the Tax Clearance Certificate?")).toBeInTheDocument();
  });

  it("render tax clearance review issuing agency data", () => {
    renderComponent();
    const taxIssuingAgencyLabel = screen.getByTestId("taxIssuingAgencyData");
    expect(within(taxIssuingAgencyLabel).getByText("Agency of Choice")).toBeInTheDocument();
  });

  it("render tax clearance review business section header", () => {
    renderComponent();
    const businessSectionHeader = screen.getByTestId("businessSectionHeader");
    expect(within(businessSectionHeader).getByText("Business Information")).toBeInTheDocument();
  });


  it("render tax clearance review business name label", () => {
    renderComponent();
    const businessNameLabel = screen.getByTestId("businessNameLabel");
    expect(within(businessNameLabel).getByText("Business Name")).toBeInTheDocument();
  });

  it("render tax clearance review business name data", () => {
    renderComponent();
    const businessNameData = screen.getByTestId("businessNameData");
    expect(within(businessNameData).getByText("Business Name Data")).toBeInTheDocument();
  });

  it("render tax clearance review entity id label", () => {
    renderComponent();
    const entityIdLabel = screen.getByTestId("entityIdLabel");
    expect(within(entityIdLabel).getByText("Entity ID (Corporate Number)")).toBeInTheDocument();
  });

  it("render tax clearance review entity id data", () => {
    renderComponent();
    const entityIdData = screen.getByTestId("entityIdData");
    expect(within(entityIdData).getByText("1111")).toBeInTheDocument();
  });

  it("render tax clearance review business address label", () => {
    renderComponent();
    const addressLabel = screen.getByTestId("addressLabel");
    expect(within(addressLabel).getByText("Address")).toBeInTheDocument();
  });

  it("render tax clearance review full business address data (addressLine1, addressLine2, city, state, and zipcode)", () => {
    const addressLine1 = "123 Main St";
    const addressLine2 = "Suite 100";
    const city = "Trenton";
    const state = "NJ";
    const zip = "08608";

    const fullAddress = `${addressLine1}, ${addressLine2}, ${city}, ${state} ${zip}`;

    renderComponent();
    const addressData = screen.getByTestId("addressData");
    expect(within(addressData).getByText(fullAddress)).toBeInTheDocument();
  });


  it("render tax clearance review tax id label", () => {
    renderComponent();
    const taxIdLabel = screen.getByTestId("taxIdLabel");
    expect(within(taxIdLabel).getByText("NJ State Tax ID")).toBeInTheDocument();
  });

  it("render tax clearance review tax id data", () => {
    renderComponent();
    const taxIdData = screen.getByTestId("taxIdData");
    expect(within(taxIdData).getByText("Tax Id")).toBeInTheDocument();
  });

  it("render tax clearance review tax pin label", () => {
    renderComponent();
    const taxPinLabel = screen.getByTestId("taxPinLabel");
    expect(within(taxPinLabel).getByText("Tax Pin")).toBeInTheDocument();
  });

  it("render tax clearance review tax pin data", () => {
    renderComponent();
    const taxPinData = screen.getByTestId("taxPinData");
    expect(within(taxPinData).getByText("Tax Pin Data")).toBeInTheDocument();
  });
});
