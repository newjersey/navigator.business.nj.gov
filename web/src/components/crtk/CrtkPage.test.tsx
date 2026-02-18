import { CrtkPage } from "@/components/crtk/CrtkPage";
import * as api from "@/lib/api-client/apiClient";
import { generateTask } from "@/test/factories";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { CrtkData } from "@businessnjgovnavigator/shared/crtk";
import { getCurrentDateISOString } from "@businessnjgovnavigator/shared/dateHelpers";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import type { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({
  searchBuisnessInCrtkDB: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("<CrtkPage />", () => {
  const generateCrtkData = (overrides?: Partial<CrtkData>): CrtkData => ({
    lastUpdatedISO: "2025-01-15T10:30:00.000Z",
    crtkBusinessDetails: {
      businessName: "M&U INTERNATIONAL LLC",
      addressLine1: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      addressZipCode: "08876",
      ein: "273265170",
    },
    crtkSearchResult: "FOUND",
    crtkEntry: {
      businessName: "M&U INTERNATIONAL LLC",
      streetAddress: "31 READINGTON RD",
      city: "BRANCHBURG TWP",
      state: "NJ",
      zipCode: "08876",
      ein: "273265170",
      facilityId: "00000080331",
      naicsCode: "424690",
      naicsDescription: "Other Chemical and Allied Products Merchant Wholesalers",
      businessActivity: "RAW MATERIAL RECEIVING, STORAGE AND DISTRIBUTION",
      type: "REGULATED",
      status: "ACTIVE",
      eligibility: "CRTK/RPPR",
      receivedDate: "2025-03-11T20:27:35.000Z",
    },
    ...overrides,
  });

  const renderWithBusinessData = (business?: Partial<Business>): void => {
    render(
      <WithStatefulUserData
        initialUserData={generateUserDataForBusiness(
          generateBusiness({
            ...business,
          }),
        )}
      >
        <CrtkPage task={generateTask({ id: "crtk-registration" })} />
      </WithStatefulUserData>,
    );
  };

  const fillOutSearchForm = (
    businessName: string,
    streetAddress: string,
    city: string,
    zip: string,
    ein?: string,
  ): void => {
    fireEvent.change(screen.getByTestId("business-name"), {
      target: { value: businessName },
    });
    fireEvent.change(screen.getByTestId("business-street-address"), {
      target: { value: streetAddress },
    });
    fireEvent.change(screen.getByTestId("city"), {
      target: { value: city },
    });
    fireEvent.change(screen.getByTestId("zip"), {
      target: { value: zip },
    });
    if (ein) {
      fireEvent.change(screen.getByTestId("ein"), {
        target: { value: ein },
      });
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
    // React 19: Use real timers to avoid conflicts with async waitFor in findBy* queries
    jest.useRealTimers();
  });

  describe("initial render", () => {
    it("renders the task header", () => {
      const task = generateTask({ id: "crtk-registration", name: "CRTK Registration" });
      render(
        <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness({}))}>
          <CrtkPage task={task} />
        </WithStatefulUserData>,
      );
      expect(screen.getByText("CRTK Registration")).toBeInTheDocument();
    });

    it("displays the search form when no CRTK data exists", () => {
      renderWithBusinessData();
      // Form elements should be present
      expect(screen.getByTestId("business-name")).toBeInTheDocument();
      expect(screen.getByTestId("business-street-address")).toBeInTheDocument();
      expect(screen.getByTestId("city")).toBeInTheDocument();
      expect(screen.getByTestId("zip")).toBeInTheDocument();
      expect(screen.getByTestId("ein")).toBeInTheDocument();
      expect(screen.getByTestId("crtk-submit")).toBeInTheDocument();
    });

    it("displays the search results when CRTK data exists", async () => {
      renderWithBusinessData({
        crtkData: generateCrtkData(),
      });
      // React 19: Wait for async rendering to complete
      expect(await screen.findByText("M&U INTERNATIONAL LLC")).toBeInTheDocument();
      expect(screen.getByText(/31 READINGTON RD/)).toBeInTheDocument();
    });

    it("displays the not found flow when crtkSearchResult is NOT_FOUND", () => {
      renderWithBusinessData({
        crtkData: {
          crtkSearchResult: "NOT_FOUND",
          lastUpdatedISO: getCurrentDateISOString(),
          crtkEntry: {},
        },
      });
      expect(screen.getByTestId("crtk-not-found")).toBeInTheDocument();
    });
  });

  describe("search functionality", () => {
    const mockSuccessfulResponse = generateUserDataForBusiness(
      generateBusiness({
        crtkData: generateCrtkData(),
      }),
    );

    const mockNotFoundResponse = generateUserDataForBusiness(
      generateBusiness({
        crtkData: generateCrtkData({
          crtkSearchResult: "NOT_FOUND",
          crtkEntry: {},
        }),
      }),
    );

    it("submits the form and displays results on successful search", async () => {
      mockApi.searchBuisnessInCrtkDB.mockResolvedValue(mockSuccessfulResponse);

      renderWithBusinessData();

      fillOutSearchForm(
        "M&U INTERNATIONAL LLC",
        "31 READINGTON RD",
        "BRANCHBURG TWP",
        "08876",
        "273265170",
      );

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(screen.getByText("M&U INTERNATIONAL LLC")).toBeInTheDocument();
      });

      expect(screen.getByText(/31 READINGTON RD/)).toBeInTheDocument();
    });

    it("displays the not found flow when the business is not in CRTK database", async () => {
      mockApi.searchBuisnessInCrtkDB.mockResolvedValue(mockNotFoundResponse);
      renderWithBusinessData();
      fillOutSearchForm("Nonexistent Business", "123 Fake St", "Some City", "12345");
      fireEvent.click(screen.getByTestId("crtk-submit"));
      await waitFor(() => {
        expect(screen.getByTestId("crtk-not-found")).toBeInTheDocument();
      });
    });

    it("displays SEARCH_FAILED error when API call fails", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockApi.searchBuisnessInCrtkDB.mockRejectedValue(new Error("API Error"));

      renderWithBusinessData();

      fillOutSearchForm("Test Business", "123 Test St", "Test City", "12345");

      fireEvent.click(screen.getByTestId("crtk-submit"));

      // Wait for the API call to complete
      await waitFor(() => {
        expect(mockApi.searchBuisnessInCrtkDB).toHaveBeenCalled();
      });

      // Wait for error to appear
      await waitFor(
        () => {
          expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      consoleErrorSpy.mockRestore();
    });

    it("displays field validation errors when required fields are empty", async () => {
      renderWithBusinessData({
        formationData: undefined,
      });

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(screen.getByTestId("error-alert-FIELDS_REQUIRED")).toBeInTheDocument();
      });
    });

    it("validates zip code format", async () => {
      renderWithBusinessData();

      fillOutSearchForm("Test Business", "123 Test St", "Test City", "123"); // Invalid zip

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(screen.getByText("Enter a valid 5-digit zip code.")).toBeInTheDocument();
      });
    });

    it("submits form without EIN when EIN is not provided", async () => {
      mockApi.searchBuisnessInCrtkDB.mockResolvedValue(mockSuccessfulResponse);

      renderWithBusinessData();

      fillOutSearchForm("M&U INTERNATIONAL LLC", "31 READINGTON RD", "BRANCHBURG TWP", "08876");

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(mockApi.searchBuisnessInCrtkDB).toHaveBeenCalledWith({
          businessName: "M&U INTERNATIONAL LLC",
          addressLine1: "31 READINGTON RD",
          city: "BRANCHBURG TWP",
          addressZipCode: "08876",
          ein: undefined,
        });
      });
    });

    it("includes EIN in API call when provided", async () => {
      mockApi.searchBuisnessInCrtkDB.mockResolvedValue(mockSuccessfulResponse);

      renderWithBusinessData();

      fillOutSearchForm(
        "M&U INTERNATIONAL LLC",
        "31 READINGTON RD",
        "BRANCHBURG TWP",
        "08876",
        "273265170",
      );

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(mockApi.searchBuisnessInCrtkDB).toHaveBeenCalledWith({
          businessName: "M&U INTERNATIONAL LLC",
          addressLine1: "31 READINGTON RD",
          city: "BRANCHBURG TWP",
          addressZipCode: "08876",
          ein: "273265170",
        });
      });
    });
  });

  describe("search again functionality", () => {
    it("returns to search form when 'Search Again' button is clicked", async () => {
      renderWithBusinessData({
        crtkData: generateCrtkData({
          crtkSearchResult: "NOT_FOUND",
          crtkEntry: {},
        }),
      });

      // React 19: Wait for async rendering to complete before interacting
      expect(await screen.findByTestId("crtk-not-found")).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("crtk-search-again"));

      await waitFor(() => {
        expect(screen.getByTestId("business-name")).toBeInTheDocument();
      });
      expect(screen.getByTestId("crtk-submit")).toBeInTheDocument();
    });

    it("clears search error when searching again after an error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      mockApi.searchBuisnessInCrtkDB.mockRejectedValueOnce(new Error("API Error"));

      renderWithBusinessData();

      fillOutSearchForm("Test Business", "123 Test St", "Test City", "12345");

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(
        () => {
          expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
        },
        { timeout: 2000 },
      );

      mockApi.searchBuisnessInCrtkDB.mockResolvedValue(
        generateUserDataForBusiness(
          generateBusiness({
            crtkData: generateCrtkData(),
          }),
        ),
      );

      fillOutSearchForm("M&U INTERNATIONAL LLC", "31 READINGTON RD", "BRANCHBURG TWP", "08876");

      fireEvent.click(screen.getByTestId("crtk-submit"));

      await waitFor(() => {
        expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("M&U INTERNATIONAL LLC")).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe("result display", () => {
    it("displays FOUND status with facility details", async () => {
      renderWithBusinessData({
        crtkData: generateCrtkData(),
      });

      // React 19: Wait for async rendering to complete
      expect(await screen.findByText("Business Found")).toBeInTheDocument();
      expect(screen.getByText("M&U INTERNATIONAL LLC")).toBeInTheDocument();
      expect(screen.getByText(/REGULATED/)).toBeInTheDocument();
      expect(screen.getByText(/ACTIVE/)).toBeInTheDocument();
      expect(screen.getByText(/CRTK\/RPPR/)).toBeInTheDocument();
    });

    it("displays NOT_FOUND status with appropriate message", async () => {
      renderWithBusinessData({
        crtkData: generateCrtkData({
          crtkSearchResult: "NOT_FOUND",
          crtkEntry: {},
        }),
      });

      // React 19: Wait for async rendering to complete
      expect(await screen.findByTestId("crtk-not-found")).toBeInTheDocument();
      expect(screen.getByText(/I have registered my business/)).toBeInTheDocument();
    });
  });

  describe("data persistence", () => {
    it("displays existing CRTK data on component mount", async () => {
      const existingData = generateCrtkData({
        crtkBusinessDetails: {
          businessName: "Existing Business",
          addressLine1: "456 Existing St",
          city: "Existing City",
          addressZipCode: "54321",
        },
        crtkEntry: {
          businessName: "Existing Business",
          facilityId: "12345",
          status: "ACTIVE",
        },
      });

      renderWithBusinessData({
        crtkData: existingData,
      });

      // React 19: Wait for async rendering to complete
      expect(await screen.findByText("Existing Business")).toBeInTheDocument();
      expect(screen.getByText(/456 Existing St/)).toBeInTheDocument();
    });

    it("does not display search form when CRTK data exists", async () => {
      renderWithBusinessData({
        crtkData: generateCrtkData(),
      });

      // React 19: Wait for async rendering to complete before checking
      await waitFor(() => {
        expect(screen.queryByTestId("crtk-submit")).not.toBeInTheDocument();
      });

      expect(await screen.findByText("M&U INTERNATIONAL LLC")).toBeInTheDocument();
    });
  });
});
