import { formatDolEin } from "@/lib/domain-logic/formatDolEin";

describe("splitDolEin", () => {
  it("splits at 2 digits, 5 digits, 8 digits, 11 digits, 14 digits", () => {
    expect(formatDolEin("1")).toEqual("1");
    expect(formatDolEin("1234")).toEqual("1-234");
    expect(formatDolEin("1234567")).toEqual("1-234-567");
    expect(formatDolEin("1234567890")).toEqual("1-234-567-890");
    expect(formatDolEin("1234567890123")).toEqual("1-234-567-890/123");
    expect(formatDolEin("123456789012345")).toEqual("1-234-567-890/123-45");
  });
});
