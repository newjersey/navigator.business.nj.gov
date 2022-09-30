import { isCarServiceApplicable } from "./isCarServiceApplicable";

describe("isCarServiceApplicable", () => {
  it("returns false when no industry is supplied", () => {
    expect(isCarServiceApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not have a car service option", () => {
    expect(isCarServiceApplicable("transportation")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isCarServiceApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry has a car service option", () => {
    expect(isCarServiceApplicable("car-service")).toEqual(true);
  });
});
