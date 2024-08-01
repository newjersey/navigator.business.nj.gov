import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { getMergedConfig } from "@/contexts/configContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import analytics from "@/lib/utils/analytics";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/auth/sessionHelper", () => ({
  triggerSignIn: jest.fn(),
}));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      landing_page_navbar_log_in: {
        click: {
          go_to_myNJ_login: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("NavBarLoginButton", () => {
  const Config = getMergedConfig();

  it("triggers analytics on click", async () => {
    render(<NavBarLoginButton />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
    await waitFor(() => {
      expect(mockAnalytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login).toHaveBeenCalled();
    });
  });

  it("triggers signin action on click", () => {
    render(<NavBarLoginButton />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
    expect(triggerSignIn).toHaveBeenCalled();
  });
});
