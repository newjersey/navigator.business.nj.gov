import { CRTKSearchResult } from "@/components/crtk/crtkSearchResult";
import type { CRTKData } from "@/components/crtk/crtkTypes";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

describe("<CRTKSearchResult />", () => {
  const mockOnSearchAgain = jest.fn();

  const baseCRTKData: CRTKData = {
    CRTKSearchResult: "FOUND",
    lastUpdatedISO: "2025-03-11T20:27:35.000Z",
    CRTKBusinessDetails: {
      businessName: "Spotify",
      addressLine1: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      addressZipCode: "07513",
      ein: "273265199",
    },
    CRTKEntry: {
      businessName: "Spotify",
      streetAddress: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      state: "NJ",
      zipCode: "07513",
      ein: "273265199",
      facilityId: "00000080331",
      naicsCode: "424690",
      naicsDescription: "Other Chemical and Allied Products Merchant Wholesalers",
      businessActivity: "RAW MATERIAL RECEIVING, STORAGE AND DISTRIBUTION",
      facilityType: "REGULATED",
      facilityStatus: "ACTIVE",
      eligibility: "CRTK/RPPR",
      userStatus: "USER ABOVE",
      receivedDate: "2025-03-11T20:27:35.000Z",
    },
  };

  const renderComponent = (crtkData: Partial<CRTKData> = {}): void => {
    const mergedData = {
      ...baseCRTKData,
      ...crtkData,
      CRTKEntry: {
        ...baseCRTKData.CRTKEntry,
        ...crtkData.CRTKEntry,
      },
      CRTKBusinessDetails:
        crtkData.CRTKBusinessDetails === undefined
          ? undefined
          : {
              ...baseCRTKData.CRTKBusinessDetails!,
              ...crtkData.CRTKBusinessDetails,
            },
    };

    render(
      <CRTKSearchResult
        isLoading={false}
        crtkData={mergedData}
        onSearchAgain={mockOnSearchAgain}
      />,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Business Details Display", () => {
    it("displays business name with special characters correctly", () => {
      renderComponent({
        CRTKBusinessDetails: {
          businessName: "Bob's Auto & Repair Co.",
          addressLine1: "123 Main St",
          city: "Newark",
          addressZipCode: "07102",
        },
      });
      expect(screen.getByText("Bob's Auto & Repair Co.")).toBeInTheDocument();
    });
  });

  describe("FOUND Status", () => {
    it("displays CRTK details accordion when status is FOUND", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      fireEvent.click(screen.getByText("Your CRTK Details"));
      expect(screen.getByText(/Facility Type:/)).toBeInTheDocument();
      expect(screen.getByText(/REGULATED/)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
      expect(screen.getByText(/CRTK\/RPPR/)).toBeInTheDocument();
      expect(screen.getByText(/Facility Status:/)).toBeInTheDocument();
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    });

    it("displays N/A when CRTK entry details are missing", () => {
      renderComponent({
        CRTKSearchResult: "FOUND",
        CRTKEntry: {
          facilityType: undefined,
          eligibility: undefined,
          facilityStatus: undefined,
        },
      });
      fireEvent.click(screen.getByText("Your CRTK Details"));
      const naElements = screen.getAllByText(/N\/A/);
      expect(naElements).toHaveLength(3);
    });

    it("displays N/A for individual missing fields while showing others", () => {
      renderComponent({
        CRTKSearchResult: "FOUND",
        CRTKEntry: {
          facilityType: "REGULATED",
          eligibility: undefined,
          facilityStatus: "ACTIVE",
        },
      });
      fireEvent.click(screen.getByText("Your CRTK Details"));
      expect(screen.getByText(/REGULATED/)).toBeInTheDocument();
      expect(screen.getByText(/Eligibility:/)).toBeInTheDocument();
      expect(screen.getByText(/N\/A/)).toBeInTheDocument();
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
    });

    it("displays Next Steps accordion with survey requirements for FOUND status", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(/you must complete the survey if your facility had ehs/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/complete an exemption form if any of the following are true:/i),
      ).toBeInTheDocument();
    });

    it("displays exemption criteria for FOUND status", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(screen.getByText(/your building is an administrative site only/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has no ehs/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has ehs below the threshold/i)).toBeInTheDocument();
      expect(screen.getByText(/your building has staff on-site/i)).toBeInTheDocument();
    });

    it("displays exemption note about not filling form every year", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /if crtk approves your exemption, you don't need to fill out the form every year/i,
        ),
      ).toBeInTheDocument();
    });

    it("displays survey deadline information", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /fill out the survey for each location where the chemical was stored by march 1 every year/i,
        ),
      ).toBeInTheDocument();
    });

    it("displays warning section when status is FOUND", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      expect(screen.getByText(Config.crtkTask.warningTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.crtkTask.warningText)).toBeInTheDocument();
    });
  });

  describe("NOT_FOUND Status", () => {
    it("does not display CRTK Details accordion when status is NOT_FOUND", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      expect(screen.queryByText("Your CRTK Details")).not.toBeInTheDocument();
    });

    it("displays Next Steps accordion with reasons for NOT_FOUND status", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /your business isn't in the crtk database for one of the following reasons/i,
        ),
      ).toBeInTheDocument();
    });

    it("displays all possible reasons for NOT_FOUND status", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.getByText(
          /your business is not in an industry that is likely to have environmental requirements/i,
        ),
      ).toBeInTheDocument();
      expect(screen.getByText(/your business isn't registered yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /your business is registered, but your information hasn't been processed on the crtk side/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/your business name and address don't match what is in the system/i),
      ).toBeInTheDocument();
    });

    it("does not display warning section when status is NOT_FOUND", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      expect(screen.queryByText(Config.crtkTask.warningTitle)).not.toBeInTheDocument();
    });

    it("does not display survey requirements for NOT_FOUND status", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      fireEvent.click(screen.getByText("Next Steps"));
      expect(
        screen.queryByText(/you must complete the survey if your facility had ehs/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Contact Information", () => {
    it.each([["FOUND"], ["NOT_FOUND"]])(
      "displays CRTK contact information for %s status",
      (status: string) => {
        renderComponent({ CRTKSearchResult: status as "FOUND" | "NOT_FOUND" });
        fireEvent.click(screen.getByText("Next Steps"));
        expect(
          screen.getByText(/if you have any questions, contact a crtk expert:/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/phone: \(609\) 292-6714/i)).toBeInTheDocument();
      },
    );

    it.each([["FOUND"], ["NOT_FOUND"]])(
      "displays email link with correct href for %s status",
      (status: string) => {
        renderComponent({ CRTKSearchResult: status as "FOUND" | "NOT_FOUND" });
        fireEvent.click(screen.getByText("Next Steps"));
        const emailLink = screen.getByRole("link", { name: /rts@dep.nj.gov/i });
        expect(emailLink).toHaveAttribute("href", "mailto:rts@dep.nj.gov");
      },
    );
  });

  describe("Search Again Button", () => {
    it("displays Search Again button when onSearchAgain prop is provided", () => {
      renderComponent();
      expect(screen.getByTestId("crtk-search-again")).toBeInTheDocument();
    });

    it("calls onSearchAgain callback when Search Again button is clicked", () => {
      renderComponent();
      const searchAgainButton = screen.getByTestId("crtk-search-again");
      fireEvent.click(searchAgainButton);
      expect(mockOnSearchAgain).toHaveBeenCalledTimes(1);
    });

    it("does not display Search Again button when onSearchAgain prop is not provided", () => {
      render(<CRTKSearchResult isLoading={false} crtkData={baseCRTKData} />);
      expect(screen.queryByTestId("crtk-search-again")).not.toBeInTheDocument();
    });

    it("Search Again button has correct text", () => {
      renderComponent();
      const searchAgainButton = screen.getByTestId("crtk-search-again");
      expect(searchAgainButton).toHaveTextContent("Search Again");
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

  describe("Intro Text", () => {
    it("displays intro text from config", () => {
      renderComponent();
      expect(screen.getByText(Config.crtkTask.introText)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles missing business details gracefully", () => {
      renderComponent({
        CRTKSearchResult: "NOT_FOUND",
        CRTKBusinessDetails: undefined,
      });
      expect(screen.getByText(/is not currently in the crtk database/i)).toBeInTheDocument();
    });

    it("handles empty string values in business details", () => {
      renderComponent({
        CRTKBusinessDetails: {
          businessName: "",
          addressLine1: "",
          city: "",
          addressZipCode: "",
        },
      });
      expect(screen.getByText(", , NJ")).toBeInTheDocument();
    });

    it("handles undefined values in CRTKEntry", () => {
      renderComponent({
        CRTKSearchResult: "FOUND",
        CRTKEntry: {
          facilityType: undefined,
          facilityStatus: undefined,
          eligibility: undefined,
        },
      });
      fireEvent.click(screen.getByText("Your CRTK Details"));
      const naElements = screen.getAllByText(/N\/A/);
      expect(naElements).toHaveLength(3);
    });
  });

  describe("Accordion Behavior", () => {
    it("CRTK Details accordion can be expanded", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      const accordion = screen.getByText("Your CRTK Details");
      fireEvent.click(accordion);
      expect(screen.getByText(/Facility Type:/)).toBeInTheDocument();
    });

    it("Next Steps accordion can be expanded for FOUND status", () => {
      renderComponent({ CRTKSearchResult: "FOUND" });
      const accordion = screen.getByText("Next Steps");
      fireEvent.click(accordion);
      expect(
        screen.getByText(/you must complete the survey if your facility had ehs/i),
      ).toBeInTheDocument();
    });

    it("Next Steps accordion can be expanded for NOT_FOUND status", () => {
      renderComponent({ CRTKSearchResult: "NOT_FOUND" });
      const accordion = screen.getByText("Next Steps");
      fireEvent.click(accordion);
      expect(screen.getByText(/your business isn't in the crtk database/i)).toBeInTheDocument();
    });
  });
});
