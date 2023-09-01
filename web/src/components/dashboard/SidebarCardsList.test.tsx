import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import analytics from "@/lib/utils/analytics";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

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
});
