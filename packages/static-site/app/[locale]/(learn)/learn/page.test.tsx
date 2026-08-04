import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import LearnPage, { generateMetadata } from "./page";

describe("generateMetadata", () => {
  it("brands the title with the learn page's own name and its sub-heading as the description", async () => {
    const { learn } = getApplicationMessages({ locale: "en-US" });

    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en-US" }) });

    expect(metadata.title).toEqual({ absolute: `${learn.name} | Business.NJ.gov` });
    expect(metadata.description).toBe(learn.subHeadingText);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
    expect(metadata.alternates?.canonical).toBe("/learn");
  });
});

describe("LearnPage", () => {
  it("renders the learn page's name as an h1", async () => {
    const { learn } = getApplicationMessages({ locale: "en-US" });

    render(await LearnPage({ params: Promise.resolve({ locale: "en-US" }) }));

    expect(screen.getByRole("heading", { level: 1, name: learn.name })).toBeInTheDocument();
  });
});
