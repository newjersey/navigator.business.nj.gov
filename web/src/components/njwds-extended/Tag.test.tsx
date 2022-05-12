import { Tag } from "@/components/njwds-extended/Tag";
import { render } from "@testing-library/react";
import React from "react";

describe("Tag", () => {
  describe("Variants", () => {
    it("Primary displays correctly", () => {
      const view = render(<Tag tagVariant="primary">Primary Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("base displays correctly", () => {
      const view = render(<Tag tagVariant="base">Base Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("info displays correctly", () => {
      const view = render(<Tag tagVariant="info">Info Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("info with hover displays correctly", () => {
      const view = render(
        <Tag tagVariant="info" hover>
          Info with hover Test
        </Tag>
      ).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("error displays correctly", () => {
      const view = render(<Tag tagVariant="error">Error Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("accent displays correctly", () => {
      const view = render(<Tag tagVariant="accent">Accent Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("noBg displays correctly", () => {
      const view = render(<Tag tagVariant="noBg">NoBg Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
    it("baseDark displays correctly", () => {
      const view = render(<Tag tagVariant="baseDark">BaseDark Test</Tag>).baseElement;
      expect(view).toMatchSnapshot();
    });
  });
  it("Primary Bold displays correctly", () => {
    const view = render(
      <Tag tagVariant="primary" bold>
        Primary Test
      </Tag>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });
  it("Primary textWrap displays correctly", () => {
    const view = render(
      <Tag tagVariant="primary" textWrap>
        Primary Test with a really really really really long child
      </Tag>
    ).baseElement;
    expect(view).toMatchSnapshot();
  });
});
