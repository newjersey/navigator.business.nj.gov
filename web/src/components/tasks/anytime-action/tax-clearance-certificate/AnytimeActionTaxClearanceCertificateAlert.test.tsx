import { AnytimeActionTaxClearanceCertificateAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateAlert";
import { getMergedConfig } from "@/contexts/configContext";
import { render, screen, within } from "@testing-library/react";

const Config = getMergedConfig();

describe("<AnytimeActionTaxClearanceCertificateAlert>", () => {
  it("displays single field text in header if there is only one error", () => {
    render(<AnytimeActionTaxClearanceCertificateAlert fieldErrors={["entityId"]} />);
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.singularErrorText),
    ).toBeInTheDocument();
  });

  it("displays multiple fields text in header if there is only one error", () => {
    render(
      <AnytimeActionTaxClearanceCertificateAlert
        fieldErrors={["requestingAgencyId", "entityId"]}
      />,
    );
    const profileAlert = screen.getByTestId("tax-clearance-error-alert");
    expect(
      within(profileAlert).getByText(Config.taxClearanceCertificateShared.pluralErrorText),
    ).toBeInTheDocument();
  });

  it("displays nothing if there are no errors", () => {
    render(<AnytimeActionTaxClearanceCertificateAlert fieldErrors={[]} />);
    expect(screen.queryByTestId("tax-clearance-error-alert")).not.toBeInTheDocument();
  });
});
