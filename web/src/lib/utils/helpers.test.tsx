import { splitAndBoldSearchText } from "./helpers";

describe("helpers", () => {
  describe("splitAndBoldSearchText", () => {
    it("properly displays the found text as bold", () => {
      expect(splitAndBoldSearchText("food truck", "truck")).toMatchSnapshot();
    });

    it("properly displays the text as not bould when not found", () => {
      expect(splitAndBoldSearchText("food truck", "firm")).toMatchSnapshot();
    });
  });
});
