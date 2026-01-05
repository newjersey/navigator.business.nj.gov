import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";
import * as api from "@/lib/api-client/apiClient";
import { useMockConfig } from "@/test/mock/mockUseConfig";
import { CigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { formatUTCDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({
  cigaretteLicenseConfirmPayment: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe("<ConfirmationPage />", () => {
  beforeEach(() => {
    useMockConfig();
  });

  const mockCigaretteLicenseData: CigaretteLicenseData = {
    paymentInfo: {
      token: "12345",
      orderId: 12345,
      orderTimestamp: "2024-01-15T10:30:00Z",
      confirmationEmailsent: true,
    },
    businessName: "Mock Success Business",
    responsibleOwnerName: "John Doe",
    tradeName: "Test Trade Name",
    addressLine1: "123 Main St",
    addressLine2: "Suite 100",
    addressCity: "Newark",
    addressState: { name: "New Jersey", shortCode: "NJ" },
    addressZipCode: "07102",
    mailingAddressLine1: "456 Oak Ave",
    mailingAddressLine2: "Apt 2B",
    mailingAddressCity: "Baltimore",
    mailingAddressState: { name: "Maryland", shortCode: "MD" },
    mailingAddressZipCode: "21210",
    contactName: "Jane Smith",
    contactPhoneNumber: "555-123-4567",
    contactEmail: "mock-success@test.com",
    salesInfoStartDate: "2024-02-01T00:00:00Z",
    salesInfoSupplier: ["Supplier A", "Supplier B", "Supplier C"],
  };

  const mockFailCigaretteLicenseData: CigaretteLicenseData = {
    paymentInfo: {
      token: "12345",
      confirmationEmailsent: false,
    },
    businessName: "Mock Fail Business",
    responsibleOwnerName: "John Doe",
    tradeName: "Test Trade Name",
    addressLine1: "123 Main St",
    addressLine2: "Suite 100",
    addressCity: "Newark",
    addressState: { name: "New Jersey", shortCode: "NJ" },
    addressZipCode: "07102",
    mailingAddressLine1: "456 Oak Ave",
    mailingAddressLine2: "Apt 2B",
    mailingAddressCity: "Baltimore",
    mailingAddressState: { name: "Maryland", shortCode: "MD" },
    mailingAddressZipCode: "21210",
    contactName: "Jane Smith",
    contactPhoneNumber: "555-123-4567",
    contactEmail: "mock-fail@test.com",
    salesInfoStartDate: "2024-02-01T00:00:00Z",
    salesInfoSupplier: ["Supplier A", "Supplier B", "Supplier C"],
  };

  const mockBusiness: Business = generateBusiness({
    cigaretteLicenseData: mockCigaretteLicenseData,
  });

  beforeEach(() => {
    const userData: UserData = generateUserDataForBusiness(mockBusiness);
    mockApi.cigaretteLicenseConfirmPayment.mockResolvedValue(userData);
  });

  const renderComponent = (business?: Business): void => {
    render(
      <ConfirmationPage
        business={business || generateBusiness({ cigaretteLicenseData: mockCigaretteLicenseData })}
      />,
    );
  };

  describe("Basic rendering", () => {
    it("renders the confirmation page", async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByTestId("cig-license-confirmation-page")).toBeInTheDocument();
      });
    });

    it("displays the success header and info", async () => {
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.paymentSuccessfulHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.paymentSuccessfulInfo),
        ).toBeInTheDocument();
      });
    });

    it("displays what happens next header and content", async () => {
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextInfo),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextBullet1),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextBullet2),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Payment information section", () => {
    it("displays confirmation number", async () => {
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.confirmationNumber),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.paymentInfo!.orderId!.toString()),
        ).toBeInTheDocument();
      });
    });

    it("displays date submitted", async () => {
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.dateSubmitted),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(formatUTCDate(mockCigaretteLicenseData!.paymentInfo!.orderTimestamp!)),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Licensee information section", () => {
    it("displays submission details header", async () => {
      renderComponent();
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.submissionDetails),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.licenseeInformationHeader),
        ).toBeInTheDocument();
      });
    });

    it("displays business name for applicable legal structures", async () => {
      const business: Business = generateBusiness({
        profileData: {
          ...emptyProfileData,
          legalStructureId: "limited-liability-company",
        },
        cigaretteLicenseData: mockCigaretteLicenseData,
      });
      render(<ConfirmationPage business={business} />);

      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.businessName.default.header),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.businessName!)).toBeInTheDocument();
      });
    });

    it("displays responsible owner name and trade name for non-applicable legal structures", async () => {
      const business: Business = generateBusiness({
        profileData: {
          ...emptyProfileData,
          legalStructureId: "sole-proprietorship",
        },
        cigaretteLicenseData: mockCigaretteLicenseData,
      });
      render(<ConfirmationPage business={business} />);

      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.responsibleOwnerName.default.header),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.responsibleOwnerName!),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.profileDefaults.fields.tradeName.default.header),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.tradeName!)).toBeInTheDocument();
      });
    });
  });

  describe("Business address section", () => {
    it("displays business address header and all address fields", async () => {
      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.businessAddressHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.businessAddressLine1),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.addressLine1!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.businessAddressLine2),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.addressLine2!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.addressCity!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.addressState!.shortCode!),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.addressZipCode!)).toBeInTheDocument();
      });
    });
  });

  describe("Mailing address section", () => {
    it("displays mailing address header and all address fields", async () => {
      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.mailingAddressHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.mailingAddressLine1),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.mailingAddressLine1!),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.mailingAddressLine2),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.mailingAddressLine2!),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.mailingAddressCity!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.addressState!.shortCode!),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.mailingAddressZipCode!),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Contact information section", () => {
    it("displays contact information header and all contact fields", async () => {
      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.contactInformationHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.label),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.contactName!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactPhoneNumber.label),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.contactPhoneNumber!)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.label),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(mockCigaretteLicenseData!.contactEmail!)).toBeInTheDocument();
      });
    });
  });

  describe("Sales information section", () => {
    it("displays sales information header and fields", async () => {
      renderComponent();

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep3.salesInformationHeader),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep3.fields.startDateOfSales.label),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(formatUTCDate(mockCigaretteLicenseData!.salesInfoStartDate!)),
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText(Config.cigaretteLicenseConfirmation.suppliers)).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.getByText(mockCigaretteLicenseData!.salesInfoSupplier!.join(", ")),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Try again page", () => {
    const mockFailBusiness: Business = generateBusiness({
      cigaretteLicenseData: mockFailCigaretteLicenseData,
    });
    const userData: UserData = generateUserDataForBusiness(mockFailBusiness);

    beforeEach(() => {
      mockApi.cigaretteLicenseConfirmPayment.mockResolvedValue(userData);
    });

    it("displays try again page when email confirmatin is not sent", async () => {
      renderComponent(mockFailBusiness);

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseConfirmation.cantCompleteFilingAlert),
        ).toBeInTheDocument();
      });
    });

    it("get order details api call is made when Try Again Button is clicked", async () => {
      renderComponent(mockFailBusiness);

      await waitFor(() => {
        expect(mockApi.cigaretteLicenseConfirmPayment).toHaveBeenCalledTimes(2);
      });

      const button = await screen.findByRole("button", { name: /try again/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockApi.cigaretteLicenseConfirmPayment).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe("Loading spinner", () => {
    const mockFailBusiness: Business = generateBusiness({
      cigaretteLicenseData: mockFailCigaretteLicenseData,
    });
    const userData: UserData = generateUserDataForBusiness(mockFailBusiness);

    beforeEach(() => {
      mockApi.cigaretteLicenseConfirmPayment.mockResolvedValue(userData);
    });

    it("is displayed on initial load of confirmation page", async () => {
      renderComponent(mockFailBusiness);

      await waitFor(() => {
        expect(screen.getByLabelText("loading indicator")).toBeInTheDocument();
      });
    });
  });
});
