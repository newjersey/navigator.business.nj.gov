import { randomInt, randomIntFromInterval } from "./intHelpers";

describe("intHelpers", () => {
  describe("randomInt", () => {
    it("has the correct number of places", () => {
      const value = randomInt(4);
      expect(value.toString().length).toBe(4);
    });
    it("returns a number", () => {
      const value = randomInt(6);
      expect(value).toStrictEqual(expect.any(Number));
    });
  });
  describe("randomIntFromInterval", () => {
    it("is not less than the minimum", () => {
      const value = randomIntFromInterval("1", "10");
      expect(value).toBeGreaterThanOrEqual(1);
    });
    it("is not more than the maximum", () => {
      const value = randomIntFromInterval("1", "10");
      expect(value).toBeLessThanOrEqual(10);
    });
    it("returns a number", () => {
      const value = randomIntFromInterval("1", "10");
      expect(value).toStrictEqual(expect.any(Number));
    });
  });
});
