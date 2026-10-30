import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";
import { Alert } from "@/components/njwds-extended/Alert";
import { templateEval } from "@/lib/utils/helpers";

const Config = getMergedConfig();

describe("Alert", () => {
  it("warning with heading displays correctly", () => {
    render(
      <Alert variant="warning" heading="Warning Alert with heading">
        Test Button
      </Alert>,
    );
    expect(screen.getByText("Warning Alert with heading")).toBeInTheDocument();
  });

  it("names the alert role after its variant", () => {
    render(<Alert variant="info">Test Body</Alert>);
    expect(screen.getByRole("alert")).toHaveAccessibleName(
      templateEval(Config.calloutAlerts.calloutAlertGroupTitle, {
        alertVariant: Config.calloutAlerts.info,
      }),
    );
  });

  it("has neither an alert role nor an aria-label when noAlertRole is set", () => {
    render(
      <Alert variant="info" noAlertRole>
        Test Body
      </Alert>,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByTestId("alert-info")).not.toHaveAttribute("aria-label");
  });
});
