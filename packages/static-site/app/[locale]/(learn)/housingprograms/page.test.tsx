import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import { loadPageBySlug } from "@/domain/content/loadContent";
import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
} from "@/domain/content/pagePaths";
import type { AppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import HousingProgramsRoute, { generateMetadata } from "./page";

vi.mock("@/domain/content/loadContent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/domain/content/loadContent")>();
  return {
    ...actual,
    loadFundings: () => [],
    loadSectors: () => [],
  };
});

const page = loadPageBySlug(HOUSING_DEVELOPER_RESOURCES_SLUG);
const messages = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("uses the localized message title, not the English-only frontmatter name", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US" }),
    });

    expect(metadata.title).toEqual({
      absolute: `${messages.housingDeveloperResources.title} | Business.NJ.gov`,
    });
    expect(metadata.description).toBe(page["sub-heading-text"]);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
  });

  it("canonicalizes the page at its own pathname, not under /pages", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US" }),
    });

    expect(metadata.alternates?.canonical).toBe(HOUSING_DEVELOPER_RESOURCES_PATHNAME);
  });
});

describe("HousingProgramsRoute", () => {
  it("returns 404 for an unknown locale", async () => {
    await expect(
      HousingProgramsRoute({
        params: Promise.resolve({ locale: "invalid-locale" as AppLocale }),
      }),
    ).rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });

  it("renders the funding content with the housing developer resources title", async () => {
    const route = await HousingProgramsRoute({
      params: Promise.resolve({ locale: "en-US" }),
    });
    render(
      <NextIntlClientProvider locale="en-US" messages={messages}>
        {route}
      </NextIntlClientProvider>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: messages.housingDeveloperResources.title,
      }),
    ).toBeInTheDocument();
  });
});
