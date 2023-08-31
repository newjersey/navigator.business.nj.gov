import { FieldEntryAlert } from "@/components/FieldEntryAlert";
import { AlertVariants } from "@/components/njwds-extended/Alert";
import { randomInt } from "@businessnjgovnavigator/shared/intHelpers";
import { render, screen, within } from "@testing-library/react";

describe("<FieldEntryAlert/>", () => {
  const alertMessage = `This is my alert message ${randomInt()}`;

  it("renders when fields are provided", () => {
    render(
      <FieldEntryAlert
        alertMessage={alertMessage}
        fields={[{ name: "field-name", label: "Field Name" }]}
        variant="error"
      />
    );
    expect(screen.getByText(alertMessage)).toBeInTheDocument();
  });

  it("does not render when fields is an empty array", () => {
    render(<FieldEntryAlert alertMessage={alertMessage} fields={[]} variant="error" />);
    expect(screen.queryByText(alertMessage)).not.toBeInTheDocument();
  });

  it.each(AlertVariants)("sets Alert variant accordingly when provided variant is %s", (variant) => {
    render(
      <FieldEntryAlert
        alertMessage={alertMessage}
        fields={[{ name: "field-name", label: "Field Name" }]}
        variant={variant}
        testId="field-entry-alert"
      />
    );
    expect(screen.getByTestId("field-entry-alert")).toHaveClass(`usa-alert--${variant}`);
  });

  it("displays each provided field in alert body", () => {
    const fields = [
      {
        name: `random-field-name-${randomInt()}`,
        label: `random-field-label-${randomInt()}`,
      },
      {
        name: `random-field-name-${randomInt()}`,
        label: `random-field-label-${randomInt()}`,
      },
      {
        name: `random-field-name-${randomInt()}`,
        label: `random-field-label-${randomInt()}`,
      },
    ];

    render(
      <FieldEntryAlert
        alertMessage={alertMessage}
        fields={fields}
        variant="info"
        testId="field-entry-alert"
      />
    );

    for (const field of fields) {
      const item = screen.getByTestId(`question-${field.name}-alert-text`);
      expect(within(item).getByText(field.label)).toBeInTheDocument();
      expect(within(item).getByRole("link")).toHaveAttribute("href", `#question-${field.name}`);
    }
  });
});
