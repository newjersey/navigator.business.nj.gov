import { SelfRegLink } from "@/components/SelfRegLink";
import * as signinHelper from "@/lib/auth/signinHelper";
import analytics from "@/lib/utils/analytics";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      guest_snackbar: { click: { go_to_myNJ_registration: jest.fn() } },
      no_click_key: {},
      no_mynj_key: { click: {} },
    },
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/signinHelper", () => ({ onSelfRegister: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockSigninHelper = signinHelper as jest.Mocked<typeof signinHelper>;
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<SelfRegLink />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const renderSelfRegLink = (href: string): void => {
    render(
      <SelfRegLink href={href}>
        {"link"}
        {""}
      </SelfRegLink>
    );
  };

  it("calls custom analytics event when provided as second half of /self-register", async () => {
    renderSelfRegLink("/self-register/guest_snackbar");
    fireEvent.click(screen.getByText("link"));
    await waitFor(() => {
      return expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
    expect(mockAnalytics.event.guest_snackbar.click.go_to_myNJ_registration).toHaveBeenCalled();
  });

  it("does not blow up if second half of url is not an analytics key", async () => {
    renderSelfRegLink("/self-register/something_random");
    fireEvent.click(screen.getByText("link"));
    await waitFor(() => {
      return expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
  });

  it("does not blow up if second half of url has no analytics click event", async () => {
    renderSelfRegLink("/self-register/no_click_key");
    fireEvent.click(screen.getByText("link"));
    await waitFor(() => {
      return expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
  });

  it("does not blow up if second half of url has no analytics myNJ event", async () => {
    renderSelfRegLink("/self-register/no_mynj_key");
    fireEvent.click(screen.getByText("link"));
    await waitFor(() => {
      return expect(mockSigninHelper.onSelfRegister).toHaveBeenCalled();
    });
  });
});
