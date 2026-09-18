import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HOUSING_DEVELOPER_RESOURCES_PATHNAME,
  HOUSING_DEVELOPER_RESOURCES_SLUG,
} from "@/domain/content/housingDeveloperResourcesFlag";
import { loadPageBySlug } from "@/domain/content/loadContent";
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
  afterEach(() => {
    vi.unstubAllEnvs();
  });

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

  it("still returns a branded title when the flag is disabled, since a 404 uses the not-found metadata", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "false");

    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US" }),
    });

    expect(metadata.title).toEqual({
      absolute: `${messages.housingDeveloperResources.title} | Business.NJ.gov`,
    });
  });
});

describe("HousingProgramsRoute", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the funding content with the housing developer resources title", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

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

  it("404s when the flag is disabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "false");

    await expect(
      HousingProgramsRoute({ params: Promise.resolve({ locale: "en-US" }) }),
    ).rejects.toThrow();
  });

  it("404s for an unsupported locale", async () => {
    vi.stubEnv("NEXT_PUBLIC_HOUSING_DEVELOPER_RESOURCES_ENABLED", "true");

    await expect(
      // @ts-expect-error — exercising an unsupported locale reaching the route.
      HousingProgramsRoute({ params: Promise.resolve({ locale: "fr-FR" }) }),
    ).rejects.toThrow();
  });
});
