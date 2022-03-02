import { render } from "@testing-library/react";
import React from "react";
import { Alert } from "./Alert";

describe("Alert", () => {
  describe("Variants", () => {
    it("Error displays correctly", () => {
      const subject = render(<Alert variant="error">Test Button</Alert>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("Info displays correctly", () => {
      const subject = render(<Alert variant="info">Test Button</Alert>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("Success displays correctly", () => {
      const subject = render(<Alert variant="success">Test Button</Alert>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("warning displays correctly", () => {
      const subject = render(<Alert variant="warning">Test Button</Alert>).baseElement;
      expect(subject).toMatchSnapshot();
    });
  });
  it("warning with heading displays correctly", () => {
    const subject = render(
      <Alert variant="warning" heading="Warning Alert with heading">
        Test Button
      </Alert>
    ).baseElement;
    expect(subject).toMatchSnapshot();
    expect(subject).toHaveTextContent("Warning Alert with heading");
  });
  it("error with no icon displays correctly", () => {
    const subject = render(
      <Alert variant="error" noIcon>
        Test Button
      </Alert>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("info with rounded corners displays correctly", () => {
    const subject = render(
      <Alert variant="info" rounded>
        Test Button
      </Alert>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
});
