import {
  Business,
  BusinessPersona,
  ForeignBusinessTypeId,
  NexusBusinessTypeIds,
  RemoteSellerBusinessTypeIds,
  RemoteWorkerBusinessTypeIds,
  determineForeignBusinessType,
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared/";
import {
  isDomesticEmployerBusiness,
  isNexusBusiness,
  isOwningBusiness,
  isRemoteWorkerOrSellerBusiness,
  isStartingBusiness,
} from "./businessPersonaHelpers";

const generateBusinessWithBusinessPersona = (businessPersona: BusinessPersona): Business =>
  generateBusiness({
    profileData: generateProfileData({
      businessPersona: businessPersona,
    }),
  });

const generateBusinessWithBusinessPersonaAndIndustry = (
  businessPersona: BusinessPersona,
  industryId: string
): Business =>
  generateBusiness({
    profileData: generateProfileData({
      businessPersona: businessPersona,
      industryId: industryId,
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
      expect(isOwningBusiness()).toBe(false);
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
      expect(isStartingBusiness()).toBe(false);
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
      expect(isNexusBusiness()).toBe(false);
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
      expect(isRemoteWorkerOrSellerBusiness()).toBe(false);
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

  describe("determineForeignBusinessType", () => {
    it("returns undefined when array is empty", () => {
      expect(determineForeignBusinessType([])).toBeUndefined();
    });

    it("returns NEXUS for employeeOrContractorInNJ as highest priority", () => {
      expect(determineForeignBusinessType(["employeeOrContractorInNJ"])).toEqual("NEXUS");

      expect(determineForeignBusinessType(["employeeOrContractorInNJ", "employeesInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["employeeOrContractorInNJ", "transactionsInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["employeeOrContractorInNJ", "revenueInNJ"])).toEqual("NEXUS");
      expect(
        determineForeignBusinessType([
          "employeeOrContractorInNJ",
          "revenueInNJ",
          "transactionsInNJ",
          "employeesInNJ",
        ])
      ).toEqual("NEXUS");
    });

    it("returns NEXUS for officeInNJ as highest priority", () => {
      expect(determineForeignBusinessType(["officeInNJ"])).toEqual("NEXUS");

      expect(determineForeignBusinessType(["officeInNJ", "employeesInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["officeInNJ", "transactionsInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["officeInNJ", "revenueInNJ"])).toEqual("NEXUS");
      expect(
        determineForeignBusinessType(["officeInNJ", "revenueInNJ", "transactionsInNJ", "employeesInNJ"])
      ).toEqual("NEXUS");
    });

    it("returns NEXUS for propertyInNJ as highest priority", () => {
      expect(determineForeignBusinessType(["propertyInNJ"])).toEqual("NEXUS");

      expect(determineForeignBusinessType(["propertyInNJ", "employeesInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["propertyInNJ", "transactionsInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["propertyInNJ", "revenueInNJ"])).toEqual("NEXUS");
      expect(
        determineForeignBusinessType(["propertyInNJ", "revenueInNJ", "transactionsInNJ", "employeesInNJ"])
      ).toEqual("NEXUS");
    });

    it("returns NEXUS for companyOperatedVehiclesInNJ as highest priority", () => {
      expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ"])).toEqual("NEXUS");

      expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "employeesInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "transactionsInNJ"])).toEqual(
        "NEXUS"
      );
      expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ", "revenueInNJ"])).toEqual("NEXUS");
      expect(
        determineForeignBusinessType([
          "companyOperatedVehiclesInNJ",
          "revenueInNJ",
          "transactionsInNJ",
          "employeesInNJ",
        ])
      ).toEqual("NEXUS");
    });

    it("returns NEXUS for officeInNJ, propertyInNJ, or companyOperatedVehiclesInNJ", () => {
      expect(determineForeignBusinessType(["officeInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["propertyInNJ"])).toEqual("NEXUS");
      expect(determineForeignBusinessType(["companyOperatedVehiclesInNJ"])).toEqual("NEXUS");
      expect(
        determineForeignBusinessType(["officeInNJ", "propertyInNJ", "companyOperatedVehiclesInNJ"])
      ).toEqual("NEXUS");
    });

    it("returns REMOTE_WORKER for employeesInNJ as higher priority over remote_seller (but not nexus)", () => {
      expect(determineForeignBusinessType(["employeesInNJ"])).toEqual("REMOTE_WORKER");

      expect(determineForeignBusinessType(["employeesInNJ", "transactionsInNJ"])).toEqual("REMOTE_WORKER");
      expect(determineForeignBusinessType(["employeesInNJ", "revenueInNJ"])).toEqual("REMOTE_WORKER");
      expect(determineForeignBusinessType(["employeesInNJ", "revenueInNJ", "transactionsInNJ"])).toEqual(
        "REMOTE_WORKER"
      );
    });

    it("returns REMOTE_SELLER for revenueInNJ or transactionsInNJ", () => {
      expect(determineForeignBusinessType(["revenueInNJ"])).toEqual("REMOTE_SELLER");
      expect(determineForeignBusinessType(["transactionsInNJ"])).toEqual("REMOTE_SELLER");
      expect(determineForeignBusinessType(["revenueInNJ", "transactionsInNJ"])).toEqual("REMOTE_SELLER");
    });

    it("returns none when none is selected", () => {
      expect(determineForeignBusinessType(["none"])).toEqual("NONE");
    });

    it("returns none when none and other values are selected", () => {
      expect(determineForeignBusinessType(["none", "revenueInNJ"])).toEqual("NONE");
    });
  });

  describe("isDomesticEmployerBusiness", () => {
    it("returns false when business is undefined", () => {
      expect(isDomesticEmployerBusiness()).toBe(false);
    });

    it("returns false when business persona is OWNING", () => {
      expect(isDomesticEmployerBusiness(generateBusinessWithBusinessPersona("OWNING"))).toBe(false);
    });

    it("returns false when business persona is FOREIGN", () => {
      expect(isDomesticEmployerBusiness(generateBusinessWithBusinessPersona("FOREIGN"))).toBe(false);
    });

    it("returns true when business persona is STARTING and industry is domestic employer", () => {
      expect(
        isDomesticEmployerBusiness(
          generateBusinessWithBusinessPersonaAndIndustry("STARTING", "domestic-employer")
        )
      ).toBe(true);
    });
  });
});
