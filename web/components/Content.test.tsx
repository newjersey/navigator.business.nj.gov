import { Content } from "@/components/Content";
import { render } from "@testing-library/react";

describe("<Content />", () => {
  describe("links", () => {
    it("opens in new tab for an external link with http", () => {
      const httpLink = "i am an [external link](http://example.com)";
      const subject = render(<Content>{httpLink}</Content>);
      expect(subject.getByText("external link").getAttribute("target")).toEqual("_blank");
    });

    it("opens in new tab for an external link with https", () => {
      const httpsLink = "i am an [external link](https://example.com)";
      const subject = render(<Content>{httpsLink}</Content>);
      expect(subject.getByText("external link").getAttribute("target")).toEqual("_blank");
    });

    it("does not open in new tab for internal links", () => {
      const internalLink = "i am an [internal link](/tasks/whatever)";
      const subject = render(<Content>{internalLink}</Content>);
      expect(subject.getByText("internal link").getAttribute("target")).toBeNull();
    });
  });
});
