import { generateProfileData } from "../test";
import { nexusLocationInNewJersey } from "./nexusLocationInNewJersey";

describe("nexusLocationInNewJersey", () => {
  it("returns true when business is foreign, nexus, and contains officeInNJ in foreignBusinessTypesIds", () => {
    expect(
      nexusLocationInNewJersey(
        generateProfileData({ businessPersona: "FOREIGN", foreignBusinessTypeIds: ["officeInNJ"] })
      )
    ).toBe(true);
  });

  it("returns undefined when business is not foreign", () => {
    expect(nexusLocationInNewJersey(generateProfileData({ businessPersona: "STARTING" }))).toBe(undefined);
  });

  it("returns false when business is not nexus", () => {
    expect(
      nexusLocationInNewJersey(
        generateProfileData({ businessPersona: "FOREIGN", foreignBusinessTypeIds: ["revenueInNJ"] })
      )
    ).toBe(false);
  });

  it("returns false when business does not contain officeInNJ in foreignBusinessTypesIds", () => {
    expect(
      nexusLocationInNewJersey(
        generateProfileData({
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeeOrContractorInNJ"],
        })
      )
    ).toBe(false);
  });
});
