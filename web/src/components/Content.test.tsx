import { Content } from "@/components/Content";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<Content />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  describe("links", () => {
    it("opens in new tab for an external link with http", () => {
      const httpLink = "i am an [external link](http://example.com)";
      render(<Content>{httpLink}</Content>);
      expect(screen.getByText("external link")).toHaveAttribute("target", "_blank");
    });

    it("opens in new tab for an external link with https", () => {
      const httpsLink = "i am an [external link](https://example.com)";
      render(<Content>{httpsLink}</Content>);
      expect(screen.getByText("external link")).toHaveAttribute("target", "_blank");
    });

    it("does not open in new tab for internal links", () => {
      const internalLink = "i am an [internal link](/tasks/whatever)";
      render(<Content>{internalLink}</Content>);
      const externalTarget = screen.getByText("internal link").getAttribute("target");
      expect(externalTarget).toBeNull();
    });
  });

  describe("infoAlert", () => {
    it("renders info alert with header", () => {
      const mdString = ":::infoAlert\n body text\n :::";

      render(<Content>{mdString}</Content>);
      expect(screen.getByText("body text")).toBeInTheDocument();
    });
  });

  it("renders note content", () => {
    const mdString = ":::note \n" + "body text\n" + ":::";

    render(<Content>{mdString}</Content>);
    expect(screen.getByText("body text")).toBeInTheDocument();
  });

  it("renders largeCallout content", () => {
    const mdString = `:::largeCallout{ showHeader="true" headerText="header" calloutType="conditional" }\n\nbody text\n\n:::`;

    render(<Content>{mdString}</Content>);
    expect(screen.getByText("header")).toBeInTheDocument();
    expect(screen.getByText("body text")).toBeInTheDocument();
  });

  it("renders miniCallout content", () => {
    const mdString = `:::miniCallout{ calloutType="conditional" }\nbody text\n:::`;

    render(<Content>{mdString}</Content>);
    expect(screen.getByText("body text")).toBeInTheDocument();
    expect(screen.getByTestId("callout-icon")).toBeInTheDocument();
  });
});
