import { render, screen } from "@testing-library/react";
import { useLocale } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import SearchRoute, { generateMetadata } from "./page";

vi.mock("next-intl", () => ({ useLocale: vi.fn() }));

const mockedUseLocale = vi.mocked(useLocale);
mockedUseLocale.mockReturnValue("en-US");

const { search } = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("brands the title with the page's own title and its meta description", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US" }),
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toEqual({ absolute: `${search.title} | Business.NJ.gov` });
    expect(metadata.description).toBe(search.metaDescription);
    expect(metadata.alternates?.canonical).toBe("/search");
  });
});

describe("SearchRoute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the search page content for a supported locale with search enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");

    render(
      await SearchRoute({
        params: Promise.resolve({ locale: "en-US" }),
        searchParams: Promise.resolve({ q: "funding" }),
      }),
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: search.resultsHeading.replace("{query}", "funding"),
      }),
    ).toBeInTheDocument();
  });

  it("calls notFound for an unsupported locale", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "true");

    await expect(
      SearchRoute({
        params: Promise.resolve({ locale: "fr-FR" as AppLocale }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });

  it("calls notFound when the search flag is off", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "false");

    await expect(
      SearchRoute({
        params: Promise.resolve({ locale: "en-US" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });

  it("calls notFound when the search flag is unset", async () => {
    vi.stubEnv("NEXT_PUBLIC_SEARCH_ENABLED", "");

    await expect(
      SearchRoute({
        params: Promise.resolve({ locale: "en-US" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow();
  });
});
