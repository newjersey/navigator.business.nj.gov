import { kebabSnakeSentenceToCamelCase, splitAndBoldSearchText } from "./helpers";

describe("helpers", () => {
  describe("splitAndBoldSearchText", () => {
    it("properly displays the found text as bold", () => {
      expect(splitAndBoldSearchText("food truck", "truck")).toMatchSnapshot();
    });

    it("properly displays the text as not bould when not found", () => {
      expect(splitAndBoldSearchText("food truck", "firm")).toMatchSnapshot();
    });
  });

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
});
