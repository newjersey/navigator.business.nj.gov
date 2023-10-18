import { SearchLicenseStatus } from "@domain/types";

export const searchLicenseStatusFactory = (
  legacySearchLicenseStatus: SearchLicenseStatus,
  newSearchLicenseStatus: SearchLicenseStatus
) => {
  return (licenseType: string): SearchLicenseStatus => {
    const useNewSearchLicenseStatus = (): boolean =>
      licenseType === "Public Movers and Warehousemen" &&
      process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS === "true";

    if (useNewSearchLicenseStatus()) {
      return newSearchLicenseStatus;
    }

    return legacySearchLicenseStatus;
  };
};
