import { createEmptyFormationAddress, createEmptyFormationFormData } from "./formationData";

describe("formationData", () => {
  describe("createEmptyFormationFormData", () => {
    it("returns the correct object", () => {
      expect(createEmptyFormationFormData()).toMatchSnapshot();
    });
  });

  describe("createEmptyFormationAddress", () => {
    it("returns the correct object", () => {
      expect(createEmptyFormationAddress()).toMatchSnapshot();
    });
  });
});
