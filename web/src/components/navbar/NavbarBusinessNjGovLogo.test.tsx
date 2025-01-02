import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      business_nj_gov_logo: {
        click: {
          business_nj_gov_logo: vi.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as vi.Mocked<typeof analytics>;
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
