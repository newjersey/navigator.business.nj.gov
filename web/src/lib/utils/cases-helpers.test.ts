import {
  camelCaseToKebabCase,
  camelCaseToSentence,
  capitalizeFirstLetter,
  kebabSnakeSentenceToCamelCase,
} from "@/lib/utils/cases-helpers";

describe("cases-helpers", () => {
  describe("kebabSnakeSentenceToCamelCase", () => {
    it("converts kebab-case to camelCase", () => {
      expect(kebabSnakeSentenceToCamelCase("food-truck-whatever")).toEqual("foodTruckWhatever");
    });

    it("converts sentence case to camelCase", () => {
      expect(kebabSnakeSentenceToCamelCase("food truck whatever")).toEqual("foodTruckWhatever");
    });

    it("converts snake_case to camelCase", () => {
      expect(kebabSnakeSentenceToCamelCase("FOOD_TRUCK_WHATEVER")).toEqual("foodTruckWhatever");
    });
  });

  describe("capitalizeFirstLetter", () => {
    it("capitalizes first letter", () => {
      expect(capitalizeFirstLetter("my name is")).toEqual("My name is");
    });

    it("does nothing if first letter is already capital", () => {
      expect(capitalizeFirstLetter("HELLO")).toEqual("HELLO");
    });
  });

  describe("camelCaseToSentence", () => {
    it("converts camelCase to Sentence case", () => {
      expect(camelCaseToSentence("businessAddressLine1")).toEqual("Business address line1");
    });
  });

  describe("camelCaseToKebabCase", () => {
    it("converts camelCase to kebab-case", () => {
      expect(camelCaseToKebabCase("businessAddressLine1")).toEqual("business-address-line1");
    });
  });
});
