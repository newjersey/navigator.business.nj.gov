import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ImpactReportStat } from "@/domain/content/messageTypes";
import { ImpactStatGroup } from "./ImpactStatGroup";

const stats: readonly ImpactReportStat[] = [
  { text: "**39,768,502** appearances in search results." },
  { text: "**10,846,068** total visits." },
];

describe("ImpactStatGroup", () => {
  it("renders plain stats as bulleted list items with a bolded figure", () => {
    render(<ImpactStatGroup stats={stats} />);

    expect(screen.getByText("39,768,502", { selector: "strong" })).toBeInTheDocument();
    expect(
      screen.getByText("appearances in search results.", { exact: false }),
    ).toBeInTheDocument();
    expect(screen.getByText("10,846,068", { selector: "strong" })).toBeInTheDocument();
  });

  it("renders plain stats inside a single unordered list, not boxed cards", () => {
    const { container } = render(<ImpactStatGroup stats={stats} />);
    expect(screen.getAllByRole("list")).toHaveLength(1);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelector(".usa-card")).not.toBeInTheDocument();
  });

  it("renders a dark stat as a full-width dark callout block", () => {
    const darkStats: readonly ImpactReportStat[] = [
      { text: "On average, businesses start **30% faster**.", variant: "dark" },
    ];
    const { container } = render(<ImpactStatGroup stats={darkStats} />);
    expect(screen.getByText("30% faster", { selector: "strong" })).toBeInTheDocument();
    expect(
      container.querySelector(".impact-report-stat--dark.usa-section--dark"),
    ).toBeInTheDocument();
  });

  it("renders a mix of plain and dark stats, each with its own treatment", () => {
    const mixed: readonly ImpactReportStat[] = [
      { text: "**1** plain stat." },
      { text: "**2** dark stat.", variant: "dark" },
      { text: "**3** another plain stat." },
    ];
    const { container } = render(<ImpactStatGroup stats={mixed} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(container.querySelectorAll(".impact-report-stat--dark")).toHaveLength(1);
  });
});

describe("ImpactStatGroup footnote markers and dark-lead emphasis", () => {
  it("renders a [^N] marker as a link to the matching footnote anchor", () => {
    const withFootnote: readonly ImpactReportStat[] = [
      { text: "**25 days faster** on average. [^1]", variant: "dark" },
    ];
    render(<ImpactStatGroup stats={withFootnote} />);

    const link = screen.getByRole("link", { name: "Footnote 1" });
    expect(link).toHaveAttribute("href", "#impact-report-footnote-1");
  });

  it("gives the footnote marker link an accessible name beyond the bare digit", () => {
    const withFootnote: readonly ImpactReportStat[] = [
      { text: "**25 days faster** on average. [^1]", variant: "dark" },
    ];
    render(<ImpactStatGroup stats={withFootnote} />);

    const link = screen.getByRole("link", { name: "Footnote 1" });
    expect(link).toHaveTextContent("1");
    expect(link).toHaveAttribute("href", "#impact-report-footnote-1");
  });

  it("gives the footnote marker link a citation id for a footnote back-link to target", () => {
    const withFootnote: readonly ImpactReportStat[] = [
      { text: "**25 days faster** on average. [^1]", variant: "dark" },
    ];
    const { container } = render(<ImpactStatGroup stats={withFootnote} />);

    expect(container.querySelector("#impact-report-citation-1")).toBeInTheDocument();
  });

  it("does not render a footnote link when a stat has no [^N] marker", () => {
    const withoutFootnote: readonly ImpactReportStat[] = [{ text: "**30% faster**." }];
    render(<ImpactStatGroup stats={withoutFootnote} />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders every [^N] marker as its own footnote link, not just the first", () => {
    const withTwoFootnotes: readonly ImpactReportStat[] = [
      { text: "**X** saved time [^1] and earnings [^2]", variant: "dark" },
    ];
    render(<ImpactStatGroup stats={withTwoFootnotes} />);

    const firstLink = screen.getByRole("link", { name: "Footnote 1" });
    const secondLink = screen.getByRole("link", { name: "Footnote 2" });
    expect(firstLink).toHaveAttribute("href", "#impact-report-footnote-1");
    expect(secondLink).toHaveAttribute("href", "#impact-report-footnote-2");
    expect(screen.queryByText("[^2]")).not.toBeInTheDocument();
  });

  it("does not apply the dark-lead class to a dark stat starting with bold text when emphasis is unset", () => {
    const darkStats: readonly ImpactReportStat[] = [
      { text: "**30% faster** than those that don't.", variant: "dark" },
    ];
    const { container } = render(<ImpactStatGroup stats={darkStats} />);
    expect(container.querySelector(".impact-report-stat--dark-lead")).not.toBeInTheDocument();
  });

  it("applies the dark-lead class to a dark stat with emphasis: lead", () => {
    const darkStats: readonly ImpactReportStat[] = [
      { text: "**25 days faster** average time saved.", variant: "dark", emphasis: "lead" },
    ];
    const { container } = render(<ImpactStatGroup stats={darkStats} />);
    expect(container.querySelector(".impact-report-stat--dark-lead")).toBeInTheDocument();
  });
});
