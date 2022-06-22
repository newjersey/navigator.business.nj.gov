import { createEmptyNameAndAddress } from "./misc";

describe("createEmptyNameAndAddress", () => {
  it("creates an empty address object", () => {
    expect(createEmptyNameAndAddress()).toEqual({
      name: "",
      addressLine1: "",
      addressLine2: "",
      zipCode: "",
    });
  });
});
