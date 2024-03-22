import { searchLicenseStatusFactory } from "@domain/license-status/searchLicenseStatusFactory";
import { SearchLicenseStatusFactory } from "@domain/types";
import { randomInt } from "@shared/intHelpers";
import { generateLicenseSearchNameAndAddress } from "@shared/test";

describe("searchLicenseStatusFactory", () => {
  let stubWebServiceSearchLicenseStatus: jest.Mock;
  let stubDynamicsSearchLicenseStatus: jest.Mock;
  let searchLicenseStatus: SearchLicenseStatusFactory;

  let ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS: string | undefined;
  let ORIGINAL_FEATURE_DYNAMICS_HEALTH_CARE_SERVICES: string | undefined;

  beforeEach(() => {
    ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS = process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS;
    ORIGINAL_FEATURE_DYNAMICS_HEALTH_CARE_SERVICES = process.env.FEATURE_DYNAMICS_HEALTH_CARE_SERVICES;
    process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = "true";
    process.env.FEATURE_DYNAMICS_HEALTH_CARE_SERVICES = "true";
    stubWebServiceSearchLicenseStatus = jest.fn();
    stubDynamicsSearchLicenseStatus = jest.fn();
    searchLicenseStatus = searchLicenseStatusFactory(
      stubWebServiceSearchLicenseStatus,
      stubDynamicsSearchLicenseStatus
    );
  });

  afterEach(() => {
    process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = ORIGINAL_FEATURE_DYNAMICS_PUBLIC_MOVERS;
    process.env.FEATURE_DYNAMICS_HEALTH_CARE_SERVICES = ORIGINAL_FEATURE_DYNAMICS_HEALTH_CARE_SERVICES;
  });

  describe("when license type is included in dynamics", () => {
    describe("when license type is public movers and warehouse", () => {
      it("returns dynamics status client when env var is true", () => {
        const licenseType = "Public Movers and Warehousemen";
        const licenseStatus = searchLicenseStatus(licenseType);
        licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
        expect(stubDynamicsSearchLicenseStatus).toHaveBeenCalled();
        expect(stubWebServiceSearchLicenseStatus).not.toHaveBeenCalled();
      });

      it("returns web service license status client when env var is false", () => {
        process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = "false";
        const licenseType = "Public Movers and Warehousemen";
        const licenseStatus = searchLicenseStatus(licenseType);
        licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
        expect(stubDynamicsSearchLicenseStatus).not.toHaveBeenCalled();
        expect(stubWebServiceSearchLicenseStatus).toHaveBeenCalled();
      });
    });

    describe("when license type is health care services", () => {
      it("returns dynamics status client when env var is true", () => {
        const licenseType = "Health Care Services";
        const licenseStatus = searchLicenseStatus(licenseType);
        licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
        expect(stubDynamicsSearchLicenseStatus).toHaveBeenCalled();
        expect(stubWebServiceSearchLicenseStatus).not.toHaveBeenCalled();
      });

      it("returns web service license status client when env var is false", () => {
        process.env.FEATURE_DYNAMICS_HEALTH_CARE_SERVICES = "false";
        const licenseType = "Health Care Services";
        const licenseStatus = searchLicenseStatus(licenseType);
        licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
        expect(stubDynamicsSearchLicenseStatus).not.toHaveBeenCalled();
        expect(stubWebServiceSearchLicenseStatus).toHaveBeenCalled();
      });
    });
  });

  describe("when license type is not included in dynamics", () => {
    it("always returns web service license client status", () => {
      const licenseType = `random-license-type-${randomInt()}`;
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubDynamicsSearchLicenseStatus).not.toHaveBeenCalled();
      expect(stubWebServiceSearchLicenseStatus).toHaveBeenCalled();
    });
  });
});
