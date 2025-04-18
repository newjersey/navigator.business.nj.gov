import { AnytimeActionTaxClearanceCertificateElementAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElementAlert";
import { getMergedConfig } from "@/contexts/configContext";
import { render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<AnytimeActionTaxClearanceCertificateElementAlert>", () => {
  it("displays single field text in header if there is only one error", () => {
    render(<AnytimeActionTaxClearanceCertificateElementAlert fieldErrors={["entityId"]} />);
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.singularErrorText)
    ).toBeInTheDocument();
  });

  it("displays multiple fields text in header if there is only one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateElementAlert fieldErrors={["requestingAgencyId", "entityId"]} />
    );
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.pluralErrorText)
    ).toBeInTheDocument();
  });

  it("displays nothing if there are no errors", () => {
    render(<AnytimeActionTaxClearanceCertificateElementAlert fieldErrors={[]} />);
    expect(screen.queryByTestId("tax-clearance-error-alert")).not.toBeInTheDocument();
  });
});
