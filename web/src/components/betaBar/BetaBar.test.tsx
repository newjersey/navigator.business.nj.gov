import { BetaBar } from "@/components/betaBar/BetaBar";
import { useMockUserData } from "@/test/mock/mockUseUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<BetaBar />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockUserData({});
  });

  it("opens feedback modal on button click", () => {
    render(<BetaBar />);
    expect(screen.queryByText(Config.betaBar.betaModalTitle)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.betaBar.betaModalButtonText));
    expect(screen.getByText(Config.betaBar.betaModalTitle)).toBeInTheDocument();
  });
});
