import { splitAndBoldSearchText } from "@/lib/utils/splitAndBoldSearchText";

describe("splitAndBoldSearchText", () => {
  it("properly displays the found text as bold", () => {
    expect(splitAndBoldSearchText("food truck", "truck")).toMatchSnapshot();
  });

  it("properly displays the text as not bold when not found", () => {
    expect(splitAndBoldSearchText("food truck", "firm")).toMatchSnapshot();
  });
});
