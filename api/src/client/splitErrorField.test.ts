import { splitErrorField } from "./splitErrorField";

describe("splitErrorField", () => {
  it("splits on the dot and turns into sentence case", () => {
    expect(splitErrorField("Formation.PayerEmail")).toEqual("Payer Email");
  });

  it("if more than one dot, splits all into sentence case with hyphens", () => {
    expect(splitErrorField("Formation.RegisteredAgent.StreetAddress.Zipcode")).toEqual(
      "Registered Agent - Street Address - Zipcode"
    );
  });
});
