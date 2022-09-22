import { Button } from "@/components/njwds-extended/Button";
import { render } from "@testing-library/react";

describe("Button", () => {
  describe("Styles", () => {
    it("primary displays correctly", () => {
      const view = render(<Button style="primary">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("secondary displays correctly", () => {
      const view = render(<Button style="secondary">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("tertiary displays correctly", () => {
      const view = render(<Button style="tertiary">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("primary-big displays correctly", () => {
      const view = render(<Button style="primary-big">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("secondary-big displays correctly", () => {
      const view = render(<Button style="secondary-big">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("narrow-light displays correctly", () => {
      const view = render(<Button style="narrow-light">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("accent-cool-darker-big displays correctly", () => {
      const view = render(<Button style="accent-cool-darker-big">Test Button</Button>).baseElement;
      expect(view).toMatchSnapshot();
    });
  });

  it("submit button displays correctly", () => {
    const view = render(
      <Button typeSubmit style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("loading button displays correctly", () => {
    const view = render(
      <Button loading style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with underline button displays correctly", () => {
    const view = render(
      <Button underline style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with textBold button displays correctly", () => {
    const view = render(
      <Button textBold style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with noRightMargin button displays correctly", () => {
    const view = render(
      <Button noRightMargin style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with smallText button displays correctly", () => {
    const view = render(
      <Button smallText style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with dataTestid displays correctly", () => {
    const view = render(
      <Button dataTestid="test-button-1" style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with widthAutoOnMobile button displays correctly", () => {
    const view = render(
      <Button widthAutoOnMobile style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with heightAutoOnMobile button displays correctly", () => {
    const view = render(
      <Button heightAutoOnMobile style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("with intercomButton button displays correctly", () => {
    const view = render(
      <Button intercomButton style="primary">
        Test Button
      </Button>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });
});
