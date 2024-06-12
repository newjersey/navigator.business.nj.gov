import { AnytimeActionTile } from "@/components/dashboard/anytime-actions/AnytimeActionTile";
import { ROUTES } from "@/lib/domain-logic/routes";
import { AnytimeActionLink } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { generateAnytimeActionLink, generateAnytimeActionTask } from "@/test/factories";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      anytime_action_button: {
        click: {
          go_to_anytime_action_screen: jest.fn(),
        },
      },
    },
  };
}

jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("<AnytimeActionTile />", () => {
  describe("as an external link", () => {
    beforeEach(() => {
      jest.resetAllMocks();
      useMockRouter({});
    });

    const renderAnytimeActionLink = (overrides: Partial<AnytimeActionLink>): void => {
      render(
        <AnytimeActionTile
          type="link"
          anytimeAction={generateAnytimeActionLink({
            name: "some name",
            externalRoute: "some-url",
            filename: "some-filename",
            ...overrides,
          })}
        />
      );
    };

    it("routes to actions/url and triggers analytics when clicked", () => {
      renderAnytimeActionLink({});
      fireEvent.click(screen.getByText("some name"));
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
      ).toHaveBeenCalledWith("some-filename");
    });

    it("does not route to an internal task page when clicked", () => {
      renderAnytimeActionLink({});
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
        <AnytimeActionTile
          type="task"
          anytimeAction={generateAnytimeActionTask({
            name: "some name",
            urlSlug: "some-url",
            filename: "some-filename",
          })}
        />
      );
      fireEvent.click(screen.getByText("some name"));
      expect(mockPush).toHaveBeenCalledWith(`${ROUTES.anytimeActions}/some-url`);
      expect(
        mockAnalytics.event.anytime_action_button.click.go_to_anytime_action_screen
      ).toHaveBeenCalledWith("some-filename");
    });
  });
});
