import { modifyContent } from "@/lib/domain-logic/modifyContent";

describe("modifyContent", () => {
  it("modifies content according to map when condition is true", () => {
    const content = "I am ${oos} business";
    const condition = (): boolean => true;
    const modificationMap = { oos: "out-of-state" };

    expect(modifyContent({ content, condition, modificationMap })).toEqual("I am out-of-state business");
  });

  it("removes modifier when condition is false", () => {
    const content = "I am ${oos} business";
    const condition = (): boolean => false;
    const modificationMap = { oos: "out-of-state" };

    expect(modifyContent({ content, condition, modificationMap })).toEqual("I am business");
  });

  it("does not change if no modification map in string", () => {
    const content = "I am ${oos} business";
    const condition = (): boolean => false;
    const modificationMap = { something: "random" };

    expect(modifyContent({ content, condition, modificationMap })).toEqual("I am ${oos} business");
  });
});
