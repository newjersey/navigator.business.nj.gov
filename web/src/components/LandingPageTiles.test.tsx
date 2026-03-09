import { getStartingBusinessTileSet, LandingPageTiles } from "@/components/LandingPageTiles";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

describe("<LandingPageTiles />", () => {
  let startingBusinessTileSet: ReturnType<typeof getStartingBusinessTileSet>;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
      configurable: true,
    });
    startingBusinessTileSet = getStartingBusinessTileSet(Config.landingPage);
  });

  it("redirects to external URL when the funding tile is clicked", async () => {
    render(<LandingPageTiles tiles={startingBusinessTileSet} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageFundingTile));

    expect(window.location.href).toBe(Config.landingPage.landingPageFundingLink);
  });

  it("routes user to starting section when the start business a business button is clicked", async () => {
    render(<LandingPageTiles tiles={startingBusinessTileSet} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageStartBizTile));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
  });

  it("redirects to external URL when the business structure tile is clicked", async () => {
    render(<LandingPageTiles tiles={startingBusinessTileSet} />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageBusinessStructureTile));

    expect(window.location.href).toBe(Config.landingPage.landingPageBusinessStructureLink);
  });
});
