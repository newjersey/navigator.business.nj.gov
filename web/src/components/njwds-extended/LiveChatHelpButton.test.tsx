import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import analytics from "@/lib/utils/analytics";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      business_formation_help_button: {
        click: {
          open_live_chat: jest.fn(),
        },
      },
      emergency_trip_permit_help_button: {
        click: {
          open_live_chat: jest.fn(),
        },
      },
    },
  };
}

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

describe("<LiveChatHelpButton />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fires the provided analytics event when clicked", async () => {
    render(
      <LiveChatHelpButton
        analyticsEvent={analytics.event.business_formation_help_button.click.open_live_chat}
      />,
    );
    fireEvent.click(screen.getByTestId("help-button"));
    expect(
      mockAnalytics.event.business_formation_help_button.click.open_live_chat,
    ).toHaveBeenCalledTimes(1);
  });
});
