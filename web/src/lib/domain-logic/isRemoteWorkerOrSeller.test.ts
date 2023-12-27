import { isRemoteWorkerOrSeller } from "@/lib/domain-logic/isRemoteWorkerOrSeller";
import {
  Business,
  ForeignBusinessTypeId,
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared/";

describe("isRemoteWorkerOrSeller", () => {
  const Business = (override: ForeignBusinessTypeId[]): Business => {
    return generateBusiness({
      profileData: generateProfileData({ foreignBusinessTypeIds: override }),
    });
  };

  it("returns true when employeesInNJ", () => {
    expect(isRemoteWorkerOrSeller(Business(["employeesInNJ"]))).toBe(true);
  });

  it("returns true when revenueInNJ", () => {
    expect(isRemoteWorkerOrSeller(Business(["revenueInNJ"]))).toBe(true);
  });

  it("returns true when transactionsInNJ", () => {
    expect(isRemoteWorkerOrSeller(Business(["transactionsInNJ"]))).toBe(true);
  });

  it("returns false when empty", () => {
    expect(isRemoteWorkerOrSeller(Business([]))).toBe(false);
  });

  it("returns false when nexus", () => {
    expect(isRemoteWorkerOrSeller(Business(["employeeOrContractorInNJ"]))).toBe(false);
  });

  it("returns false when business is undefined", () => {
    expect(isRemoteWorkerOrSeller(undefined)).toBe(false);
  });
});
