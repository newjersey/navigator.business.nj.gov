import { LandingPageTiles } from "@/components/LandingPageTiles";
import { getMergedConfig } from "@/contexts/configContext";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

describe("<LandingPageTiles />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("routes user to industry selection when the starting a business button is clicked", async () => {
    render(<LandingPageTiles isWelcomePage={false} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTile2Text));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
  });

  it("routes user to out-of-state business section when the out-of-state business button is clicked", async () => {
    render(<LandingPageTiles isWelcomePage={false} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTile4Text));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "out-of-state" } });
  });

  it("routes user to business status section when the running a business button is clicked", async () => {
    render(<LandingPageTiles isWelcomePage={false} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTile3Text));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "up-and-running" } });
  });

  it("shows only 'Get Started' and 'Pay Taxes' tiles when visiting welcome page URL", () => {
    render(<LandingPageTiles isWelcomePage={true} />);

    expect(screen.queryByTestId("start-biz-tile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("run-biz-tile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("out-of-state-tile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("register-biz-tile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("eligible-funding-tile")).not.toBeInTheDocument();
    expect(screen.getByTestId("get-started-tile")).toBeInTheDocument();
    expect(screen.getByTestId("pay-taxes-tile")).toBeInTheDocument();
  });
});
