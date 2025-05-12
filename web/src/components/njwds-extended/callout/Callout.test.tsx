import { Callout, CalloutTypes } from "@/components/njwds-extended/callout/Callout";
import { getMergedConfig } from "@/contexts/configContext";
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
        <Callout calloutType={calloutType} showHeader={true} headerText="">
          {BODY_TEXT}
        </Callout>,
      );

      const expectedText = getHeaderText(calloutType);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it("should hide header text when showHeader is false", () => {
      render(
        <Callout calloutType={calloutType} showHeader={false} headerText="">
          {BODY_TEXT}
        </Callout>,
      );

      const expectedText = getHeaderText(calloutType);
      expect(screen.queryByText(expectedText)).not.toBeInTheDocument();
    });

    it("should display custom header text instead of default text", () => {
      render(
        <Callout calloutType={calloutType} showHeader={true} headerText={TEST_DATA.customHeader}>
          {BODY_TEXT}
        </Callout>,
      );

      const defaultText = getHeaderText(calloutType);
      expect(screen.queryByText(defaultText)).not.toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.customHeader)).toBeInTheDocument();
    });

    it("should not display icon when showIcon is false", () => {
      render(
        <Callout calloutType={calloutType} showIcon={false}>
          {BODY_TEXT}
        </Callout>,
      );

      expect(screen.queryByTestId("callout-icon")).not.toBeInTheDocument();
    });
  });

  describe("quickReference icon text and links", () => {
    it("should not display any links when no icon text is provided", () => {
      render(<Callout calloutType="quickReference">{BODY_TEXT}</Callout>);

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("should render phone links with correct href format", () => {
      render(
        <Callout calloutType="quickReference" phoneIconText={TEST_DATA.phone}>
          {BODY_TEXT}
        </Callout>,
      );

      const phoneLink = screen.getByRole("link", { name: TEST_DATA.phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${TEST_DATA.phone}`);
    });

    it("should render email links with correct href format", () => {
      render(
        <Callout calloutType="quickReference" emailIconText={TEST_DATA.email}>
          {BODY_TEXT}
        </Callout>,
      );

      const emailLink = screen.getByRole("link", { name: TEST_DATA.email });
      expect(emailLink).toHaveAttribute("href", `mailto:${TEST_DATA.email}`);
    });

    it("should display phone and email links together when both are provided", () => {
      render(
        <Callout
          calloutType="quickReference"
          phoneIconText={TEST_DATA.phone}
          emailIconText={TEST_DATA.email}
        >
          {BODY_TEXT}
        </Callout>,
      );

      const phoneLink = screen.getByRole("link", { name: TEST_DATA.phone });
      expect(phoneLink).toHaveAttribute("href", `tel:${TEST_DATA.phone}`);

      const emailLink = screen.getByRole("link", { name: TEST_DATA.email });
      expect(emailLink).toHaveAttribute("href", `mailto:${TEST_DATA.email}`);
    });

    it("should display text-based icons with correct content", () => {
      render(
        <Callout
          calloutType="quickReference"
          amountIconText={TEST_DATA.amount}
          filingTypeIconText={TEST_DATA.filingType}
          frequencyIconText={TEST_DATA.frequency}
        >
          {BODY_TEXT}
        </Callout>,
      );

      expect(screen.getByText(TEST_DATA.amount)).toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.filingType)).toBeInTheDocument();
      expect(screen.getByText(TEST_DATA.frequency)).toBeInTheDocument();
    });

    it("should render a combination of all icon types correctly", () => {
      const { amount, filingType, phone, email } = TEST_DATA.mixedData;

      render(
        <Callout
          calloutType="quickReference"
          amountIconText={amount}
          filingTypeIconText={filingType}
          phoneIconText={phone}
          emailIconText={email}
        >
          {BODY_TEXT}
        </Callout>,
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
