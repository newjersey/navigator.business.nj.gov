import {
  convertTextToMarkdownBold,
  removeContextualInfoFormatting,
} from "@/lib/utils/content-helpers";

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

describe("removeContextualInfoFormatting", () => {
  it("removes the contextual info formatting and returns a plain string", () => {
    const input =
      "This is a `test|test-info` string with `contextual information|contextual-information`.";
    const expectedOutput = "This is a test string with contextual information.";
    expect(removeContextualInfoFormatting(input)).toBe(expectedOutput);
  });

  it("returns the same plain string when no contextual info formatting is present", () => {
    const input = "This is a plain string without any special formatting.";
    const expectedOutput = "This is a plain string without any special formatting.";
    expect(removeContextualInfoFormatting(input)).toBe(expectedOutput);
  });
});
