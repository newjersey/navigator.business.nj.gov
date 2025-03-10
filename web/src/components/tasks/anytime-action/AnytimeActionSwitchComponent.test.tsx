import { AnytimeActionSwitchComponent } from "@/components/tasks/anytime-action/AnytimeActionSwitchComponent";
import { generateAnytimeActionTask } from "@/test/factories";
import { render, screen } from "@testing-library/react";

describe("AnytimeActionSwitchComponent", () => {
  const initialFeatureTaxClearanceCertificateEnv = process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE;

  afterEach(() => {
    process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE = initialFeatureTaxClearanceCertificateEnv;
  });

  describe("FEATURE_TAX_CLEARANCE_CERTIFICATE feature flag", () => {
    it("renders tax clearance certificate element", () => {
      process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE = "true";
      const task = generateAnytimeActionTask({ filename: "tax-clearance-certificate" });
      render(<AnytimeActionSwitchComponent anytimeActionTask={task} />);
      expect(screen.getByTestId("AnytimeActionTaxClearanceCertificateElement")).toBeInTheDocument();
    });

    it("does not render tax clearance certificate element", () => {
      process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE = "some random string";
      const task = generateAnytimeActionTask({ filename: "tax-clearance-certificate" });
      render(<AnytimeActionSwitchComponent anytimeActionTask={task} />);
      expect(screen.queryByTestId("AnytimeActionTaxClearanceCertificateElement")).not.toBeInTheDocument();
    });
  });
});
