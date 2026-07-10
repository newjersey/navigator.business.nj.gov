import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { ImpactReportPage } from "./ImpactReportPage";

const messages = await getApplicationMessages({ locale: "en-US" });
const { impactReport } = messages;

describe("ImpactReportPage", () => {
  it("renders the page title", async () => {
    render(await ImpactReportPage({ locale: "en-US" }));
    expect(screen.getByRole("heading", { level: 1, name: impactReport.title })).toBeInTheDocument();
  });

  it("renders every section heading in order", async () => {
    render(await ImpactReportPage({ locale: "en-US" }));

    const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual([
      impactReport.aboutUs.heading,
      impactReport.makingItEasier.heading,
      impactReport.awarenessAndCompliance.heading,
      impactReport.fosteringEconomicGrowth.heading,
      impactReport.customerServiceExperience.heading,
      impactReport.drivingEquity.heading,
    ]);
  });

  it("renders a download link that opens the report PDF in a new tab", async () => {
    render(await ImpactReportPage({ locale: "en-US" }));

    const link = screen.getByRole("link", { name: impactReport.downloadLink.label });
    expect(link).toHaveAttribute("href", impactReport.downloadLink.href);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });
});
