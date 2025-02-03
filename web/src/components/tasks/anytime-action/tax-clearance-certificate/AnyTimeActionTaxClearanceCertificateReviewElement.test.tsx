import * as materialUi from "@mui/material";
import { render, screen, within } from "@testing-library/react";
import {
  AnyTimeActionTaxClearanceCertificateReviewElement
} from "@/components/tasks/anytime-action/tax-clearance-certificate/AnyTimeActionTaxClearanceCertificateReviewElement";
import {getMergedConfig} from "@/contexts/configContext";
import {
  WithStatefulTaxClearanceCertificateData,
} from "@/test/mock/withStatefulTaxClearanceCertificateData";
import {TaxClearanceCertificate} from "@businessnjgovnavigator/shared/taxClearanceCertificate";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

describe("<AnyTimeActionTaxClearanceCertificateReviewElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });


  const renderComponent = (taxClearanceCertificateData : TaxClearanceCertificate): void => {
    render(
      <WithStatefulTaxClearanceCertificateData initialData={taxClearanceCertificateData } >
          <AnyTimeActionTaxClearanceCertificateReviewElement />
      </WithStatefulTaxClearanceCertificateData>
    );
  };

  const taxClearanceCertificateData: TaxClearanceCertificate = {
    businessName: "Business Name Data",
    entityId: "1111",
    issuingAgency: {
      name: "New Jersey Department of Community Affairs",
      displayName: "New Jersey Department of Community Affairs",
    },
    taxId: "123456789",
    encryptedTaxId: "Encrypted Tax Id",
    taxPin: "12345",
    address: {
      addressLine1: "123 Main St",
      addressLine2: "Suite 100",
      addressCity: "Trenton",
      addressMunicipality: undefined,
      addressState: { shortCode: "NJ", name: "New Jersey" },
      addressZipCode: "08608",
      addressProvince: undefined,
      addressCountry: "US",
     businessLocationType: "US"
    }
  };

  it("render tax clearance review main header", () => {
    renderComponent(taxClearanceCertificateData);
    const mainHeader = screen.getByTestId("reviewMainHeader");
    expect(within(mainHeader).getByText(Config.taxClearanceCertificateStep3.mainTitleHeader)).toBeInTheDocument();
  });

  it("render tax clearance review reason section header", () => {
    renderComponent(taxClearanceCertificateData);
    const reasonHeader = screen.getByTestId("certificationReasonHeader");
    expect(within(reasonHeader).getByText(Config.taxClearanceCertificateStep3.firstSectionHeader)).toBeInTheDocument();
  });


  it("render tax clearance review issuing agency label", () => {
    renderComponent(taxClearanceCertificateData);
    const taxIssuingAgencyLabel = screen.getByTestId("taxIssuingAgencyLabel");
    expect(within(taxIssuingAgencyLabel).getByText(Config.taxClearanceCertificateStep3.certificationReasonLabel)).toBeInTheDocument();
  });

  it("render tax clearance review issuing agency data", () => {
    renderComponent(taxClearanceCertificateData);
    const taxIssuingAgencyLabel = screen.getByTestId("taxIssuingAgencyData");
    expect(within(taxIssuingAgencyLabel).getByText("New Jersey Department of Community Affairs")).toBeInTheDocument();
  });

  it("render tax clearance review business section header", () => {
    renderComponent(taxClearanceCertificateData);
    const businessSectionHeader = screen.getByTestId("businessSectionHeader");
    expect(within(businessSectionHeader).getByText(Config.taxClearanceCertificateStep3.secondSectionHeader)).toBeInTheDocument();
  });


  it("render tax clearance review business name label", () => {
    renderComponent(taxClearanceCertificateData);
    const businessNameLabel = screen.getByTestId("businessNameLabel");
    expect(within(businessNameLabel).getByText(Config.taxClearanceCertificateStep3.businessNameLabel)).toBeInTheDocument();
  });

  it("render tax clearance review business name data", () => {
    renderComponent(taxClearanceCertificateData);
    const businessNameData = screen.getByTestId("businessNameData");
    expect(within(businessNameData).getByText("Business Name Data")).toBeInTheDocument();
  });

  it("render tax clearance review entity id label", () => {
    renderComponent(taxClearanceCertificateData);
    const entityIdLabel = screen.getByTestId("entityIdLabel");
    expect(within(entityIdLabel).getByText(Config.taxClearanceCertificateStep3.entityIdLabel)).toBeInTheDocument();
  });

  it("render tax clearance review entity id data", () => {
    renderComponent(taxClearanceCertificateData);
    const entityIdData = screen.getByTestId("entityIdData");
    expect(within(entityIdData).getByText("1111")).toBeInTheDocument();
  });

  it("render tax clearance review business address label", () => {
    renderComponent(taxClearanceCertificateData);
    const addressLabel = screen.getByTestId("addressLabel");
    expect(within(addressLabel).getByText("Address")).toBeInTheDocument();
  });

  it("render tax clearance review full business address data (addressLine1, addressLine2, city, state, and zipcode)", () => {
    const fullAddress = `${taxClearanceCertificateData?.address?.addressLine1}, ${taxClearanceCertificateData?.address?.addressLine2}, ${taxClearanceCertificateData?.address?.addressCity}, ${taxClearanceCertificateData?.address?.addressState?.shortCode} ${taxClearanceCertificateData?.address?.addressZipCode}`;

    renderComponent(taxClearanceCertificateData);
    const addressData = screen.getByTestId("addressData");
    expect(within(addressData).getByText(fullAddress)).toBeInTheDocument();
  });

  it("render tax clearance full business address data without addressLine2 (addressLine1, city, state, and zipcode)", () => {
    const taxClearanceCertificateDataWithoutAddressLine2: TaxClearanceCertificate = {
      businessName: "Business Name Data",
      entityId: "1111",
      issuingAgency: {
        name: "New Jersey Department of Community Affairs",
        displayName: "New Jersey Department of Community Affairs",
      },
      taxId: "123456789",
      encryptedTaxId: "Encrypted Tax Id",
      taxPin: "12345",
      address: {
        addressLine1: "123 Main St",
        addressLine2: "",
        addressCity: "Trenton",
        addressMunicipality: undefined,
        addressState: { shortCode: "NJ", name: "New Jersey" },
        addressZipCode: "08608",
        addressProvince: undefined,
        addressCountry: "US",
        businessLocationType: "US"
      }
    };

    const fullAddress = `${taxClearanceCertificateData?.address?.addressLine1}, ${taxClearanceCertificateData?.address?.addressCity}, ${taxClearanceCertificateData?.address?.addressState?.shortCode} ${taxClearanceCertificateData?.address?.addressZipCode}`;

    renderComponent(taxClearanceCertificateDataWithoutAddressLine2);
    const addressData = screen.getByTestId("addressData");
    expect(within(addressData).getByText(fullAddress)).toBeInTheDocument();
  });


  it("render tax clearance review tax id label", () => {
    renderComponent(taxClearanceCertificateData);
    const taxIdLabel = screen.getByTestId("taxIdLabel");
    expect(within(taxIdLabel).getByText(Config.taxClearanceCertificateStep3.stateTaxIdLabel)).toBeInTheDocument();
  });

  it("render tax clearance review tax id data", () => {
    renderComponent(taxClearanceCertificateData);
    const taxIdData = screen.getByTestId("taxIdData");
    expect(within(taxIdData).getByText("123456789")).toBeInTheDocument();
  });

  it("render tax clearance review tax pin label", () => {
    renderComponent(taxClearanceCertificateData);
    const taxPinLabel = screen.getByTestId("taxPinLabel");
    expect(within(taxPinLabel).getByText(Config.taxClearanceCertificateStep3.taxPinLabel)).toBeInTheDocument();
  });

  it("render tax clearance review tax pin data", () => {
    renderComponent(taxClearanceCertificateData);
    const taxPinData = screen.getByTestId("taxPinData");
    expect(within(taxPinData).getByText("12345")).toBeInTheDocument();
  });
});
