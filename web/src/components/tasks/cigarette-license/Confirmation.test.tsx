import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";
import { getMergedConfig } from "@/contexts/configContext";
import { CigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { generateBusiness } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { render, screen } from "@testing-library/react";
import { formatUTCDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";

const Config = getMergedConfig();

describe("<ConfirmationPage />", () => {
  const mockCigaretteLicenseData: CigaretteLicenseData = {
    paymentInfo: {
      orderId: 12345,
      orderTimestamp: "2024-01-15T10:30:00Z",
    },
    businessName: "Test Business LLC",
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
    contactEmail: "contact@testbusiness.com",
    salesInfoStartDate: "2024-02-01T00:00:00Z",
    salesInfoSupplier: ["Supplier A", "Supplier B", "Supplier C"],
  };

  const renderComponent = (business?: Business): void => {
    render(
      <ConfirmationPage
        business={business || generateBusiness({ cigaretteLicenseData: mockCigaretteLicenseData })}
      />,
    );
  };

  describe("Basic rendering", () => {
    it("renders the confirmation page", () => {
      renderComponent();
      expect(screen.getByTestId("cig-license-confirmation-page")).toBeInTheDocument();
    });

    it("displays the success header and info", () => {
      renderComponent();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.paymentSuccessfulHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.paymentSuccessfulInfo),
      ).toBeInTheDocument();
    });

    it("displays what happens next header and content", () => {
      renderComponent();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextInfo),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextBullet1),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.whatHappensNextBullet2),
      ).toBeInTheDocument();
    });
  });

  describe("Payment information section", () => {
    it("displays confirmation number", () => {
      renderComponent();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.confirmationNumber),
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockCigaretteLicenseData!.paymentInfo!.orderId!.toString()),
      ).toBeInTheDocument();
    });

    it("displays date submitted", () => {
      renderComponent();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.dateSubmitted),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatUTCDate(mockCigaretteLicenseData!.paymentInfo!.orderTimestamp!)),
      ).toBeInTheDocument();
    });
  });

  describe("Licensee information section", () => {
    it("displays submission details header", () => {
      renderComponent();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.submissionDetails),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.licenseeInformationHeader),
      ).toBeInTheDocument();
    });

    it("displays business name for applicable legal structures", () => {
      const business: Business = generateBusiness({
        profileData: {
          ...emptyProfileData,
          legalStructureId: "limited-liability-company",
        },
        cigaretteLicenseData: mockCigaretteLicenseData,
      });
      render(<ConfirmationPage business={business} />);

      expect(
        screen.getByText(Config.profileDefaults.fields.businessName.default.header),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.businessName!)).toBeInTheDocument();
    });

    it("displays responsible owner name and trade name for non-applicable legal structures", () => {
      const business: Business = generateBusiness({
        profileData: {
          ...emptyProfileData,
          legalStructureId: "sole-proprietorship",
        },
        cigaretteLicenseData: mockCigaretteLicenseData,
      });
      render(<ConfirmationPage business={business} />);

      expect(
        screen.getByText(Config.profileDefaults.fields.responsibleOwnerName.default.header),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.responsibleOwnerName!)).toBeInTheDocument();
      expect(
        screen.getByText(Config.profileDefaults.fields.tradeName.default.header),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.tradeName!)).toBeInTheDocument();
    });
  });

  describe("Business address section", () => {
    it("displays business address header and all address fields", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.businessAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.businessAddressLine1),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.addressLine1!)).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.businessAddressLine2),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.addressLine2!)).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.addressCity!)).toBeInTheDocument();
      expect(
        screen.getByText(mockCigaretteLicenseData!.addressState!.shortCode!),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.addressZipCode!)).toBeInTheDocument();
    });
  });

  describe("Mailing address section", () => {
    it("displays mailing address header and all address fields", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.mailingAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.mailingAddressLine1),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.mailingAddressLine1!)).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseConfirmation.mailingAddressLine2),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.mailingAddressLine2!)).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.mailingAddressCity!)).toBeInTheDocument();
      expect(
        screen.getByText(mockCigaretteLicenseData!.addressState!.shortCode!),
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockCigaretteLicenseData!.mailingAddressZipCode!),
      ).toBeInTheDocument();
    });
  });

  describe("Contact information section", () => {
    it("displays contact information header and all contact fields", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.contactInformationHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.label),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.contactName!)).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactPhoneNumber.label),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.contactPhoneNumber!)).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.label),
      ).toBeInTheDocument();
      expect(screen.getByText(mockCigaretteLicenseData!.contactEmail!)).toBeInTheDocument();
    });
  });

  describe("Sales information section", () => {
    it("displays sales information header and fields", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep3.salesInformationHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep3.fields.startDateOfSales.label),
      ).toBeInTheDocument();
      expect(
        screen.getByText(formatUTCDate(mockCigaretteLicenseData!.salesInfoStartDate!)),
      ).toBeInTheDocument();
      expect(screen.getByText(Config.cigaretteLicenseConfirmation.suppliers)).toBeInTheDocument();
      expect(
        screen.getByText(mockCigaretteLicenseData!.salesInfoSupplier!.join(", ")),
      ).toBeInTheDocument();
    });
  });
});
