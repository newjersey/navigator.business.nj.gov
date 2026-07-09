import { describe, expect, it } from "vitest";
import { whoItsForLabel } from "./whoItsForLabel";

// A stand-in for the localized `whoItsForLabels` message map, keyed by the
// Webflow classification key. Values are deliberately not the production English
// copy: the assertions can only pass if the function resolves through the
// supplied map, proving labels come from i18n config rather than a hardcoded
// table. This also keeps the test locale-agnostic.
const labels: Record<string, string> = {
  "business-license": "who-for::business",
  "individual-license": "who-for::individual",
  "object-vehicle": "who-for::object",
};

describe("whoItsForLabel", () => {
  it("resolves each known Webflow classification key through the supplied label map", () => {
    for (const key of Object.keys(labels)) {
      expect(whoItsForLabel(key, labels)).toBe(labels[key]);
    }
  });

  it("returns undefined for a key absent from the map, so the row is omitted", () => {
    expect(whoItsForLabel("school-course", labels)).toBeUndefined();
    expect(whoItsForLabel("", labels)).toBeUndefined();
    expect(whoItsForLabel(undefined, labels)).toBeUndefined();
    expect(whoItsForLabel("LICENSE", labels)).toBeUndefined();
  });
});
