/**
 * Maps a license's Webflow classification key (`webflowType`) to the "Who it's
 * for" display label shown on the live site. Returns `undefined` for unknown or
 * missing keys so the card omits the row entirely rather than showing a raw or
 * blank value.
 *
 * `school-course` is a valid key in the upstream Webflow classification
 * vocabulary but no current license is assigned it, so it is intentionally
 * unmapped (and its live display label is unconfirmed). Worth revisiting: either
 * add a label here once verified in Webflow, or drop the value from the source
 * vocabulary if it stays unused.
 */
const labelsByWebflowType: Record<string, string> = {
  "business-license": "Businesses",
  "individual-license": "Individuals",
  "object-vehicle": "Object/Vehicle",
};

export const whoItsForLabel = (webflowType: string | undefined): string | undefined =>
  webflowType ? labelsByWebflowType[webflowType] : undefined;
