import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { ROUTES } from "@/lib/domain-logic/routes";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

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
