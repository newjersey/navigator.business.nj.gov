import { ContactTabPanel } from "@/components/profile/ContactTabPanel";
import { WithStatefulProfileData } from "@/test/mock/withStatefulProfileData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";
import { render, screen } from "@testing-library/react";
import React from "react";

jest.mock("@/components/profile/ProfileTabHeader", () => ({
  ProfileTabHeader: (() => <div data-testid="profile-tab-header" />) as React.FC,
}));

jest.mock("@/components/profile/ContactInformationTab", () => ({
  ContactInformationTab: (({ clearGovDeliveryError }: { clearGovDeliveryError?: () => void }) => (
    <div data-testid="contact-information-tab">
      {clearGovDeliveryError && (
        <button onClick={clearGovDeliveryError}>Clear GovDelivery Error</button>
      )}
    </div>
  )) as React.FC<{ clearGovDeliveryError?: () => void }>,
}));

const Config = getMergedConfig();

type GovDeliveryErrorType = "SUBSCRIBE_FAILED" | "UNSUBSCRIBE_FAILED" | "EMAIL_UPDATE_FAILED";

const renderComponent = ({
  fieldErrors,
  govDeliveryError,
}: {
  fieldErrors: string[];
  govDeliveryError: GovDeliveryErrorType | null;
}): void => {
  const profileData = generateProfileData({});
  const mockClearGovDeliveryError = jest.fn();

  render(
    <WithStatefulProfileData initialData={profileData}>
      <ContactTabPanel
        fieldErrors={fieldErrors}
        govDeliveryError={govDeliveryError}
        clearGovDeliveryError={mockClearGovDeliveryError}
      />
    </WithStatefulProfileData>,
  );
};

describe("ContactTabPanel", () => {
  it("renders the tab panel with correct attributes", () => {
    renderComponent({ fieldErrors: [], govDeliveryError: null });
    const tabPanel = screen.getByRole("tabpanel");
    expect(tabPanel).toHaveAttribute("id", "tabpanel-contact");
  });

  it("renders the ProfileTabHeader", () => {
    renderComponent({ fieldErrors: [], govDeliveryError: null });
    expect(screen.getByTestId("profile-tab-header")).toBeInTheDocument();
  });

  it("renders the ContactInformationTab", () => {
    renderComponent({ fieldErrors: [], govDeliveryError: null });
    expect(screen.getByTestId("contact-information-tab")).toBeInTheDocument();
  });

  describe("field errors", () => {
    it("renders field error Alert when fieldErrors contains contact fields", () => {
      renderComponent({ fieldErrors: ["name", "email"], govDeliveryError: null });
      expect(
        screen.getByText(/review your information in the fields marked below/i),
      ).toBeInTheDocument();
      expect(screen.getByText(Config.selfRegistration.nameFieldLabel)).toBeInTheDocument();
      expect(screen.getByText(Config.selfRegistration.emailFieldLabel)).toBeInTheDocument();
    });

    it("does not render error Alert when fieldErrors is empty", () => {
      renderComponent({ fieldErrors: [], govDeliveryError: null });
      expect(
        screen.queryByText(/review your information in the fields marked below/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("govDeliveryError prop", () => {
    it("renders subscribe error Alert when govDeliveryError is SUBSCRIBE_FAILED", () => {
      renderComponent({ fieldErrors: [], govDeliveryError: "SUBSCRIBE_FAILED" });
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterSubscribeError),
      ).toBeInTheDocument();
    });

    it("renders unsubscribe error Alert when govDeliveryError is UNSUBSCRIBE_FAILED", () => {
      renderComponent({ fieldErrors: [], govDeliveryError: "UNSUBSCRIBE_FAILED" });
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterUnsubscribeError),
      ).toBeInTheDocument();
    });

    it("renders email update error Alert when govDeliveryError is EMAIL_UPDATE_FAILED", () => {
      renderComponent({ fieldErrors: [], govDeliveryError: "EMAIL_UPDATE_FAILED" });
      expect(
        screen.getByText(Config.profileDefaults.default.newsletterEmailUpdateError),
      ).toBeInTheDocument();
    });

    it("renders nothing for govDeliveryError when null", () => {
      renderComponent({ fieldErrors: [], govDeliveryError: null });
      expect(
        screen.queryByText(Config.profileDefaults.default.newsletterSubscribeError),
      ).not.toBeInTheDocument();
    });
  });
});
