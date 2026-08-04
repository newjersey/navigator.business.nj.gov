import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { loadPageBySlug } from "@/domain/content/loadContent";
import SoftwareAndReuseRoute, { generateMetadata } from "./page";

const page = loadPageBySlug("our-software-and-reuse");
const { name } = page;

describe("generateMetadata", () => {
  it("brands the title with the page's own name and its sub-heading as the description", () => {
    const metadata = generateMetadata();

    expect(metadata.title).toEqual({ absolute: `${name} | Business.NJ.gov` });
    expect(metadata.description).toBe(page["sub-heading-text"]);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
    expect(metadata.alternates?.canonical).toBe("/our-software-and-reuse");
  });
});

describe("SoftwareAndReuseRoute", () => {
  it("renders the page for a supported locale", async () => {
    render(
      await SoftwareAndReuseRoute({
        params: Promise.resolve({ locale: "en-US" }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name })).toBeInTheDocument();
  });
});
