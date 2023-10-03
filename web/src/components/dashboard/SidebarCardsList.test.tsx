import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import analytics from "@/lib/utils/analytics";
import { generateCertification } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { fireEvent, render, screen } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      for_you_card_unhide_button: {
        click: {
          unhide_cards: jest.fn(),
        },
      },
    },
  };
}

describe("<SidebarCardsList />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation(() => {
      return true;
    });
    useMockBusiness({});
  });

  it("fire unhide_cards analytics when accordion is opened when displayFundings is true", () => {
    render(
      <SidebarCardsList
        topCards={[]}
        bottomCards={[]}
        fundings={[]}
        hiddenFundings={[]}
        certifications={[]}
        hiddenCertifications={[]}
        displayFundings={true}
        displayCertifications={false}
      />
    );
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  it("fire unhide_cards analytics when accordion is opened when displayCertifications is true", () => {
    render(
      <SidebarCardsList
        topCards={[]}
        bottomCards={[]}
        fundings={[]}
        hiddenFundings={[]}
        certifications={[]}
        hiddenCertifications={[]}
        displayFundings={false}
        displayCertifications={true}
      />
    );
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    fireEvent.click(screen.getByTestId("hidden-opportunity-header"));
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_cards).toHaveBeenCalledTimes(1);
  });

  describe("SidebarCardsList For You Counter", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      (useMediaQuery as jest.Mock).mockImplementation(() => {
        return true;
      });
    });

    const mockBusiness = generateBusiness({
      profileData: generateProfileData({
        operatingPhase: "GUEST_MODE_OWNING",
        municipality: undefined,
        sectorId: undefined,
        existingEmployees: "50",
      }),
    });

    it("render cards with a zero count in the For You header when no Fundings and no certifications are present", () => {
      useMockBusiness(mockBusiness);
      render(
        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[]}
          hiddenCertifications={[]}
          displayFundings={true}
          displayCertifications={true}
        />
      );
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(0)");
    });

    it("render cards with a one count in the For You header when one certification is present", () => {
      useMockBusiness(mockBusiness);
      render(
        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[generateCertification({})]}
          hiddenCertifications={[]}
          displayFundings={true}
          displayCertifications={true}
        />
      );
      const forYouCounter = screen.getByTestId("for-you-counter").textContent;
      expect(forYouCounter).toEqual("(1)");
    });
  });
});
