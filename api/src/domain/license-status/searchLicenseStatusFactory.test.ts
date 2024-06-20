import { searchLicenseStatusFactory } from "@domain/license-status/searchLicenseStatusFactory";
import { SearchLicenseStatusFactory } from "@domain/types";
import { randomInt } from "@shared/intHelpers";
import { generateLicenseSearchNameAndAddress } from "@shared/test";

describe("searchLicenseStatusFactory", () => {
  let stubWebServiceSearchLicenseStatus: jest.Mock;
  let stubDynamicsSearchLicenseStatus: jest.Mock;
  let searchLicenseStatus: SearchLicenseStatusFactory;

  process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS = "true";

  const ENV_VARIABLES_INITIAL = process.env;

  beforeEach(() => {
    process.env = ENV_VARIABLES_INITIAL;
    stubWebServiceSearchLicenseStatus = jest.fn();
    stubDynamicsSearchLicenseStatus = jest.fn();
    searchLicenseStatus = searchLicenseStatusFactory(
      stubWebServiceSearchLicenseStatus,
      stubDynamicsSearchLicenseStatus
    );
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

    it("returns dynamics status client when license type is health care services", () => {
      const licenseType = "Health Care Services";
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubDynamicsSearchLicenseStatus).toHaveBeenCalled();
      expect(stubWebServiceSearchLicenseStatus).not.toHaveBeenCalled();
    });

    it("returns dynamics status client when license type is health club services", () => {
      const licenseType = "Health Club Services";
      const licenseStatus = searchLicenseStatus(licenseType);
      licenseStatus(generateLicenseSearchNameAndAddress({}), licenseType);
      expect(stubDynamicsSearchLicenseStatus).toHaveBeenCalled();
      expect(stubWebServiceSearchLicenseStatus).not.toHaveBeenCalled();
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
