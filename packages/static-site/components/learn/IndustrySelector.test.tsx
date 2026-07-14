import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { generateIndustry } from "@/tests/factories";
import { IndustrySelector } from "./IndustrySelector";

const messages = await getApplicationMessages({ locale: "en-US" });
const starterKits = messages.learn.starterKits;

const industries = [generateIndustry(), generateIndustry(), generateIndustry()];

const baseUrl = "https://example.com/onboarding";

describe("IndustrySelector", () => {
  it("renders all industries as listbox options", () => {
    render(
      <IndustrySelector
        industries={industries}
        baseUrl={baseUrl}
        heading={starterKits.industrySelectorHeading}
        ctaText={starterKits.industrySelectorCta}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(3);
    const industriesNames = industries.map((industry) => industry.name);
    expect(options.map((o) => o.textContent)).toEqual(industriesNames);
  });

  it("renders the CTA as disabled when no industry is selected", () => {
    render(
      <IndustrySelector
        industries={industries}
        baseUrl={baseUrl}
        heading={starterKits.industrySelectorHeading}
        ctaText={starterKits.industrySelectorCta}
      />,
    );

    const cta = screen.getByText(starterKits.industrySelectorCta);
    expect(cta).toHaveAttribute("aria-disabled", "true");
    expect(cta).not.toHaveAttribute("href");
  });

  it("enables the CTA with correct href when an industry is selected", () => {
    render(
      <IndustrySelector
        industries={industries}
        baseUrl={baseUrl}
        heading={starterKits.industrySelectorHeading}
        ctaText={starterKits.industrySelectorCta}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    const targetIndustry = industries[0];
    const option = screen.getByRole("option", { name: targetIndustry.name });
    fireEvent.click(option);

    const cta = screen.getByRole("link", { name: starterKits.industrySelectorCta });
    expect(cta).toHaveAttribute("href", `${baseUrl}?industry=${targetIndustry.id}`);
    expect(cta).toHaveAttribute("aria-disabled", "false");
  });

  it("opens the CTA in a new tab", () => {
    render(
      <IndustrySelector
        industries={industries}
        baseUrl={baseUrl}
        heading={starterKits.industrySelectorHeading}
        ctaText={starterKits.industrySelectorCta}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.click(input);

    const option = screen.getByRole("option", { name: industries[0].name });
    fireEvent.click(option);

    const cta = screen.getByRole("link", { name: starterKits.industrySelectorCta });
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noreferrer");
  });
});
