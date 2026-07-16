import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { NewsletterSignupPage } from "./NewsletterSignupPage";

const { newsletterSignup } = getApplicationMessages({ locale: "en-US" });

describe("NewsletterSignupPage", () => {
  it("renders the page heading", () => {
    render(<NewsletterSignupPage locale="en-US" />);

    expect(
      screen.getByRole("heading", { level: 1, name: newsletterSignup.title }),
    ).toBeInTheDocument();
  });

  it("mounts the GovDelivery signup form", () => {
    render(<NewsletterSignupPage locale="en-US" />);

    expect(document.querySelector('script[data-signup-id="31933"]')).not.toBeNull();
  });

  it("wraps the signup form in a card", () => {
    const { container } = render(<NewsletterSignupPage locale="en-US" />);

    const card = container.querySelector(".usa-card__container");
    expect(card).not.toBeNull();
    expect(card?.querySelector('script[data-signup-id="31933"]')).not.toBeNull();
  });
});
