import {fireEvent, render, screen} from "@testing-library/react";
import {
  TaxClearanceCertificateIssuingAgencies, TaxClearanceCertificateIssuingAgency
} from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import {
  TaxClearanceCertificateIssuingAgencyDropdown
} from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceCertificateIssuingAgencyDropdown";
import {randomInt} from "@businessnjgovnavigator/shared/intHelpers";

describe("TaxClearanceCertificateIssuingAgencyDropdown", () => {
  const renderComponent = (taxClearanceCertificateIssuingAgency : TaxClearanceCertificateIssuingAgency | undefined): void => {
    render(
     <TaxClearanceCertificateIssuingAgencyDropdown onValidation={undefined}
                                                   taxClearances={TaxClearanceCertificateIssuingAgencies}
                                                   fieldName={"taxClearanceCertificateIssuingAgencies"}
                                                   error={false}
                                                   value={taxClearanceCertificateIssuingAgency }
                                                   onSelect={()=>{}}
                                                   helperText={"Tax Certificate Issuing Agencies"} />
    );
  };

  it("displays the No options in Tax Clearance Certificate Issuing Agency Dropdown when can't find issuing agency", () => {
    const taxClearanceCertificateIssuingAgency = undefined;
    renderComponent(taxClearanceCertificateIssuingAgency)

    const searchTerm = `some-industry-${randomInt()}`;

    fireEvent.mouseDown(screen.getByTestId("taxClearanceCertificateIssuingAgencies"));
    fireEvent.click(screen.getByTestId("taxClearanceCertificateIssuingAgencies"));
    fireEvent.change(screen.getByTestId("taxClearanceCertificateIssuingAgencies"), {
      target: { value: searchTerm },
    });
    expect(screen.getAllByText("No options").length).toEqual(1);

  });

  it("displays the correct issuing agency in Tax Clearance Certificate Issuing Agency Dropdown when it can find the issuing agency", () => {
    const taxClearanceCertificateIssuingAgency = undefined;
    renderComponent(taxClearanceCertificateIssuingAgency)

    const searchTerm = `New Jersey Department of Community Affairs`;

    fireEvent.mouseDown(screen.getByTestId("taxClearanceCertificateIssuingAgencies"));
    fireEvent.click(screen.getByTestId("taxClearanceCertificateIssuingAgencies"));
    fireEvent.change(screen.getByTestId("taxClearanceCertificateIssuingAgencies"), {
      target: { value: searchTerm },
    });
    expect(screen.getAllByText(searchTerm).length).toEqual(1);

  });
});
