import {
  OPPORTUNITY_CARD_MAX_BODY_CHARS,
  OpportunityCard,
} from "@/components/dashboard/OpportunityCard";
import analytics from "@/lib/utils/analytics";
import { generateOpportunity } from "@/test/factories";
import { useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const mockAnalytics = analytics as jest.Mocked<typeof analytics>;
function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      opportunity_card: {
        click: {
          go_to_opportunity_screen: jest.fn(),
        },
      },
    },
  };
}

describe("OpportunityCard", () => {
  beforeEach(() => {
    jest.resetAllMocks();
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

  it("fires opportunity_card analytics when title with link is clicked", () => {
    render(
      <OpportunityCard
        opportunity={generateOpportunity({ name: "fundingName", urlSlug: "slug" })}
        urlPath="funding"
      />,
    );
    fireEvent.click(screen.getByText("fundingName"));
    expect(
      mockAnalytics.event.opportunity_card.click.go_to_opportunity_screen,
    ).toHaveBeenCalledTimes(1);
  });
});
