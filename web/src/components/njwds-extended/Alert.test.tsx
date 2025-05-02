import { Alert } from "@/components/njwds-extended/Alert";
import { render, screen } from "@testing-library/react";

describe("Alert", () => {
  it("warning with heading displays correctly", () => {
    render(
      <Alert variant="warning" heading="Warning Alert with heading">
        Test Button
      </Alert>,
    );
    expect(screen.getByText("Warning Alert with heading")).toBeInTheDocument();
  });
});
