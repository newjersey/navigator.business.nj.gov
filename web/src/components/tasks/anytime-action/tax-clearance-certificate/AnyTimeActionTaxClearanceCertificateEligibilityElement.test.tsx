import { AnytimeActionTaxClearanceCertificateEligibiityElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateEligibiityElement";
import { getMergedConfig } from "@/contexts/configContext";
import { WithStatefulTaxClearanceCertificateData } from "@/test/mock/withStatefulTaxClearanceCertificateData";
import { TaxClearanceCertificate } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import * as materialUi from "@mui/material";
import { render, screen, within } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

describe("<AnyTimeActionTaxClearanceCertificateEligibilityElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const renderComponent = (taxClearanceCertificateData: TaxClearanceCertificate): void => {
    render(
      <WithStatefulTaxClearanceCertificateData initialData={taxClearanceCertificateData}>
        <AnytimeActionTaxClearanceCertificateEligibiityElement />
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
    addressLine1: "123 Main St",
    addressLine2: "Suite 100",
    addressCity: "Trenton",
    addressState: { shortCode: "NJ", name: "New Jersey" },
    addressZipCode: "08608",
    addressProvince: undefined,
    addressCountry: "US",
  };

  it("render the tax clearance eligibility main reason header", () => {
    renderComponent(taxClearanceCertificateData);
    const mainHeader = screen.getByTestId("eligibilityMainHeader");
    expect(
      within(mainHeader).getByText(Config.taxClearanceCertificateStep2.firstSectionHeader)
    ).toBeInTheDocument();
  });

  it("render the tax clearance eligibility main information header", () => {
    renderComponent(taxClearanceCertificateData);
    const mainHeader = screen.getByTestId("informationMainHeader");
    expect(
      within(mainHeader).getByText(Config.taxClearanceCertificateStep2.secondSectionHeader)
    ).toBeInTheDocument();
  });

  it("render the tax clearance business name", () => {
    renderComponent(taxClearanceCertificateData);
    expect(screen.getByLabelText("Business Name")).toHaveValue("Business Name Data");
  });

  it("render the tax clearance entity id", () => {
    renderComponent(taxClearanceCertificateData);
    expect(screen.getByLabelText("Entity Id")).toHaveValue("1111");
  });
});
