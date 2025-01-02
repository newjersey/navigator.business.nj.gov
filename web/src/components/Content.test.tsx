import { Content } from "@/components/Content";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { render, screen } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

describe("<Content />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
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

  it("renders callout content", () => {
    const mdString = `:::callout{ showHeader="true" headerText="header" showIcon="true" calloutType="conditional" }\n\nbody text\n\n:::`;

    render(<Content>{mdString}</Content>);
    expect(screen.getByText("header")).toBeInTheDocument();
    expect(screen.getByText("body text")).toBeInTheDocument();
    expect(screen.getByTestId("callout-conditional-icon")).toBeInTheDocument();
  });
});
