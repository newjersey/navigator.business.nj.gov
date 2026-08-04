import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import NewsletterSignupRoute, { generateMetadata } from "./page";

const { newsletterSignup } = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("brands the title with the page's own title and its meta description", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en-US" }) });

    expect(metadata.title).toEqual({ absolute: `${newsletterSignup.title} | Business.NJ.gov` });
    expect(metadata.description).toBe(newsletterSignup.metaDescription);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
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
