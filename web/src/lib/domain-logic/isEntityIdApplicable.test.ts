import { LegalStructures } from "@businessnjgovnavigator/shared/";
import { isEntityIdApplicable } from "./isEntityIdApplicable";

describe("isEntityIdApplicable", () => {
  for (const ls of LegalStructures) {
    it(`${ls.id} returns the correct entity id value`, () => {
      expect(isEntityIdApplicable(ls.id)).toBe(!ls.hasTradeName);
    });
  }
});
