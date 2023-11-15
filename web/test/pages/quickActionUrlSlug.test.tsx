import QuickActionTaskPage from "@/pages/actions/[quickActionTaskUrlSlug]";
import { generateQuickActionTask } from "@/test/factories";
import { render, screen } from "@testing-library/react";

describe("quick action page", () => {
  it("shows the quick action details", () => {
    const quickAction = generateQuickActionTask({
      name: "Some Quick Action Name",
      callToActionText: "Click here",
      contentMd: "Some content description",
      form: "FORM-123",
    });

    render(<QuickActionTaskPage quickActionTask={quickAction} />);

    expect(screen.getByText("Some Quick Action Name")).toBeInTheDocument();
    expect(screen.getByText("Click here")).toBeInTheDocument();
    expect(screen.getByText("Some content description")).toBeInTheDocument();
    expect(screen.getByText("FORM-123")).toBeInTheDocument();
  });
});
