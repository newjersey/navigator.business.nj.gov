import { FormationHelpButton } from "@/components/njwds-extended/FormationHelpButton";
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
    },
  };
}

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

describe("<FormationHelpButton />", () => {
  it("the help button fires analytics", async () => {
    render(<FormationHelpButton />);
    fireEvent.click(screen.getByTestId("help-button"));
    expect(mockAnalytics.event.business_formation_help_button.click.open_live_chat).toHaveBeenCalledTimes(1);
  });
});
