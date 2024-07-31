import { SearchLicenseStatus } from "@domain/types";

export const searchLicenseStatusFactory = (
  webservice: SearchLicenseStatus,
  dynamics: SearchLicenseStatus
) => {
  return (licenseType: string): SearchLicenseStatus => {
    const featureFlags: Record<string, boolean> = {
      publicMovers: process.env.FEATURE_DYNAMICS_PUBLIC_MOVERS === "true",
    };

    const licenseTypesUsingDynamicsSearch: Record<string, boolean> = {
      "Public Movers and Warehousemen": featureFlags.publicMovers,
      "Health Care Services": true,
      "Health Club": true,
      Telemarketing: true,
      "Ticket Brokers": true,
    };

    const shouldUseDynamicsSearch = licenseTypesUsingDynamicsSearch[licenseType] || false;

    return shouldUseDynamicsSearch ? dynamics : webservice;
  };
};
