import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import ImpactReportRoute, { generateMetadata } from "./page";

const { impactReport } = getApplicationMessages({ locale: "en-US" });

describe("generateMetadata", () => {
  it("builds hreflang alternates for /impact-report", () => {
    const metadata = generateMetadata();
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
