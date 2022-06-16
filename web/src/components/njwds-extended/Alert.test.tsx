import { Alert } from "@/components/njwds-extended/Alert";
import { render } from "@testing-library/react";

describe("Alert", () => {
  describe("Variants", () => {
    it("Error displays correctly", () => {
      const view = render(<Alert variant="error">Test Button</Alert>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("Info displays correctly", () => {
      const view = render(<Alert variant="info">Test Button</Alert>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("Success displays correctly", () => {
      const view = render(<Alert variant="success">Test Button</Alert>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("warning displays correctly", () => {
      const view = render(<Alert variant="warning">Test Button</Alert>).baseElement;
      expect(view).toMatchSnapshot();
    });
  });

  it("warning with heading displays correctly", () => {
    const view = render(
      <Alert variant="warning" heading="Warning Alert with heading">
        Test Button
      </Alert>
    ).baseElement;
    expect(view).toMatchSnapshot();
    expect(view).toHaveTextContent("Warning Alert with heading");
  });

  it("error with no icon displays correctly", () => {
    const view = render(
      <Alert variant="error" noIcon>
        Test Button
      </Alert>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("info with rounded corners displays correctly", () => {
    const view = render(
      <Alert variant="info" rounded>
        Test Button
      </Alert>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });
});
