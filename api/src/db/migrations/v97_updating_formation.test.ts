/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  allFormationLegalTypes,
  v96FormationData,
  v96generateFormationAddress,
  v96generateFormationFormData,
  v96generatorProfileData,
  v96UserDataGenerator,
} from "./v96_added_date_field_to_tax_filing_data";
import { migrate_v96_to_v97 } from "./v97_updating_formation_types";

describe("migrate_v96_to_v97", () => {
  beforeEach(async () => {
    jest.resetAllMocks();
  });

  describe(`migrates a user with a tradeName Legal Structure`, () => {
    const v96 = v96UserDataGenerator({
      profileData: v96generatorProfileData({ legalStructureId: "sole-proprietorship" }),
      formationData: v96FormationData(
        {
          formationFormData: v96generateFormationFormData(
            { members: [v96generateFormationAddress({ addressState: "Maine" })] },
            "sole-proprietorship",
          ),
        },
        "sole-proprietorship",
      ),
    });
    migrate_v96_to_v97(v96);
  });

  describe(`migrates a user with an undefined Legal Structure`, () => {
    const v96 = v96UserDataGenerator({
      profileData: v96generatorProfileData({ legalStructureId: undefined }),
      formationData: v96FormationData({
        formationFormData: v96generateFormationFormData({}),
      }),
    });
    migrate_v96_to_v97(v96);
  });

  allFormationLegalTypes.map((legalStructureId) => {
    return describe(`the generic field updates to formationFormData for ${legalStructureId}`, () => {
      const v96 = v96UserDataGenerator({
        profileData: v96generatorProfileData({ legalStructureId }),
        formationData: v96FormationData(
          {
            formationFormData: v96generateFormationFormData(
              { members: [v96generateFormationAddress({ addressState: "Maine" })] },
              legalStructureId,
            ),
          },
          legalStructureId,
        ),
      });
      const v97 = migrate_v96_to_v97(v96);
      const {
        members,
        signers,
        businessAddressCity,
        businessAddressLine1,
        businessAddressLine2,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        businessAddressState,
        businessAddressZipCode,
        ...formationFormData
      } = v96.formationData.formationFormData;

      it("renames businessAddress fields", () => {
        expect(v97.formationData.formationFormData.addressCity).toEqual(undefined);
        expect(v97.formationData.formationFormData).not.toContain("businessAddressCity");
        expect(v97.formationData.formationFormData.addressMunicipality).toEqual(businessAddressCity);
        expect(v97.formationData.formationFormData.addressLine1).toEqual(businessAddressLine1);
        expect(v97.formationData.formationFormData).not.toContain("businessAddressLine1");
        expect(v97.formationData.formationFormData.addressLine2).toEqual(businessAddressLine2);
        expect(v97.formationData.formationFormData).not.toContain("businessAddressLine2");
        expect(v97.formationData.formationFormData.addressZipCode).toEqual(businessAddressZipCode);
        expect(v97.formationData.formationFormData).not.toContain("businessAddressZipCode");
      });

      it("adds addressCountry field", () => {
        expect(v97.formationData.formationFormData.addressCountry).toEqual("US");
      });

      it("converts the businessAddressState 'New Jersey' string field to a StateObject", () => {
        expect(v97.formationData.formationFormData).not.toContain("businessAddressState");
        expect(v97.formationData.formationFormData.addressState).toEqual({
          name: "New Jersey",
          shortCode: "NJ",
        });
      });

      it("adds new dakota-relevant fields", () => {
        expect(v97.formationData.formationFormData.foreignDateOfFormation).toEqual(undefined);
        expect(v97.formationData.formationFormData.foreignGoodStandingFile).toEqual(undefined);
        expect(v97.formationData.formationFormData.foreignStateOfFormation).toEqual(undefined);
      });

      it("adds new agent office municipality field but retains the legacy agent office city field", () => {
        expect(v97.formationData.formationFormData.agentOfficeAddressMunicipality).toEqual(undefined);
        expect(v97.formationData.formationFormData.agentOfficeAddressCity).not.toEqual(undefined);
      });
    });
  });

  describe("the updates to formationFormData as a limited-liability-company", () => {
    const legalStructureId = "limited-liability-company";
    const v96 = v96UserDataGenerator({
      profileData: v96generatorProfileData({ legalStructureId }),
      formationData: v96FormationData(
        {
          formationFormData: v96generateFormationFormData(
            { members: [v96generateFormationAddress({ addressState: "Maine" })] },
            legalStructureId,
          ),
        },
        legalStructureId,
      ),
    });
    const v97 = migrate_v96_to_v97(v96);

    it("adds new incorporator field", () => {
      expect(v97.formationData.formationFormData.incorporators).toEqual(undefined);
    });

    it("converts members to new international address format", () => {
      expect(v97.formationData.formationFormData.members).toEqual(
        v96.formationData.formationFormData.members.map((member) => {
          return { ...member, addressCountry: "US", addressState: { shortCode: "ME", name: "Maine" } };
        }),
      );
    });

    it("converts signers to new titled format", () => {
      expect(v97.formationData.formationFormData.signers).toEqual(
        v96.formationData.formationFormData.signers.map((signer) => {
          return { name: signer.name, signature: signer.signature, title: "Authorized Representative" };
        }),
      );
    });
  });

  describe("the updates to formationFormData as a limited-liability-partnership", () => {
    const legalStructureId = "limited-liability-partnership";
    const v96 = v96UserDataGenerator({
      profileData: v96generatorProfileData({ legalStructureId }),
      formationData: v96FormationData(
        {
          formationFormData: v96generateFormationFormData({}, legalStructureId),
        },
        legalStructureId,
      ),
    });
    const v97 = migrate_v96_to_v97(v96);

    it("adds new incorporator field", () => {
      expect(v97.formationData.formationFormData.incorporators).toEqual(undefined);
    });

    it("keeps members undefined", () => {
      expect(v97.formationData.formationFormData.members).toEqual(undefined);
    });

    it("converts signers to new titled format", () => {
      expect(v97.formationData.formationFormData.signers).toEqual(
        v96.formationData.formationFormData.signers.map((signer) => {
          return { name: signer.name, signature: signer.signature, title: "Authorized Partner" };
        }),
      );
    });
  });

  describe("the updates to formationFormData as a limited-partnership", () => {
    const legalStructureId = "limited-partnership";
    const incorporator = v96generateFormationAddress({ addressState: "Maine" });
    const v96 = v96UserDataGenerator({
      profileData: v96generatorProfileData({ legalStructureId }),
      formationData: v96FormationData(
        {
          formationFormData: v96generateFormationFormData(
            {
              members: [incorporator],
              signers: [incorporator],
            },
            legalStructureId,
          ),
        },
        legalStructureId,
      ),
    });
    const v97 = migrate_v96_to_v97(v96);

    it("converts signers to incorporators", () => {
      expect(v97.formationData.formationFormData.incorporators).toEqual(
        v96.formationData.formationFormData.signers.map((signer) => {
          return {
            ...signer,
            addressCountry: "US",
            addressState: { shortCode: "ME", name: "Maine" },
            title: "General Partner",
          };
        }),
      );
    });

    it("deletes members that are duplicates of signers", () => {
      expect(v97.formationData.formationFormData.members).toEqual(undefined);
    });

    it("deletes signers", () => {
      expect(v97.formationData.formationFormData.signers).toEqual(undefined);
    });
  });

  ["c-corporation", "s-corporation"].map((legalStructureId) => {
    return describe(`the updates to formationFormData as a ${legalStructureId}`, () => {
      const legalStructureId = "s-corporation";
      const v96 = v96UserDataGenerator({
        profileData: v96generatorProfileData({ legalStructureId }),
        formationData: v96FormationData(
          {
            formationFormData: v96generateFormationFormData(
              {
                members: [v96generateFormationAddress({ addressState: "Maine" })],
                signers: [v96generateFormationAddress({ addressState: "Maine" })],
              },
              legalStructureId,
            ),
          },
          legalStructureId,
        ),
      });
      const v97 = migrate_v96_to_v97(v96);

      it("converts signers to incorporators", () => {
        expect(v97.formationData.formationFormData.incorporators).toEqual(
          v96.formationData.formationFormData.signers.map((signer) => {
            return {
              ...signer,
              addressCountry: "US",
              addressState: { shortCode: "ME", name: "Maine" },
              title: "Incorporator",
            };
          }),
        );
      });

      it("converts members (directors) to new international address format", () => {
        expect(v97.formationData.formationFormData.members).toEqual(
          v96.formationData.formationFormData.members.map((member) => {
            return { ...member, addressCountry: "US", addressState: { shortCode: "ME", name: "Maine" } };
          }),
        );
      });

      it("deletes signers", () => {
        expect(v97.formationData.formationFormData.signers).toEqual(undefined);
      });
    });
  });
});
