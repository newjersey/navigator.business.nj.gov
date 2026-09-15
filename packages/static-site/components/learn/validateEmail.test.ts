import { describe, expect, it } from "vitest";
import { validateEmail } from "./validateEmail";

describe("validateEmail", () => {
  it("returns true for a valid email", () => {
    expect(validateEmail("user@example.com")).toEqual(true);
  });

  it("returns true for a valid email with a subdomain", () => {
    expect(validateEmail("user@mail.example.com")).toEqual(true);
  });

  it("returns false when missing the @ symbol", () => {
    expect(validateEmail("userexample.com")).toEqual(false);
  });

  it("returns false when missing a domain", () => {
    expect(validateEmail("user@")).toEqual(false);
  });

  it("returns false when missing a local part", () => {
    expect(validateEmail("@example.com")).toEqual(false);
  });

  it("returns false for an empty string", () => {
    expect(validateEmail("")).toEqual(false);
  });

  it("returns false when the domain has no TLD", () => {
    expect(validateEmail("user@localhost")).toEqual(false);
  });
});
