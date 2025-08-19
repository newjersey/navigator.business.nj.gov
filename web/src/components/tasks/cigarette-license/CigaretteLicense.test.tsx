import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { generateTask } from "@/test/factories";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<CigaretteLicense />", () => {
  const renderComponent = (): void => {
    render(<CigaretteLicense task={generateTask({ id: "cigarette-license" })} />);
  };

  it("renders the first tab on load", () => {
    renderComponent();
    const stepOne = new RegExp(Config.cigaretteLicenseShared.stepperOneLabel);
    const firstTab = screen.getByRole("tab", { name: stepOne });
    expect(firstTab).toHaveAttribute("aria-selected", "true");
  });
});
