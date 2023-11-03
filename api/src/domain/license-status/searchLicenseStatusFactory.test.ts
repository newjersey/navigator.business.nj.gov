import { searchLicenseStatusFactory } from "@domain/license-status/searchLicenseStatusFactory";
import { SearchLicenseStatusFactory } from "@domain/types";
import { generateLicenseSearchNameAndAddress } from "@shared/test";

describe("searchLicenseStatusFactory", () => {
  let stubLegacySearchLicenseStatus: jest.Mock;
  let stubNewSearchLicenseStatus: jest.Mock;
  let searchLicenseStatus: SearchLicenseStatusFactory;

  let ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS: string | undefined;

  beforeEach(() => {
    ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS = process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS;
    process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = "true";
    stubLegacySearchLicenseStatus = jest.fn();
    stubNewSearchLicenseStatus = jest.fn();
    searchLicenseStatus = searchLicenseStatusFactory(
      stubLegacySearchLicenseStatus,
      stubNewSearchLicenseStatus
    );
  });

  afterEach(() => {
    process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS;
  });

  describe("when license type is public movers and warehouse", () => {
    it("returns new status client when env var is true", () => {
      const licenseType = "Public Movers and Warehousemen";
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubNewSearchLicenseStatus).toHaveBeenCalled();
      expect(stubLegacySearchLicenseStatus).not.toHaveBeenCalled();
    });

    it("returns legacy license status client when env var is false", () => {
      process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = "false";
      const licenseType = "Public Movers and Warehousemen";
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubNewSearchLicenseStatus).not.toHaveBeenCalled();
      expect(stubLegacySearchLicenseStatus).toHaveBeenCalled();
    });
  });

  describe("when license type is not public movers and warehouse", () => {
    it("always returns legacy license client status", () => {
      const licenseType = "Architecture";
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubNewSearchLicenseStatus).not.toHaveBeenCalled();
      expect(stubLegacySearchLicenseStatus).toHaveBeenCalled();
    });
  });
});
