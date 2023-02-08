import { formatIntlPostalCode } from "./formatIntlPostalCode";

describe("formatIntlPostalCode", () => {
  it("allows up to 11 characters", () => {
    const postalCode = "1234 AFB-0198";

    expect(formatIntlPostalCode(postalCode)).toBe("1234 AFB-01");
  });

  it("replaces lowercase letters with uppercase", () => {
    const postalCode = "1234-afb01";

    expect(formatIntlPostalCode(postalCode)).toBe("1234-AFB01");
  });

  it("does not allow symbols", () => {
    const postalCode = "1234%*78901";

    expect(formatIntlPostalCode(postalCode)).toBe("123478901");
  });

  it("replaces two consecutive spaces with one space", () => {
    const postalCode = "1234  78901";

    expect(formatIntlPostalCode(postalCode)).toBe("1234 78901");
  });

  it("replaces two consecutive dashes with one dash", () => {
    const postalCode = "1234--AFB01";

    expect(formatIntlPostalCode(postalCode)).toBe("1234-AFB01");
  });
});
