import { TaskCtaLinks } from "@/components/TaskCtaLinks";
import analytics from "@/lib/utils/analytics";
import * as helpers from "@/lib/utils/helpers";
import { generateTask } from "@/test/factories";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      task_primary_call_to_action: {
        click: {
          open_external_website: jest.fn(),
        },
      },
    },
  };
}

jest.mock("@/lib/utils/helpers", () => {
  return {
    ...jest.requireActual("@/lib/utils/helpers").default,
    openInNewTab: jest.fn(),
  };
});

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const mockHelpers = helpers as jest.Mocked<typeof helpers>;

describe("<TaskFooterCtas />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  describe("when task does not have post-onboarding question", () => {
    it("displays nothing when CTA link and text from task are not defined", () => {
      render(<TaskCtaLinks task={generateTask({ callToActionLink: "", callToActionText: "" })} />);

      expect(screen.queryByTestId("cta-area")).not.toBeInTheDocument();
    });

    it("displays CTA link from task", () => {
      render(
        <TaskCtaLinks
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      expect(screen.getByTestId("cta-area")).toBeInTheDocument();
      expect(screen.getByText("CTA Link")).toBeInTheDocument();
    });

    it("fires CTA link analytics", () => {
      render(
        <TaskCtaLinks
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      fireEvent.click(screen.getByText("CTA Link"));
      expect(
        mockAnalytics.event.task_primary_call_to_action.click.open_external_website
      ).toHaveBeenCalledWith("CTA Link", "https://www.example.com/0");
    });

    it("open new tab when CTA link is clicked", () => {
      render(
        <TaskCtaLinks
          task={generateTask({
            callToActionLink: "https://www.example.com/0",
            callToActionText: "CTA Link",
          })}
        />
      );

      expect(screen.getByTestId("cta-area")).toBeInTheDocument();
      fireEvent.click(screen.getByText("CTA Link"));
      expect(mockHelpers.openInNewTab).toHaveBeenCalledTimes(1);
    });
  });
});
