/**
 * Resolves a license's Webflow classification key (`webflowType`) to its "Who
 * it's for" display label using the supplied localized label map. Returns
 * `undefined` for unknown or missing keys so the card omits the row entirely
 * rather than showing a raw or blank value.
 *
 * The label map is the localized `whoItsForLabels` from the page messages, so
 * the labels are translatable rather than hardcoded English.
 *
 * `school-course` is a valid key in the upstream Webflow classification
 * vocabulary but no current license is assigned it, so it is intentionally
 * absent from the map (and its live display label is unconfirmed). Worth
 * revisiting: either add a label once verified in Webflow, or drop the value
 * from the source vocabulary if it stays unused.
 */
export const whoItsForLabel = (
  webflowType: string | undefined,
  labels: Record<string, string>,
): string | undefined => (webflowType ? labels[webflowType] : undefined);
