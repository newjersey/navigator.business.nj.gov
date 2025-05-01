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
      const firstTab = screen.getAllByRole("tab")[0];
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("does not render tax clearance certificate element", () => {
      process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE = "some random string";
      const task = generateAnytimeActionTask({ filename: "tax-clearance-certificate" });
      render(<AnytimeActionSwitchComponent anytimeActionTask={task} />);
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });
  });

  describe("ABC ETP Feature Flag", () => {
    it("renders emergency trip permit stepper if feature flag is true", () => {
      process.env.FEATURE_ABC_ETP_APPLICATION = "true";
      const task = generateAnytimeActionTask({ filename: "emergency-trip-permit" });
      render(<AnytimeActionSwitchComponent anytimeActionTask={task} />);
      const firstTab = screen.getAllByRole("tab")[0];
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("does not render emergency trip permit stepper if feature flag is not true", () => {
      process.env.FEATURE_ABC_ETP_APPLICATION = "some random string";
      const task = generateAnytimeActionTask({ filename: "emergency-trip-permit" });
      render(<AnytimeActionSwitchComponent anytimeActionTask={task} />);
      expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    });
  });
});
