/**
 * Removes the custom CMS content directives that the main `web` app renders as
 * styled callout boxes (`:::infoAlert`, `:::largeCallout`, `:::note`, …). The
 * static site renders summaries with plain `react-markdown`, which has no
 * directive support, so the raw `:::` fences would otherwise show as literal
 * text. We unwrap them and keep the inner content as ordinary markdown, mirroring
 * how `parseFundingContent` treats the funding `:::largeCallout` block.
 *
 * The directive opener may carry an attribute block, e.g.
 * `:::largeCallout{ headerText="Keep in mind:" }`; the attributes (including any
 * header text) are dropped, matching the funding precedent.
 */
const directiveFenceLine = /^:::\w*(?:\{[^}]*\})?\s*$/gm;

const contextualInfoSpan = /`([^`|]+)\|[^`]+`/g;

/**
 * Strips contextual-info-link code spans down to their visible label, dropping
 * both the `|id` and the surrounding backticks: `` `Local Enforcing Agency
 * (LEA)|lea` `` becomes `Local Enforcing Agency (LEA)`. The backticks must go —
 * the main `web` app renders these spans as interactive info links, but the
 * static site has no such component, so leaving the backticks would render the
 * label as a monospace `<code>` span.
 */
export const stripContextualInfoIds = (text: string): string =>
  text.replace(contextualInfoSpan, "$1");

export const stripContentDirectives = (md: string): string =>
  stripContextualInfoIds(md.replace(directiveFenceLine, ""));
