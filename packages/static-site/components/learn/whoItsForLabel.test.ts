import { describe, expect, it } from "vitest";
import { whoItsForLabel } from "./whoItsForLabel";

describe("whoItsForLabel", () => {
  it("maps the known Webflow classification keys to their display labels", () => {
    expect(whoItsForLabel("business-license")).toBe("Businesses");
    expect(whoItsForLabel("individual-license")).toBe("Individuals");
    expect(whoItsForLabel("object-vehicle")).toBe("Object/Vehicle");
  });

  it("returns undefined for an unknown or missing key, so the row is omitted", () => {
    expect(whoItsForLabel("school-course")).toBeUndefined();
    expect(whoItsForLabel("")).toBeUndefined();
    expect(whoItsForLabel(undefined)).toBeUndefined();
    expect(whoItsForLabel("LICENSE")).toBeUndefined();
  });
});
