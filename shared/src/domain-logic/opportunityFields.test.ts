import { generateProfileData } from "../test";
import { getFieldsForProfile } from "./opportunityFields";

describe("opportunityFields", () => {
  describe("getFieldsForProfile", () => {
    describe("when starting a business", () => {
      it("when legal structure is a trade name", async () => {
        const startingBusiness = generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "general-partnership",
        });

        const profileFields = getFieldsForProfile(startingBusiness);
        expect(profileFields).not.toContain("dateOfFormation");
        expect(profileFields).toContain("municipality");
        expect(profileFields).toContain("existingEmployees");
        expect(profileFields).toContain("homeBasedBusiness");
        expect(profileFields).toContain("ownershipTypeIds");
      });

      it("when legal structure is not a trade name", async () => {
        const startingBusiness = generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-partnership",
        });

        const profileFields = getFieldsForProfile(startingBusiness);
        expect(profileFields).toContain("dateOfFormation");
        expect(profileFields).toContain("municipality");
        expect(profileFields).toContain("existingEmployees");
        expect(profileFields).toContain("homeBasedBusiness");
        expect(profileFields).toContain("ownershipTypeIds");
      });
    });

    describe("when foreign nexus", () => {
      describe("when location in NJ", () => {
        it("when legal structure that is a trade name", async () => {
          const foreignNexusBusiness = generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            nexusLocationInNewJersey: true,
            legalStructureId: "general-partnership",
          });

          const profileFields = getFieldsForProfile(foreignNexusBusiness);
          expect(profileFields).toContain("municipality");
          expect(profileFields).not.toContain("dateOfFormation");
          expect(profileFields).not.toContain("existingEmployees");
          expect(profileFields).not.toContain("homeBasedBusiness");
          expect(profileFields).not.toContain("ownershipTypeIds");
        });

        it("when legal structure that is not a trade name", async () => {
          const foreignNexusBusiness = generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            nexusLocationInNewJersey: true,
            legalStructureId: "limited-partnership",
          });

          const profileFields = getFieldsForProfile(foreignNexusBusiness);
          expect(profileFields).toContain("dateOfFormation");
          expect(profileFields).toContain("municipality");
          expect(profileFields).not.toContain("existingEmployees");
          expect(profileFields).not.toContain("homeBasedBusiness");
          expect(profileFields).not.toContain("ownershipTypeIds");
        });
      });

      describe("when location not in NJ", () => {
        it("when legal structure that is a trade name", async () => {
          const foreignNexusBusiness = generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            nexusLocationInNewJersey: false,
            legalStructureId: "general-partnership",
          });

          const profileFields = getFieldsForProfile(foreignNexusBusiness);
          expect(profileFields).toContain("homeBasedBusiness");
          expect(profileFields).not.toContain("municipality");
          expect(profileFields).not.toContain("dateOfFormation");
          expect(profileFields).not.toContain("existingEmployees");
          expect(profileFields).not.toContain("ownershipTypeIds");
        });

        it("when legal structure that is not a trade name", async () => {
          const foreignNexusBusiness = generateProfileData({
            businessPersona: "FOREIGN",
            foreignBusinessType: "NEXUS",
            nexusLocationInNewJersey: false,
            legalStructureId: "limited-partnership",
          });

          const profileFields = getFieldsForProfile(foreignNexusBusiness);
          expect(profileFields).toContain("dateOfFormation");
          expect(profileFields).toContain("homeBasedBusiness");
          expect(profileFields).not.toContain("municipality");
          expect(profileFields).not.toContain("existingEmployees");
          expect(profileFields).not.toContain("ownershipTypeIds");
        });
      });
    });
  });
});
