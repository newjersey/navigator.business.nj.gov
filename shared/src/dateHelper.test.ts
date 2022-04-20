import { getCurrentDateFormatted } from "./dateHelpers";

describe("dateHelper Tests", () => {
  it("returns the formatted date", () => {
    expect(getCurrentDateFormatted("YYYY-MM-DD")).toBe("2022-04-20");
  });
});
