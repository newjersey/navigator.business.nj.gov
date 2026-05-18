import { ContactInformationTab } from "@/components/profile/ContactInformationTab";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

const Config = getMergedConfig();

describe("ContactInformationTab", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    const profileData = generateProfileData({});
    useMockBusiness(generateBusiness({ profileData }));
  });

  const renderComponent = ({
    clearGovDeliveryError,
  }: {
    clearGovDeliveryError: () => void;
  }): void => {
    const profileData = generateProfileData({});

    render(
      <WithStatefulProfileData initialData={profileData}>
        <ContactInformationTab clearGovDeliveryError={clearGovDeliveryError} />
      </WithStatefulProfileData>,
    );
  };

  describe("clearGovDeliveryError prop", () => {
    it("calls clearGovDeliveryError when email field changes", () => {
      const mockClearGovDeliveryError = jest.fn();
      renderComponent({ clearGovDeliveryError: mockClearGovDeliveryError });

      const emailField = screen.getByLabelText(Config.selfRegistration.emailFieldLabel);
      fireEvent.change(emailField, { target: { value: "new@example.com" } });

      expect(mockClearGovDeliveryError).toHaveBeenCalled();
    });

    it("calls clearGovDeliveryError when receiveNewsletter checkbox changes", () => {
      const mockClearGovDeliveryError = jest.fn();
      renderComponent({ clearGovDeliveryError: mockClearGovDeliveryError });

      const newsletterCheckbox = screen.getByRole("checkbox", { name: /newsletter/i });
      fireEvent.click(newsletterCheckbox);

      expect(mockClearGovDeliveryError).toHaveBeenCalled();
    });
  });

  describe("newsletter warning banners", () => {
    it("does not render newsletter-subscribe-warning banner", () => {
      renderComponent({ clearGovDeliveryError: jest.fn() });
      expect(screen.queryByTestId("newsletter-subscribe-warning")).not.toBeInTheDocument();
    });

    it("does not render newsletter-unsubscribe-warning banner", () => {
      renderComponent({ clearGovDeliveryError: jest.fn() });
      expect(screen.queryByTestId("newsletter-unsubscribe-warning")).not.toBeInTheDocument();
    });
  });
});
