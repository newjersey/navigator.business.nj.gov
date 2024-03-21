import { getFormattedMetadata, titlePrefix } from "./getFormattedMetadata";

describe("getFormattedMetadata", () => {
  it("allows up to 11 characters", () => {
    expect(getFormattedMetadata()).toBe(titlePrefix);
  });
});
