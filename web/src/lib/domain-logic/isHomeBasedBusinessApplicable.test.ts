import { isHomeBasedBusinessApplicable } from "./isHomeBasedBusinessApplicable";

describe("isHomeBasedBusinessApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isHomeBasedBusinessApplicable(undefined)).toEqual(false);
  });
  it("returns false when industry does not have a home based option", () => {
    expect(isHomeBasedBusinessApplicable("auto-body-repair")).toEqual(false);
  });
  it("returns false when industry does not exist", () => {
    expect(isHomeBasedBusinessApplicable("fake-industry")).toEqual(false);
  });
  it("returns true when industry has a home based option", () => {
    expect(isHomeBasedBusinessApplicable("cleaning-aid")).toEqual(true);
  });
});
