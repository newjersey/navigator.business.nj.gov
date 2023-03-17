import { isInterstateLogisticsApplicable } from "@/lib/domain-logic/isInterstateLogisticsApplicable";

describe("isInterstateLogisticsApplicable", () => {
  it("returns false when there is no industry", () => {
    expect(isInterstateLogisticsApplicable(undefined)).toEqual(false);
  });

  it("returns false when industry does not fall under logistics company", () => {
    expect(isInterstateLogisticsApplicable("acupuncture")).toEqual(false);
  });

  it("returns false when industry does not exist", () => {
    expect(isInterstateLogisticsApplicable("fake-industry")).toEqual(false);
  });

  it("returns true when industry is a logistics company", () => {
    expect(isInterstateLogisticsApplicable("logistics")).toEqual(true);
  });
});
