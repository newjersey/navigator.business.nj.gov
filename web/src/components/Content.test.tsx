import { Content } from "@/components/Content";
import * as signinHelper from "@/lib/auth/signinHelper";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockProfileData, useMockUserData } from "@/test/mock/mockUseUserData";
import { randomInt } from "@businessnjgovnavigator/shared/index";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;

describe("<Content />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockUserData({});
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

    it("renders the /self-register link with a custom onClick", () => {
      const selfRegLink = "[link](/self-register)";
      render(<Content>{selfRegLink}</Content>);
      fireEvent.click(screen.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
  });

  describe("infoAlert", () => {
    it("renders info alert with header", () => {
      const mdString = ":::infoAlert{header='Header Text'}\n" + "body text\n" + ":::";

      render(<Content>{mdString}</Content>);
      expect(screen.getByText("Header Text")).toBeInTheDocument();
      expect(screen.getByText("body text")).toBeInTheDocument();
    });
  });

  describe("out-of-state designator", () => {
    it("renders out of state designation when businessPersona is Foreign", () => {
      const mdString = "You have a ${oos} business";
      const config = "out-of-state";
      useMockProfileData({
        businessPersona: "FOREIGN",
      });

      render(<Content>{mdString}</Content>);
      expect(screen.getByText(`You have a ${config} business`)).toBeInTheDocument();
    });

    it("does not render out of state designation when businessPersona is not Foreign", () => {
      const mdString = "You have a ${oos} business";
      useMockProfileData({
        businessPersona: randomInt() % 2 ? "STARTING" : "OWNING",
      });

      render(<Content>{mdString}</Content>);
      expect(screen.getByText(`You have a business`)).toBeInTheDocument();
    });
  });
});
