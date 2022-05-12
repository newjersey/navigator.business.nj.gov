import { Content } from "@/components/Content";
import * as signinHelper from "@/lib/auth/signinHelper";
import analytics from "@/lib/utils/analytics";
import { useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render } from "@testing-library/react";
import React from "react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      guest_toast: { click: { go_to_myNJ_registration: jest.fn() } },
      no_click_key: {},
      no_mynj_key: { click: {} },
    },
  };
}

jest.mock("next/router");
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<Content />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

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

    it("renders the /self-register link with a custom onClick", () => {
      const selfRegLink = "[link](/self-register)";
      const subject = render(<Content>{selfRegLink}</Content>);
      fireEvent.click(subject.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });

    it("calls custom analytics event when provided as second half of /self-register", () => {
      const selfRegLink = "[link](/self-register/guest_toast)";
      const subject = render(<Content>{selfRegLink}</Content>);
      fireEvent.click(subject.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
      expect(mockAnalytics.event.guest_toast.click.go_to_myNJ_registration).toHaveBeenCalled();
    });

    it("does not blow up if second half of url is not an analytics key", () => {
      const selfRegLink = "[link](/self-register/something_random)";
      const subject = render(<Content>{selfRegLink}</Content>);
      fireEvent.click(subject.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });

    it("does not blow up if second half of url has no analytics click event", () => {
      const selfRegLink = "[link](/self-register/no_click_key)";
      const subject = render(<Content>{selfRegLink}</Content>);
      fireEvent.click(subject.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });

    it("does not blow up if second half of url has no analytics myNJ event", () => {
      const selfRegLink = "[link](/self-register/no_mynj_key)";
      const subject = render(<Content>{selfRegLink}</Content>);
      fireEvent.click(subject.getByText("link"));
      expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
  });
});
