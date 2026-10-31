import axios from "axios";

// Instructions to use
// --------------------------------
// Reference the Dynamics documentation in Google Drive for information on AUTH_TOKEN and LICENSE_TYPE
// Enter a AUTH_TOKEN (get one using postman) and LICENSE_TYPE
// Adjust APPLICATION_QUERY_COUNT if necessary
// Run yarn ts-node dynamicsMultipleApplications.ts

const AUTH_TOKEN = "";
const LICENSE_TYPE = "";
const DYNAMICS_URL = "";
const APPLICATION_QUERY_COUNT = 100000;

interface DynamicsApplication {
  rgb_number: string | null;
  statecode: number;
  rgb_applicationid: string;
}

interface DynamicsApplicationWithBusiness extends DynamicsApplication {
  _rgb_businessid_value: string;
}

interface BusinessWithValidMainApps {
  business: string;
  applicationIds: string[];
}

const getApplicationsByType = async (): Promise<DynamicsApplicationWithBusiness[]> => {
  const response = await axios.get<{ value: DynamicsApplicationWithBusiness[] }>(
    `${DYNAMICS_URL}/api/data/v9.2/rgb_applications?$select=rgb_number,statecode,rgb_applicationid, _rgb_businessid_value&$filter=(statecode eq 0 and _rgb_apptypeid_value eq ${LICENSE_TYPE})&$top=${APPLICATION_QUERY_COUNT}`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    },
  );
  return response.data.value;
};

const getApplicationsByBusinessId = async (businessId: string): Promise<DynamicsApplication[]> => {
  const response = await axios.get<{ value: DynamicsApplication[] }>(
    `${DYNAMICS_URL}/api/data/v9.2/rgb_applications?$select=rgb_number,statecode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${businessId} and _rgb_apptypeid_value eq ${LICENSE_TYPE})&$top=50`,
    {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    },
  );
  return response.data.value;
};

const getBusinessWithValidMainApps = async (
  allApplicationsInTheSystem: DynamicsApplicationWithBusiness[],
): Promise<BusinessWithValidMainApps[]> => {
  const businessCountRecord: Record<string, number> = {};

  for (const application of allApplicationsInTheSystem) {
    businessCountRecord[application._rgb_businessid_value] =
      (businessCountRecord[application._rgb_businessid_value] ?? 0) + 1;
  }

  const businessAndValidMainApps: BusinessWithValidMainApps[] = [];

  for (const businessCountRecordKey in businessCountRecord) {
    if ((businessCountRecord[businessCountRecordKey] ?? 0) > 1) {
      const applications = await getApplicationsByBusinessId(businessCountRecordKey);
      const applicationIds: string[] = [];
      for (const app of applications) {
        if (app.statecode === 0 && app.rgb_number && app.rgb_number.slice(-2) === "00") {
          applicationIds.push(app.rgb_number);
        }
      }
      businessAndValidMainApps.push({ business: businessCountRecordKey, applicationIds });
    }
  }

  return businessAndValidMainApps;
};

const getBusinessesWithMultipleValidMainApps = async (): Promise<void> => {
  const allApplicationsInTheSystem = await getApplicationsByType();
  const businessAndValidMainApps = await getBusinessWithValidMainApps(allApplicationsInTheSystem);
  console.log(businessAndValidMainApps.filter((app) => app.applicationIds.length > 1));
};

// CommonJS has no top-level await; a nonzero exit is how callers (CI) see the failure.
getBusinessesWithMultipleValidMainApps().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
