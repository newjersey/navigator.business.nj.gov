import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { loadRecents } from "@/domain/content/loadContent";
import { buildUpdateDescription } from "@/domain/metadata/buildUpdateDescription";
import UpdateDetailRoute, { generateMetadata } from "./page";

const recent = loadRecents().find(
  (item) => item.slug === "drought-warning-in-effect-voluntary-water-reduction-urged",
);

if (!recent) {
  throw new Error("Expected fixture update to exist in content/src/recents");
}

describe("generateMetadata", () => {
  it("builds a branded title matching the update's own name", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: recent.slug }),
    });

    expect(metadata.title).toEqual({ absolute: `${recent.name} | Business.NJ.gov` });
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
  });

  it("derives a description from the update's body, matching openGraph and twitter", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: recent.slug }),
    });

    const expectedDescription = buildUpdateDescription({ body: recent.body });

    expect(metadata.description).toBe(expectedDescription);
    expect(metadata.openGraph?.description).toBe(expectedDescription);
    expect(metadata.twitter?.description).toBe(expectedDescription);
  });

  it("builds hreflang alternates for /updates/<slug>", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: recent.slug }),
    });

    expect(metadata.alternates?.canonical).toBe(`/updates/${recent.slug}`);
  });

  it("falls back to alternates-only metadata for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en-US", slug: "does-not-exist" }),
    });

    expect(metadata.title).toBeUndefined();
    expect(metadata.alternates?.canonical).toBe("/updates/does-not-exist");
  });
});

describe("UpdateDetailRoute", () => {
  it("renders the update's name as an h1", async () => {
    render(
      await UpdateDetailRoute({
        params: Promise.resolve({ locale: "en-US", slug: recent.slug }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: recent.name })).toBeInTheDocument();
  });
});
