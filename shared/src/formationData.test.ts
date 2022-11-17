import { createEmptyFormationFormData } from "./formationData";

describe("formationData", () => {
  describe("createEmptyFormationFormData", () => {
    it("returns the correct object", () => {
      expect(createEmptyFormationFormData()).toMatchSnapshot();
    });
  });
});
