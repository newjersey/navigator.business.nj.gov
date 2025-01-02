import { OPPORTUNITY_CARD_MAX_BODY_CHARS, OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { generateOpportunity } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { generatePreferences } from "@businessnjgovnavigator/shared/";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/utils/analytics", () => setupMockAnalytics());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));

const Config = getMergedConfig();
const mockAnalytics = analytics as vi.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...vi.requireActual("@/lib/utils/analytics").default,
    event: {
      ...vi.requireActual("@/lib/utils/analytics").default.event,
      for_you_card_hide_button: {
        click: {
          hide_card: vi.fn(),
        },
      },
      for_you_card_unhide_button: {
        click: {
          unhide_card: vi.fn(),
        },
      },
      opportunity_card: {
        click: {
          go_to_opportunity_screen: vi.fn(),
        },
      },
    },
  };
}

describe("OpportunityCard", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockBusiness({});
    useMockRouter({});
  });

  it("renders the name", () => {
    const opportunity = generateOpportunity({ name: "Test Name for Card" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Test Name for Card")).toBeInTheDocument();
  });

  it("renders the due date when it exists", () => {
    const opportunity = generateOpportunity({ dueDate: "09/01/2030" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Due:")).toBeInTheDocument();
    expect(screen.getByText("09/01/2030")).toBeInTheDocument();
  });

  it("renders the first-come-first-serve status in capitalized case", () => {
    const opportunity = generateOpportunity({ dueDate: "", status: "first come, first serve" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("First Come, First Serve")).toBeInTheDocument();
  });

  it("renders the rolling-application status in capitalized case", () => {
    const opportunity = generateOpportunity({ dueDate: "", status: "rolling application" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.getByText("Rolling Application")).toBeInTheDocument();
  });

  it("does not render due date if status is first come, first serve", () => {
    const opportunity = generateOpportunity({ dueDate: "09/03/30", status: "first come, first serve" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.queryByText("Due:")).not.toBeInTheDocument();
    expect(screen.queryByText("09/03/30")).not.toBeInTheDocument();
    expect(screen.getByText("First Come, First Serve")).toBeInTheDocument();
  });

  it("does not render due date if status is rolling application", () => {
    const opportunity = generateOpportunity({ dueDate: "09/03/30", status: "rolling application" });
    render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
    expect(screen.queryByText("Due:")).not.toBeInTheDocument();
    expect(screen.queryByText("09/03/30")).not.toBeInTheDocument();
    expect(screen.getByText("Rolling Application")).toBeInTheDocument();
  });

  describe("content truncation based on OPPORTUNITY_CARD_MAX_BODY_CHARS", () => {
    it(`displays ellipsis and first ${
      OPPORTUNITY_CARD_MAX_BODY_CHARS - 3
    } characters when character count is over ${OPPORTUNITY_CARD_MAX_BODY_CHARS}`, () => {
      const characters = Array(OPPORTUNITY_CARD_MAX_BODY_CHARS + 1)
        .fill("a")
        .join("");
      const expectedTextOnPage = `${Array(OPPORTUNITY_CARD_MAX_BODY_CHARS - 3)
        .fill("a")
        .join("")}...`;

      const opportunity = generateOpportunity({ sidebarCardBodyText: characters });
      render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
      expect(screen.getByText(expectedTextOnPage)).toBeInTheDocument();
    });

    it(`displays the entire content when character count is ${OPPORTUNITY_CARD_MAX_BODY_CHARS}`, () => {
      const characters = Array(OPPORTUNITY_CARD_MAX_BODY_CHARS).fill("a").join("");

      const opportunity = generateOpportunity({ sidebarCardBodyText: characters });
      render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
      expect(screen.getByText(characters)).toBeInTheDocument();
    });

    it(`displays the entire content when character count is less than ${OPPORTUNITY_CARD_MAX_BODY_CHARS}`, () => {
      const characters = Array(OPPORTUNITY_CARD_MAX_BODY_CHARS - 10)
        .fill("a")
        .join("");

      const opportunity = generateOpportunity({ sidebarCardBodyText: characters });
      render(<OpportunityCard opportunity={opportunity} urlPath="funding" />);
      expect(screen.getByText(characters)).toBeInTheDocument();
    });
  });

  it("fires hide_card analytics when hide button is clicked", () => {
    render(<OpportunityCard opportunity={generateOpportunity({ id: "123" })} urlPath="funding" />);
    fireEvent.click(screen.getByText(Config.dashboardDefaults.hideOpportunityText));
    expect(mockAnalytics.event.for_you_card_hide_button.click.hide_card).toHaveBeenCalledTimes(1);
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_card).not.toHaveBeenCalled();
  });

  it("fires opportunity_card analytics when title with link is clicked", () => {
    render(
      <OpportunityCard
        opportunity={generateOpportunity({ name: "fundingName", urlSlug: "slug" })}
        urlPath="funding"
      />
    );
    fireEvent.click(screen.getByText("fundingName"));
    expect(mockAnalytics.event.opportunity_card.click.go_to_opportunity_screen).toHaveBeenCalledTimes(1);
  });

  it("fires unhide_card analytics when unhide button is clicked", () => {
    useMockBusiness({ preferences: generatePreferences({ hiddenFundingIds: ["123"] }) });
    render(<OpportunityCard opportunity={generateOpportunity({ id: "123" })} urlPath="funding" />);
    fireEvent.click(screen.getByText(Config.dashboardDefaults.unHideOpportunityText));
    expect(mockAnalytics.event.for_you_card_hide_button.click.hide_card).not.toHaveBeenCalled();
    expect(mockAnalytics.event.for_you_card_unhide_button.click.unhide_card).toHaveBeenCalledTimes(1);
  });
});
