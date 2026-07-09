import type { AnchorHTMLAttributes } from "react";
import Markdown, { type Components } from "react-markdown";
import type { ImpactReportStat } from "@/domain/content/messageTypes";

interface Props {
  readonly stats: readonly ImpactReportStat[];
}

interface StatRun {
  readonly variant: "plain" | "dark";
  readonly stats: readonly ImpactReportStat[];
}

const FOOTNOTE_MARKER_PATTERN = /\[\^(\d+)\]/g;

const FOOTNOTE_HREF_PREFIX = "#impact-report-footnote-";

const resolveFootnoteMarkers = (text: string): string =>
  text.replace(
    FOOTNOTE_MARKER_PATTERN,
    (_match, footnoteNumber) => `[${footnoteNumber}](${FOOTNOTE_HREF_PREFIX}${footnoteNumber})`,
  );

/**
 * Renders a footnote marker link with an accessible name and a citation id
 * that a matching footnote back-link can target, or a plain anchor for any
 * other link markdown produces.
 */
const renderMarkdownAnchor = ({ href, children }: AnchorHTMLAttributes<HTMLAnchorElement>) => {
  if (href?.startsWith(FOOTNOTE_HREF_PREFIX)) {
    const footnoteNumber = href.slice(FOOTNOTE_HREF_PREFIX.length);
    return (
      <a
        href={href}
        id={`impact-report-citation-${footnoteNumber}`}
        aria-label={`Footnote ${footnoteNumber}`}
      >
        {children}
      </a>
    );
  }

  return <a href={href}>{children}</a>;
};

const markdownComponents: Components = { a: renderMarkdownAnchor };

const groupIntoRuns = (stats: readonly ImpactReportStat[]): StatRun[] => {
  const runs: StatRun[] = [];

  for (const stat of stats) {
    const variant = stat.variant ?? "plain";
    const lastRun = runs.at(-1);
    if (lastRun && lastRun.variant === variant) {
      runs[runs.length - 1] = { variant, stats: [...lastRun.stats, stat] };
    } else {
      runs.push({ variant, stats: [stat] });
    }
  }

  return runs;
};

export const ImpactStatGroup = ({ stats }: Props) => {
  const runs = groupIntoRuns(stats);

  return (
    <>
      {runs.map((run, runIndex) =>
        run.variant === "plain" ? (
          // biome-ignore lint/suspicious/noArrayIndexKey: runs are derived from static content, positional and stable per render
          <ul key={runIndex} className="impact-report-stats-list">
            {run.stats.map((stat, statIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: stats are static content, positional and stable per render
              <li key={statIndex}>
                <Markdown components={markdownComponents}>
                  {resolveFootnoteMarkers(stat.text)}
                </Markdown>
              </li>
            ))}
          </ul>
        ) : (
          run.stats.map((stat, statIndex) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: stats are static content, positional and stable per render
              key={statIndex}
              className={`impact-report-stat--dark usa-section usa-section--dark radius-lg${stat.emphasis === "lead" ? " impact-report-stat--dark-lead" : ""}`}
            >
              <Markdown components={markdownComponents}>
                {resolveFootnoteMarkers(stat.text)}
              </Markdown>
            </div>
          ))
        ),
      )}
    </>
  );
};
