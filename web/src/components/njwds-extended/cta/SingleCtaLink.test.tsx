import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
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
    openInNewTab: jest.fn(),
  };
});

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
const mockedOpenInNewTab = openInNewTab;

describe("<TaskFooterCtas />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  it("opens link in new tab on click", () => {
    render(<SingleCtaLink link="https://www.example.com/" text="Click Me" />);
    fireEvent.click(screen.getByText("Click Me"));
    expect(mockAnalytics.event.task_primary_call_to_action.click.open_external_website).toHaveBeenCalledWith(
      "Click Me",
      "https://www.example.com/"
    );
  });

  it("fires analytics on click", () => {
    render(<SingleCtaLink link="https://www.example.com/" text="Click Me" />);
    fireEvent.click(screen.getByText("Click Me"));
    expect(mockedOpenInNewTab).toHaveBeenCalledTimes(1);
  });
});
