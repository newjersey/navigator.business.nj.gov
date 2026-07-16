import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import NewsletterSignupRoute, { generateMetadata } from "./page";

const { newsletterSignup } = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("builds hreflang alternates for /newsletter-signup", () => {
    const metadata = generateMetadata();
    expect(metadata.alternates?.canonical).toBe("/newsletter-signup");
  });
});

describe("NewsletterSignupRoute", () => {
  it("renders the newsletter signup page for a supported locale", async () => {
    render(
      await NewsletterSignupRoute({
        params: Promise.resolve({ locale: "en-US" }),
      }),
    );

    expect(
      screen.getByRole("heading", { level: 1, name: newsletterSignup.title }),
    ).toBeInTheDocument();
  });
});
