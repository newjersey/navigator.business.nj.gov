import {
  isNexusBusiness,
  isOwningBusiness,
  isRemoteWorkerOrSellerBusiness,
  isStartingBusiness,
} from "@/lib/domain-logic/businessPersonaHelpers";
import {
  Business,
  BusinessPersona,
  ForeignBusinessTypeId,
  NexusBusinessTypeIds,
  RemoteSellerBusinessTypeIds,
  RemoteWorkerBusinessTypeIds,
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared/";

const generateBusinessWithBusinessPersona = (businessPersona: BusinessPersona): Business =>
  generateBusiness({
    profileData: generateProfileData({
      businessPersona: businessPersona,
    }),
  });

const generateForeignBusinessWithForeignBusinessTypeIds = (
  foreignBusinessTypeIds: ForeignBusinessTypeId[]
): Business => {
  return generateBusiness({
    profileData: generateProfileData({
      foreignBusinessTypeIds: foreignBusinessTypeIds,
      businessPersona: "FOREIGN",
    }),
  });
};

describe("businessPersonaHelpers", () => {
  describe("isOwningBusiness", () => {
    it("returns false when business is undefined", () => {
      expect(isOwningBusiness(undefined)).toBe(false);
    });

    it("returns false when business persona is starting", () => {
      expect(isOwningBusiness(generateBusinessWithBusinessPersona("STARTING"))).toBe(false);
    });

    it("returns false when business persona is foreign", () => {
      expect(isOwningBusiness(generateBusinessWithBusinessPersona("FOREIGN"))).toBe(false);
    });

    it("returns true when business persona is owning", () => {
      expect(isOwningBusiness(generateBusinessWithBusinessPersona("OWNING"))).toBe(true);
    });
  });

  describe("isStartingBusiness", () => {
    it("returns false when business is undefined", () => {
      expect(isStartingBusiness(undefined)).toBe(false);
    });

    it("returns false when business persona is owning", () => {
      expect(isStartingBusiness(generateBusinessWithBusinessPersona("OWNING"))).toBe(false);
    });

    it("returns false when business persona is foreign", () => {
      expect(isStartingBusiness(generateBusinessWithBusinessPersona("FOREIGN"))).toBe(false);
    });

    it("returns true when business persona is starting", () => {
      expect(isStartingBusiness(generateBusinessWithBusinessPersona("STARTING"))).toBe(true);
    });
  });

  describe("isNexusBusiness", () => {
    it.each(NexusBusinessTypeIds)(`returns true when %s`, (NexusBusinessTypeIds: ForeignBusinessTypeId) => {
      expect(isNexusBusiness(generateForeignBusinessWithForeignBusinessTypeIds([NexusBusinessTypeIds]))).toBe(
        true
      );
    });

    it.each([...RemoteSellerBusinessTypeIds, ...RemoteWorkerBusinessTypeIds])(
      `returns false when %s`,
      (RemoteSellerOrWorkerBusinessTypeIds: ForeignBusinessTypeId) => {
        expect(
          isNexusBusiness(
            generateForeignBusinessWithForeignBusinessTypeIds([RemoteSellerOrWorkerBusinessTypeIds])
          )
        ).toBe(false);
      }
    );

    it("returns false when empty", () => {
      expect(isNexusBusiness(generateForeignBusinessWithForeignBusinessTypeIds([]))).toBe(false);
    });

    it("returns false when business is undefined", () => {
      expect(isNexusBusiness(undefined)).toBe(false);
    });

    it("returns false when business persona is not Foreign", () => {
      expect(
        isNexusBusiness(
          generateBusiness({
            profileData: generateProfileData({
              foreignBusinessTypeIds: ["employeesInNJ"],
              businessPersona: "STARTING",
            }),
          })
        )
      ).toBe(false);
    });
  });

  describe("isRemoteWorkerOrSellerBusiness", () => {
    it.each([...RemoteSellerBusinessTypeIds, ...RemoteWorkerBusinessTypeIds])(
      `returns true when %s`,
      (RemoteWorkerOrSellerBusinessTypeId: ForeignBusinessTypeId) => {
        expect(
          isRemoteWorkerOrSellerBusiness(
            generateForeignBusinessWithForeignBusinessTypeIds([RemoteWorkerOrSellerBusinessTypeId])
          )
        ).toBe(true);
      }
    );

    it.each(NexusBusinessTypeIds)(`returns false when %s`, (NexusBusinessTypeIds: ForeignBusinessTypeId) => {
      expect(
        isRemoteWorkerOrSellerBusiness(
          generateForeignBusinessWithForeignBusinessTypeIds([NexusBusinessTypeIds])
        )
      ).toBe(false);
    });

    it("returns false when empty", () => {
      expect(isRemoteWorkerOrSellerBusiness(generateForeignBusinessWithForeignBusinessTypeIds([]))).toBe(
        false
      );
    });

    it("returns false when business is undefined", () => {
      expect(isRemoteWorkerOrSellerBusiness(undefined)).toBe(false);
    });

    it("returns false when business persona is not Foreign", () => {
      expect(
        isRemoteWorkerOrSellerBusiness(
          generateBusiness({
            profileData: generateProfileData({
              foreignBusinessTypeIds: ["employeesInNJ"],
              businessPersona: "STARTING",
            }),
          })
        )
      ).toBe(false);
    });
  });
});
