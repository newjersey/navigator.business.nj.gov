import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { loadPageBySlug } from "@/domain/content/loadContent";
import PrivacyPolicyRoute, { generateMetadata } from "./page";

const { name } = loadPageBySlug("privacy-policy");

describe("generateMetadata", () => {
  it("builds hreflang alternates for /privacy-policy", () => {
    const metadata = generateMetadata();
    expect(metadata.alternates?.canonical).toBe("/privacy-policy");
  });
});

describe("PrivacyPolicyRoute", () => {
  it("renders the privacy policy page for a supported locale", async () => {
    render(
      await PrivacyPolicyRoute({
        params: Promise.resolve({ locale: "en-US" }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name })).toBeInTheDocument();
  });
});
