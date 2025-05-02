import { convertSignedByteArrayToUnsigned, randomInt, randomIntFromInterval } from "./intHelpers";

describe("intHelpers", () => {
  describe("randomInt", () => {
    it("has the correct number of places", () => {
      const value = randomInt();
      expect(value.toString().length).toBe(8);
    });

    it("has the correct number of places when a length is passed", () => {
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

  describe("convertSignedByteArrayToUnsigned", () => {
    it("converts valid signed bytes to unsigned", () => {
      const validBytes = [0, 1, -1, 37, -37, -128, 127];
      expect(convertSignedByteArrayToUnsigned(validBytes)).toEqual([0, 1, 255, 37, 219, 128, 127]);
    });

    it("throws an error if a signed byte is invalid", () => {
      const lessThanValidByte = [0, 1, -129, 127];
      expect(() => convertSignedByteArrayToUnsigned(lessThanValidByte)).toThrow(
        "Invalid signedByte -129, expected -128 <= signedByte <= 127",
      );

      const greaterThanValidByte = [0, 1, -128, 128];
      expect(() => convertSignedByteArrayToUnsigned(greaterThanValidByte)).toThrow(
        "Invalid signedByte 128, expected -128 <= signedByte <= 127",
      );
    });
  });
});
