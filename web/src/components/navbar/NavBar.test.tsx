import { NavBar } from "@/components/navbar/NavBar";
import { NavBarVariant } from "@/components/navbar/NavBarTypes";
import { useMockRouter } from "@/test/mock/mockRouter";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<NavBar />", () => {
  beforeEach(() => {
    useMockRouter({});
  });

  it("renders the public starter-kit variant without UserDataProvider", () => {
    render(<NavBar variant={NavBarVariant.MINIMAL_WITH_LOGIN} />);

    expect(screen.getAllByText(getMergedConfig().navigationDefaults.logInButton)).not.toHaveLength(
      0,
    );
  });

  it("requires UserDataProvider for stateful variants", () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<NavBar variant={NavBarVariant.FULL_AUTHENTICATED} />)).toThrow(
      "useUserData must be used within a UserDataProvider",
    );

    consoleError.mockRestore();
  });
});
