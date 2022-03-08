import { Button } from "@/components/njwds-extended/Button";
import { render } from "@testing-library/react";
import React from "react";

describe("Button", () => {
  describe("Styles", () => {
    it("primary displays correctly", () => {
      const subject = render(<Button style="primary">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("secondary displays correctly", () => {
      const subject = render(<Button style="secondary">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("tertiary displays correctly", () => {
      const subject = render(<Button style="tertiary">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("primary-big displays correctly", () => {
      const subject = render(<Button style="primary-big">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("secondary-big displays correctly", () => {
      const subject = render(<Button style="secondary-big">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("secondary-input-field-height displays correctly", () => {
      const subject = render(<Button style="secondary-input-field-height">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
    it("primary-input-field-height displays correctly", () => {
      const subject = render(<Button style="primary-input-field-height">Test Button</Button>).baseElement;
      expect(subject).toMatchSnapshot();
    });
  });
  it("submit button displays correctly", () => {
    const subject = render(
      <Button typeSubmit style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("loading button displays correctly", () => {
    const subject = render(
      <Button loading style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with underline button displays correctly", () => {
    const subject = render(
      <Button underline style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with textBold button displays correctly", () => {
    const subject = render(
      <Button textBold style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with noRightMargin button displays correctly", () => {
    const subject = render(
      <Button noRightMargin style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with smallText button displays correctly", () => {
    const subject = render(
      <Button smallText style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with dataTestid displays correctly", () => {
    const subject = render(
      <Button dataTestid="test-button-1" style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with widthAutoOnMobile button displays correctly", () => {
    const subject = render(
      <Button widthAutoOnMobile style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
  it("with heightAutoOnMobile button displays correctly", () => {
    const subject = render(
      <Button heightAutoOnMobile style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(subject).toMatchSnapshot();
  });
});
