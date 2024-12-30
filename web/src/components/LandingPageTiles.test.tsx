import { LandingPageTiles } from "@/components/LandingPageTiles";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      landing_page_get_my_registration_guide_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
      landing_page_file_and_pay_my_taxes_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
      landing_page_im_an_out_of_business_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
      landing_page_find_funding_for_my_business_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
      landing_page_im_starting_a_nj_business_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
      landing_page_im_running_a_nj_business_tile: {
        click: {
          go_to_onboarding: jest.fn(),
        },
      },
    },
  };
}

describe("<LandingPageTiles />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("routes user to industry selection when the starting a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageRegisterBizTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
    expect(
      mockAnalytics.event.landing_page_get_my_registration_guide_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });

  it("routes user to out-of-state business section when the out-of-state business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageOutOfStateTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "out-of-state" } });
    expect(
      mockAnalytics.event.landing_page_im_an_out_of_business_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });

  it("routes user to business status section when the running a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTaxesTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "up-and-running" } });
    expect(
      mockAnalytics.event.landing_page_file_and_pay_my_taxes_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });

  it("routes user to business status section when the fundings a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageFundingTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "up-and-running" } });
    expect(
      mockAnalytics.event.landing_page_find_funding_for_my_business_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });

  it("routes user to industry selection section when the start business a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageStartBizTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
    expect(
      mockAnalytics.event.landing_page_im_starting_a_nj_business_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });

  it("routes user to business status section when the I'm running a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTileRunBizTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "up-and-running" } });
    expect(
      mockAnalytics.event.landing_page_im_running_a_nj_business_tile.click.go_to_onboarding
    ).toHaveBeenCalledTimes(1);
  });
});
