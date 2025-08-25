import { CalloutTypes } from "@/components/njwds-extended/callout/calloutHelpers";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { render, screen } from "@testing-library/react";

const Config = getMergedConfig();

const CALLOUT_TYPES: CalloutTypes[] = ["informational", "conditional", "warning", "quickReference"];
const BODY_TEXT = "Some Body Text";

const TEST_DATA = {
  phone: "123-456-7890",
  email: "test@example.com",
  amount: "$199.99 Fee",
  filingType: "Business Registration Form",
  frequency: "Every Quarter",
  customHeader: "Custom Header Text",
  mixedData: {
    amount: "$150.00 Annual Fee",
    filingType: "Registration Certificate",
    phone: "555-123-4567",
    email: "support@example.org",
  },
};

const getHeaderText = (calloutType: CalloutTypes): string => {
  if (calloutType === "informational")
    return Config.calloutDefaults.informationalHeadingDefaultText;
  if (calloutType === "quickReference")
    return Config.calloutDefaults.quickReferenceHeadingDefaultText;
  if (calloutType === "conditional") return Config.calloutDefaults.conditionalHeadingDefaultText;
  if (calloutType === "warning") return Config.calloutDefaults.warningHeadingDefaultText;
  return "";
};

describe("Callout Component", () => {
  describe.each(CALLOUT_TYPES)("Header rendering for %s callout type", (calloutType) => {
    it("should display default header text when no custom text is provided", () => {
      render(
        <LargeCallout calloutType={calloutType} showHeader={true} headerText="">
          {BODY_TEXT}
        </LargeCallout>,
      );

      const expectedText = getHeaderText(calloutType);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it("should hide header text when showHeader is false", () => {
      render(
        <LargeCallout calloutType={calloutType} showHeader={false} headerText="">
          {BODY_TEXT}
        </LargeCallout>,
      );

      const expectedText = getHeaderText(calloutType);
      expect(screen.queryByText(expectedText)).not.toBeInTheDocument();
    });

    it("should display custom header text instead of default text", () => {
      render(
        <LargeCallout
          calloutType={calloutType}
          showHeader={true}
          headerText={TEST_DATA.customHeader}
        >
          {BODY_TEXT}
        </LargeCallout>,
      );

      const defaultText = getHeaderText(calloutType);
      expect(screen.queryByText(defaultText)).not.toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.customHeader)).toBeInTheDocument();
    });
  });

  describe("quickReference icon text and links", () => {
    it("should not display any links when no icon text is provided", () => {
      render(<LargeCallout calloutType="quickReference">{BODY_TEXT}</LargeCallout>);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should render phone links with correct href format", () => {
      render(
        <LargeCallout calloutType="quickReference" phoneIconText={TEST_DATA.phone}>
          {BODY_TEXT}
        </LargeCallout>,
      );

      const phoneLink = screen.getByRole("link", { name: TEST_DATA.phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${TEST_DATA.phone}`);
    });

    it("should render email links with correct href format", () => {
      render(
        <LargeCallout calloutType="quickReference" emailIconText={TEST_DATA.email}>
          {BODY_TEXT}
        </LargeCallout>,
      );

      const emailLink = screen.getByRole("link", { name: TEST_DATA.email });
      expect(emailLink).toHaveAttribute("href", `mailto:${TEST_DATA.email}`);
    });

    it("should display phone and email links together when both are provided", () => {
      render(
        <LargeCallout
          calloutType="quickReference"
          phoneIconText={TEST_DATA.phone}
          emailIconText={TEST_DATA.email}
        >
          {BODY_TEXT}
        </LargeCallout>,
      );

      const phoneLink = screen.getByRole("link", { name: TEST_DATA.phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${TEST_DATA.phone}`);

      const emailLink = screen.getByRole("link", { name: TEST_DATA.email });
      expect(emailLink).toHaveAttribute("href", `mailto:${TEST_DATA.email}`);
    });

    it("should display text-based icons with correct content", () => {
      render(
        <LargeCallout
          calloutType="quickReference"
          amountIconText={TEST_DATA.amount}
          filingTypeIconText={TEST_DATA.filingType}
          frequencyIconText={TEST_DATA.frequency}
        >
          {BODY_TEXT}
        </LargeCallout>,
      );

      expect(screen.getByText(TEST_DATA.amount)).toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.filingType)).toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.frequency)).toBeInTheDocument();
    });

    it("should render a combination of all icon types correctly", () => {
      const { amount, filingType, phone, email } = TEST_DATA.mixedData;

      render(
        <LargeCallout
          calloutType="quickReference"
          amountIconText={amount}
          filingTypeIconText={filingType}
          phoneIconText={phone}
          emailIconText={email}
        >
          {BODY_TEXT}
        </LargeCallout>,
      );

      expect(screen.getByText(amount)).toBeInTheDocument();
      expect(screen.getByText(filingType)).toBeInTheDocument();

      const phoneLink = screen.getByRole("link", { name: phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${phone}`);

      const emailLink = screen.getByRole("link", { name: email });
      expect(emailLink).toHaveAttribute("href", `mailto:${email}`);
    });

    it("should render a combination of all icon types correctly without needing body text", () => {
      const { amount, filingType, phone, email } = TEST_DATA.mixedData;

      render(
        <LargeCallout
          calloutType="quickReference"
          amountIconText={amount}
          filingTypeIconText={filingType}
          phoneIconText={phone}
          emailIconText={email}
          showHeader
          headerText="soemthing"
        />,
      );

      expect(screen.getByText(amount)).toBeInTheDocument();
      expect(screen.getByText(filingType)).toBeInTheDocument();

      const phoneLink = screen.getByRole("link", { name: phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${phone}`);

      const emailLink = screen.getByRole("link", { name: email });
      expect(emailLink).toHaveAttribute("href", `mailto:${email}`);
    });
  });
});
