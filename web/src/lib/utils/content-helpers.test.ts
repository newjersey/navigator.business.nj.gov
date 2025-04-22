import { convertTextToMarkdownBold } from "@/lib/utils/content-helpers";

describe("convertTextToMarkdownBold", () => {
  it("should convert a normal string to markdown bold", () => {
    const input = "Hello";
    const expectedOutput = "__Hello__";

    expect(convertTextToMarkdownBold(input)).toBe(expectedOutput);
  });

  it("should return an empty string if input is undefined", () => {
    const input = undefined as unknown as string;
    expect(convertTextToMarkdownBold(input)).toBe("");
  });

  it("should return an empty string if input is an empty string", () => {
    const input = "";
    expect(convertTextToMarkdownBold(input)).toBe("");
  });

  it("should trim whitespace and then apply markdown bold", () => {
    const input = "   Hello World   ";
    const expectedOutput = "__Hello World__";

    expect(convertTextToMarkdownBold(input)).toBe(expectedOutput);
  });
});
