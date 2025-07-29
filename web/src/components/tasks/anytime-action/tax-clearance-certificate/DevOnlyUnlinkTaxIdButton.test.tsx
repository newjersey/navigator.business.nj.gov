import { DevOnlyUnlinkTaxIdButton } from "@/components/tasks/anytime-action/tax-clearance-certificate/DevOnlyUnlinkTaxIdButton";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

const mockErrorSettor: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void =
  jest.fn();

describe("<DevOnlyUnlinkTaxIdButton />", () => {
  const originalValue = process.env.DEV_ONLY_UNLINK_TAX_ID;

  afterEach(() => {
    process.env.DEV_ONLY_UNLINK_TAX_ID = originalValue;
  });

  it("is rendered when DEV_ONLY_UNLINK_TAX_ID is true", () => {
    process.env.DEV_ONLY_UNLINK_TAX_ID = "true";
    render(<DevOnlyUnlinkTaxIdButton setResponseErrorType={mockErrorSettor} />);

    const button = screen.getByRole("button", { name: "Unlink Tax ID" });
    expect(button).toBeInTheDocument();
  });

  it("is not rendered when DEV_ONLY_UNLINK_TAX_ID is false", () => {
    process.env.DEV_ONLY_UNLINK_TAX_ID = "false";
    render(<DevOnlyUnlinkTaxIdButton setResponseErrorType={mockErrorSettor} />);

    const button = screen.queryByRole("button", { name: "Unlink Tax ID" });
    expect(button).not.toBeInTheDocument();
  });
});
