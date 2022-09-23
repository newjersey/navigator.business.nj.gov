import { Tag } from "@/components/njwds-extended/Tag";
import { render } from "@testing-library/react";

describe("Tag", () => {
  describe("Variants", () => {
    it("completed displays correctly", () => {
      const view = render(<Tag tagVariant="completed">Primary Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("notStarted displays correctly", () => {
      const view = render(<Tag tagVariant="notStarted">Base Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("base displays correctly", () => {
      const view = render(<Tag tagVariant="base">Base Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("inProgress displays correctly", () => {
      const view = render(<Tag tagVariant="inProgress">Info Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("accent displays correctly", () => {
      const view = render(<Tag tagVariant="accent">Accent Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });

    it("baseDark displays correctly", () => {
      const view = render(<Tag tagVariant="baseDark">BaseDark Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
  });

  it("completed Bold displays correctly", () => {
    const view = render(
      <Tag tagVariant="completed" bold>
        Primary Test
      </Tag>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });

  it("completed textWrap displays correctly", () => {
    const view = render(
      <Tag tagVariant="completed" textWrap>
        Primary Test with a really really really really long child
      </Tag>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });
});
