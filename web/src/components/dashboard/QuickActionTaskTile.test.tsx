import { QuickActionTaskTile } from "@/components/dashboard/QuickActionTaskTile";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { generateQuickActionTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
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
jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<QuickActionTaskTile />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
  });

  it("routes to actions/url and triggers analytics when clicked", () => {
    render(
      <QuickActionTaskTile
        quickAction={generateQuickActionTask({
          name: "some name",
          urlSlug: "some-url",
          filename: "some-filename",
        })}
      />
    );
    fireEvent.click(screen.getByText("some name"));
    expect(mockPush).toHaveBeenCalledWith(`${ROUTES.quickActions}/some-url`);
    expect(mockAnalytics.event.quick_action_button.click.go_to_quick_action_screen).toHaveBeenCalledWith(
      "some-filename"
    );
  });
});
