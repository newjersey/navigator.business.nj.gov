import { QuickActionLinkTile } from "@/components/dashboard/QuickActionTaskLink";
import analytics from "@/lib/utils/analytics";
import { generateQuickActionLink } from "@/test/factories";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      quick_action_button: {
        click: {
          go_to_quick_action_screen: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<QuickActionTaskTile />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("routes to actions/url and triggers analytics when clicked", () => {
    render(
      <QuickActionLinkTile
        quickAction={generateQuickActionLink({
          name: "some name",
          externalRoute: "some-url",
          filename: "some-filename",
        })}
      />
    );
    fireEvent.click(screen.getByText("some name"));
    expect(mockAnalytics.event.quick_action_button.click.go_to_quick_action_screen).toHaveBeenCalledWith(
      "some-filename"
    );
  });
});
