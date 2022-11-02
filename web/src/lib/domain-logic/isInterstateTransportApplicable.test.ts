import { isInterstateTransportApplicable } from "./isInterstateTransportApplicable";

describe("isInterstateTransportApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isInterstateTransportApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not fall under moving company", () => {
    expect(isInterstateTransportApplicable("acupuncture")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isInterstateTransportApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry is a moving company", () => {
    expect(isInterstateTransportApplicable("moving-company")).toEqual(true);
  });

  it("returns true when industry is a logistics company", () => {
    expect(isInterstateTransportApplicable("logistics")).toEqual(true);
  });
});
