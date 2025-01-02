import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { getMergedConfig } from "@/contexts/configContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

describe("NavBarLoginButton", () => {
  beforeEach(() => {
    useMockRouter({});
  });

  const Config = getMergedConfig();

  it("triggers signin action on click", () => {
    render(<NavBarLoginButton />);
    fireEvent.click(screen.getByText(Config.navigationDefaults.logInButton));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });
});
