import { FormationHelpButton } from "@/components/njwds-extended/FormationHelpButton";
import analytics from "@/lib/utils/analytics";
import { fireEvent, render, screen } from "@testing-library/react";

function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      business_formation_help_button: {
        click: {
          open_live_chat: vi.fn(),
        },
      },
    },
  };
}

const mockAnalytics = analytics as vi.Mocked<typeof analytics>;

vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());

describe("<FormationHelpButton />", () => {
  it("the help button fires analytics", async () => {
    render(<FormationHelpButton />);
    fireEvent.click(screen.getByTestId("help-button"));
    expect(mockAnalytics.event.business_formation_help_button.click.open_live_chat).toHaveBeenCalledTimes(1);
  });
});
