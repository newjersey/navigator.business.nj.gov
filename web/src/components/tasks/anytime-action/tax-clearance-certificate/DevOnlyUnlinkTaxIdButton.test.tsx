import { DevOnlyUnlinkTaxIdButton } from "@/components/tasks/anytime-action/tax-clearance-certificate/DevOnlyUnlinkTaxIdButton";
import { TaxClearanceCertificateResponseErrorType } from "@businessnjgovnavigator/shared";
import { render, screen } from "@testing-library/react";

const mockErrorSettor: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void =
  jest.fn();

describe("<DevOnlyUnlinkTaxIdButton />", () => {
  const originalEnvironment = process.env.STAGE;

  afterEach(() => {
    process.env.STAGE = originalEnvironment;
  });

  it("is rendered in a non-prod env", () => {
    process.env.STAGE = "dev";
    render(<DevOnlyUnlinkTaxIdButton setResponseErrorType={mockErrorSettor} />);

    const button = screen.getByRole("button", { name: "Unlink Tax ID" });
    expect(button).toBeInTheDocument();
  });

  it("is not rendered in a prod env", () => {
    process.env.STAGE = "prod";
    render(<DevOnlyUnlinkTaxIdButton setResponseErrorType={mockErrorSettor} />);

    const button = screen.queryByRole("button", { name: "Unlink Tax ID" });
    expect(button).not.toBeInTheDocument();
  });
});
