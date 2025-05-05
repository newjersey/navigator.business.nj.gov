import { isEncrypted } from "@/lib/utils/encryption";

describe("isEncrypted", () => {
  it.each([
    { maskedValue: undefined, encryptedValue: "AgV4o/o1RbwN", expected: undefined },
    { maskedValue: "777", encryptedValue: undefined, expected: undefined },
    { maskedValue: "777", encryptedValue: "AgV4o/o1RbwN", expected: false },
    { maskedValue: "*77", encryptedValue: "AgV4o/o1RbwN", expected: true },
  ])(
    `should return $expected when maskedValue is $maskedValue and encryptedValue is $encryptedValue`,
    ({ maskedValue, encryptedValue, expected }) => {
      expect(isEncrypted(maskedValue, encryptedValue)).toEqual(expected);
    },
  );
});
