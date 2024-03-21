import { SearchLicenseStatus } from "@domain/types";

export const searchLicenseStatusFactory = (
  webservice: SearchLicenseStatus,
  dynamics: SearchLicenseStatus
) => {
  return (licenseType: string): SearchLicenseStatus => {
    const featureFlags: Record<string, boolean> = {
      publicMovers: process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS === "true",
      healthCareServices: process.env.FEATURE_DYNAMICS_HEALTH_CARE_SERVICES === "true",
    };

    const licenseTypesUsingDynamicsSearch: Record<string, boolean> = {
      "Public Movers and Warehousemen": featureFlags.publicMovers,
      "Health Care Services": featureFlags.healthCareServices,
    };

    const shouldUseDynamicsSearch = licenseTypesUsingDynamicsSearch[licenseType] || false;

    return shouldUseDynamicsSearch ? dynamics : webservice;
  };
};
