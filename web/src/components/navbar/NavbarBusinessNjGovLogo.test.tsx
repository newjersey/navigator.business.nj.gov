import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      business_nj_gov_logo: {
        click: {
          business_nj_gov_logo: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const Config = getMergedConfig();

describe("<NavbarBusinessNjGovLogo />", () => {
  beforeEach(() => {
    useMockRouter({});
  });

  it("navigates to business.nj.gov when clicked by the user", async () => {
    render(<NavbarBusinessNjGovLogo />);
    fireEvent.click(screen.getByTestId("business-nj-gov-logo"));
    expect(mockPush).toHaveBeenCalledWith(Config.navigationDefaults.navBarBusinessNJGovLink);
  });

  it("fires business.nj.gov home analytics event when clicked by the user", async () => {
    render(<NavbarBusinessNjGovLogo />);
    fireEvent.click(screen.getByTestId("business-nj-gov-logo"));
    expect(mockAnalytics.event.business_nj_gov_logo.click.business_nj_gov_logo).toHaveBeenCalled();
  });
});
