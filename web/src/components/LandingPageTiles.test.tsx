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
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageRegisterBizTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
  });

  it("routes user to out-of-state business section when the out-of-state business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageOutOfStateTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "out-of-state" } });
  });

  it("routes user to business status section when the running a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTaxesTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "up-and-running" } });
  });
});
