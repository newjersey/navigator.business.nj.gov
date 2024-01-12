import { QuickActionTile } from "@/components/dashboard/QuickActionTile";
import { ROUTES } from "@/lib/domain-logic/routes";
import { QuickActionLink } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { generateQuickActionLink, generateQuickActionTask } from "@/test/factories";
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

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<QuickActionTile />", () => {
  describe("as an external link", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
    });

    const renderQuickActionLink = (overrides: Partial<QuickActionLink>): void => {
      render(
        <QuickActionTile
          type="link"
          quickAction={generateQuickActionLink({
            name: "some name",
            externalRoute: "some-url",
            filename: "some-filename",
            ...overrides,
          })}
        />
      );
    };

    it("routes to actions/url and triggers analytics when clicked", () => {
      renderQuickActionLink({});
      fireEvent.click(screen.getByText("some name"));
      expect(mockAnalytics.event.quick_action_button.click.go_to_quick_action_screen).toHaveBeenCalledWith(
        "some-filename"
      );
    });

    it("does not route to an internal task page when clicked", () => {
      renderQuickActionLink({});
      fireEvent.click(screen.getByText("some name"));
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("as an internal task", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
    });

    it("routes to actions/url and triggers analytics when clicked", () => {
      render(
        <QuickActionTile
          type="task"
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
});
