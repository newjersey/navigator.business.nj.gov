import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<CigaretteLicense />", () => {
  const renderComponent = (): void => {
    render(<CigaretteLicense task={generateTask({ id: "cigarette-license" })} />);
  };

  describe("navigation", () => {
    it("renders the first tab on load", () => {
      renderComponent();
      const stepOne = new RegExp(Config.cigaretteLicenseShared.stepperOneLabel);
      const firstTab = screen.getByRole("tab", { name: stepOne });
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });
  });
});
