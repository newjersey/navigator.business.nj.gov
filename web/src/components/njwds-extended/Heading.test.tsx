import { Heading } from "@/components/njwds-extended/Heading";
import { render, screen } from "@testing-library/react";

describe("Heading component", () => {
  const sampleHeadingText = "Hello, navigator!";

  it("should render an h1 with h1-styling by default", async () => {
    render(<Heading level={1}>{sampleHeadingText}</Heading>);
    expect(screen.getByText(sampleHeadingText).tagName).toEqual("H1");
  });

  it("should render an h2 with h3-styling when so desired", async () => {
    render(
      <Heading level={2} styleVariant="h3">
        {sampleHeadingText}
      </Heading>
    );
    const headingElement = screen.getByText(sampleHeadingText);
    expect(headingElement.tagName).toEqual("H2");
    expect(headingElement).toHaveClass("h3-styling");
  });

  it("should render an h3 with no styling when so desired", async () => {
    render(
      <Heading level={3} styleVariant="rawElement">
        {sampleHeadingText}
      </Heading>
    );
    const headingElement = screen.getByText(sampleHeadingText);
    expect(headingElement.tagName).toEqual("H3");
    expect(headingElement).not.toHaveClass("h3-styling");
  });

  it("should pass additional classes to the rendered element", async () => {
    render(
      <Heading level={4} className="navigator">
        {sampleHeadingText}
      </Heading>
    );
    const headingElement = screen.getByText(sampleHeadingText);
    expect(headingElement.tagName).toEqual("H4");
    expect(headingElement).toHaveClass("navigator");
  });
});
