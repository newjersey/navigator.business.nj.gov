import { isFullNameValid } from "@/lib/domain-logic/isFullNameValid";

describe("isFullNameValid", () => {
  it("returns false when name is undefined", () => {
    expect(isFullNameValid(undefined)).toBe(false);
  });

  it("returns false when name is empty string", () => {
    expect(isFullNameValid("")).toBe(false);
  });

  it("returns false when name is longer than 50 characters", () => {
    const okName = Array(50).fill("A").join("");
    expect(isFullNameValid(okName)).toBe(true);

    const longName = Array(51).fill("A").join("");
    expect(isFullNameValid(longName)).toBe(false);
  });

  it("returns false when name starts with a number or symbol", () => {
    expect(isFullNameValid("1234")).toBe(false);
    expect(isFullNameValid("1abnadsfdfg")).toBe(false);
    expect(isFullNameValid("-------")).toBe(false);
    expect(isFullNameValid("-mycoolname")).toBe(false);
  });

  it("returns true when name contains a number", () => {
    expect(isFullNameValid("asdfas1")).toBe(true);
  });

  it("returns false when name contains non-allowed special characters", () => {
    expect(isFullNameValid("abc!")).toBe(false);
    expect(isFullNameValid("abc@")).toBe(false);
    expect(isFullNameValid("abc#")).toBe(false);
    expect(isFullNameValid("abc$")).toBe(false);
    expect(isFullNameValid("abc%")).toBe(false);
    expect(isFullNameValid("abc^")).toBe(false);
    expect(isFullNameValid("abc*")).toBe(false);
    expect(isFullNameValid("abc?")).toBe(false);
  });

  it("returns true when name contains allowed special characters", () => {
    expect(isFullNameValid("abc'")).toBe(true);
    expect(isFullNameValid("abc,")).toBe(true);
    expect(isFullNameValid("abc.")).toBe(true);
    expect(isFullNameValid("abc-")).toBe(true);
  });

  it("returns true for a simple name", () => {
    expect(isFullNameValid("Some Name")).toBe(true);
    expect(isFullNameValid("some name")).toBe(true);
  });
});
