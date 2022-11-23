import { getMergedConfig } from "@/contexts/configContext";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";
import { LandingPageTiles } from "./LandingPageTiles";

jest.mock("next/router", () => {
  return { useRouter: jest.fn() };
});

const Config = getMergedConfig();

describe("<LandingPageTiles />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("auto-selects businessPersona and routes user to industry selection when the starting a business button is clicked", async () => {
    render(<LandingPageTiles />);

    fireEvent.click(screen.getByText(Config.landingPage.landingPageTile2Text));

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/onboarding", query: { flow: "starting" } });
  });
});
