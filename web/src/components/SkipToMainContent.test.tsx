import { SkipToMainContent } from "@/components/SkipToMainContent";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as vi.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      skip_to_main_content: {
        click: {
          skip_to_main_content: vi.fn(),
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
