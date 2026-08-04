import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import ImpactReportRoute, { generateMetadata } from "./page";

const { impactReport } = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("brands the title with the page's own title and its meta description", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: "en-US" }) });

    expect(metadata.title).toEqual({ absolute: `${impactReport.title} | Business.NJ.gov` });
    expect(metadata.description).toBe(impactReport.metaDescription);
    expect(metadata.openGraph?.title).toEqual(metadata.title);
    expect(metadata.twitter?.title).toEqual(metadata.title);
    expect(metadata.alternates?.canonical).toBe("/impact-report");
  });
});

describe("ImpactReportRoute", () => {
  it("renders the impact report page for a supported locale", async () => {
    render(
      await ImpactReportRoute({
        params: Promise.resolve({ locale: "en-US" }),
      }),
    );

    expect(screen.getByRole("heading", { level: 1, name: impactReport.title })).toBeInTheDocument();
  });
});
