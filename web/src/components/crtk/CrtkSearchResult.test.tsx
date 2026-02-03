import { CrtkSearchResult } from "@/components/crtk/CrtkSearchResult";
import type { CrtkData } from "@/components/crtk/crtkTypes";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();

describe("<CrtkSearchResult />", () => {
  const mockOnSearchAgain = jest.fn();

  const baseCrtkData: CrtkData = {
    crtkSearchResult: "FOUND",
    lastUpdatedISO: "2025-03-11T20:27:35.000Z",
    crtkBusinessDetails: {
      businessName: "TestBusiness",
      addressLine1: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      addressZipCode: "07513",
      ein: "273265199",
    },
    crtkEntry: {
      businessName: "TestBusiness",
      streetAddress: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      state: "NJ",
      zipCode: "07513",
      ein: "273265199",
      facilityId: "00000080331",
      naicsCode: "424690",
      naicsDescription: "Other Chemical and Allied Products Merchant Wholesalers",
      businessActivity: "RAW MATERIAL RECEIVING, STORAGE AND DISTRIBUTION",
      type: "REGULATED",
      status: "ACTIVE",
      eligibility: "CRTK/RPPR",
      userStatus: "USER ABOVE",
      receivedDate: "2025-03-11T20:27:35.000Z",
    },
  };

  const renderComponent = (crtkData: Partial<CrtkData> = {}): void => {
    const mergedData = {
      ...baseCrtkData,
      ...crtkData,
      crtkEntry: {
        ...baseCrtkData.crtkEntry,
        ...crtkData.crtkEntry,
      },
      crtkBusinessDetails:
        crtkData.crtkBusinessDetails === undefined
          ? undefined
          : {
              ...baseCrtkData.crtkBusinessDetails!,
              ...crtkData.crtkBusinessDetails,
            },
    };

    render(
      <CrtkSearchResult
        isLoading={false}
        crtkData={mergedData}
        onSearchAgain={mockOnSearchAgain}
        onResubmit={jest.fn()}
      />,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Business Details Display", () => {
    it("displays business name with special characters correctly", () => {
      renderComponent({
        crtkSearchResult: "FOUND",
        crtkBusinessDetails: {
          businessName: "Bob's Auto & Repair Co.",
          addressLine1: "123 Main St",
          city: "Newark",
          addressZipCode: "07102",
          ein: "123456789",
        },
      });
      expect(screen.getByText("Bob's Auto & Repair Co.")).toBeInTheDocument();
    });
  });

  describe("FOUND Status", () => {
    it("displays CRTK details accordion when status is FOUND", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Your CRTK Details"));
      expect(screen.getByText(/Facility Type:/)).toBeInTheDocument();
      expect(screen.getByText(/REGULATED/)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
      expect(screen.getByText(/CRTK\/RPPR/)).toBeInTheDocument();
      expect(screen.getByText(/Facility Status:/)).toBeInTheDocument();
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    });

    it("displays N/A when CRTK entry details are missing", async () => {
      renderComponent({
        crtkSearchResult: "FOUND",
        crtkEntry: {
          type: undefined,
          eligibility: undefined,
          status: undefined,
        },
      });
      await userEvent.click(screen.getByText("Your CRTK Details"));
      const naElements = screen.getAllByText(/N\/A/);
      expect(naElements).toHaveLength(3);
    });

    it("displays N/A for individual missing fields while showing others", async () => {
      renderComponent({
        crtkSearchResult: "FOUND",
        crtkEntry: {
          type: "REGULATED",
          eligibility: undefined,
          status: "ACTIVE",
        },
      });
      await userEvent.click(screen.getByText("Your CRTK Details"));
      expect(screen.getByText(/REGULATED/)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    });

    it("displays Next Steps accordion with survey requirements for FOUND status", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(/you must complete the survey if your facility had ehs/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/complete an exemption form if any of the following are true:/i),
      ).toBeInTheDocument();
    });

    it("displays exemption criteria for FOUND status", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      expect(screen.getByText(/your building is an administrative site only/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has no ehs/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has ehs below the threshold/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has staff on-site/i)).toBeInTheDocument();
    });

    it("displays exemption note about not filling form every year", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /if crtk approves your exemption, you don't need to fill out the form every year/i,
        ),
      ).toBeInTheDocument();
    });

    it("displays survey deadline information", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /fill out the survey for each location where the chemical was stored by march 1 every year/i,
        ),
      ).toBeInTheDocument();
    });

    it("displays warning section when status is FOUND", () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      expect(screen.getByText(Config.crtkTask.warningTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.crtkTask.warningText)).toBeInTheDocument();
    });
  });

  describe("Contact Information", () => {
    it("displays CRTK contact information for FOUND status", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      expect(screen.getByText(Config.crtkTask.contactCrtkExpertTitle)).toBeInTheDocument();
      expect(screen.getByText(/phone: \(609\) 292-6714/i)).toBeInTheDocument();
    });

    it("displays email link with correct href for FOUND status", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      await userEvent.click(screen.getByText("Next Steps"));
      const emailLink = screen.getByRole("link", { name: /rtk@dep.nj.gov/i });
      expect(emailLink).toHaveAttribute("href", "mailto:rtk@dep.nj.gov");
    });
  });

  describe("Search Again Button", () => {
    it("displays Check Again button when status is NOT_FOUND and onSearchAgain prop is provided", () => {
      renderComponent({ crtkSearchResult: "NOT_FOUND" });
      expect(screen.getByTestId("crtk-search-again")).toBeInTheDocument();
    });

    it("calls onSearchAgain callback when Check Again button is clicked", async () => {
      renderComponent({ crtkSearchResult: "NOT_FOUND" });
      const searchAgainButton = screen.getByTestId("crtk-search-again");
      await userEvent.click(searchAgainButton);
      expect(mockOnSearchAgain).toHaveBeenCalledTimes(1);
    });

    it("does not display Check Again button when status is FOUND", () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      expect(screen.queryByTestId("crtk-search-again")).not.toBeInTheDocument();
    });

    it("Check Again button has correct text", () => {
      renderComponent({ crtkSearchResult: "NOT_FOUND" });
      const searchAgainButton = screen.getByTestId("crtk-search-again");
      expect(searchAgainButton).toHaveTextContent("Check Again");
    });

    it("displays Complete Survey button when status is FOUND", () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      expect(screen.getByTestId("crtk-complete-survey")).toBeInTheDocument();
    });

    it("Complete Survey button has correct text and link", () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      const completeButton = screen.getByTestId("crtk-complete-survey");
      expect(completeButton).toHaveTextContent("Complete the CRTK Survey or Exemption");
      const link = screen.getByRole("link", { name: /complete the crtk survey or exemption/i });
      expect(link).toHaveAttribute(
        "href",
        "https://www.nj.gov/dep/enforcement/opppc/crtk/crtkguidance.pdf",
      );
    });
  });

  describe("Federal Information Section", () => {
    it("displays federal information section", () => {
      renderComponent();
      expect(screen.getByText(Config.crtkTask.federalInfoTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.crtkTask.federalInfoText)).toBeInTheDocument();
    });

    it("displays link to EPA EPCRA website", () => {
      renderComponent();
      const link = screen.getByRole("link", { name: Config.crtkTask.federalLinkText });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "https://www.epa.gov/epcra");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty string values in business details", () => {
      renderComponent({
        crtkBusinessDetails: {
          businessName: "",
          addressLine1: "",
          city: "",
          addressZipCode: "",
        },
      });
      expect(screen.getByText(", , NJ")).toBeInTheDocument();
    });

    it("handles undefined values in crtkEntry", async () => {
      renderComponent({
        crtkSearchResult: "FOUND",
        crtkEntry: {
          type: undefined,
          status: undefined,
          eligibility: undefined,
        },
      });
      await userEvent.click(screen.getByText("Your CRTK Details"));
      const naElements = screen.getAllByText(/N\/A/);
      expect(naElements).toHaveLength(3);
    });
  });

  describe("CRTK Details Accordion", () => {
    it("expands when clicked", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      const accordion = screen.getByText("Your CRTK Details");
      await userEvent.click(accordion);
      expect(screen.getByText("Facility Type:")).toBeInTheDocument();
    });

    it("expands when clicked and the status is FOUND", async () => {
      renderComponent({ crtkSearchResult: "FOUND" });
      const accordion = screen.getByText("Next Steps");
      await userEvent.click(accordion);
      expect(screen.getByText(Config.crtkTask.ehsSurveyText)).toBeInTheDocument();
    });
  });
});
