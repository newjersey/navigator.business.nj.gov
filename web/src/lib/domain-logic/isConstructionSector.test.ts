import { isConstructionSector } from "@/lib/domain-logic/isConstructionSector";

describe("isConstructionSector", () => {
  it("returns true when construction is argument", () => {
    expect(isConstructionSector("construction")).toBe(true);
  });

  it("returns false when construction is not the argument", () => {
    expect(isConstructionSector("some-value")).toBe(false);
  });
});
