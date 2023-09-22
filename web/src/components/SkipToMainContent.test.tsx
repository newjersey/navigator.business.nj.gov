import { SkipToMainContent } from "@/components/SkipToMainContent";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      skip_to_main_content: {
        click: {
          skip_to_main_content: jest.fn(),
        },
      },
    },
  };
}

describe("<SkipToMainContent>", () => {
  it("fires skip_to_main_content analytics event when link is clicked", () => {
    render(<SkipToMainContent />);
    fireEvent.click(screen.getByText(Config.skipToMainContent.buttonText));
    expect(mockAnalytics.event.skip_to_main_content.click.skip_to_main_content).toHaveBeenCalledTimes(1);
  });
});
