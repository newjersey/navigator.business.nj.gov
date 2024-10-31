import { LicenseName, LicenseStatus, LicenseStatusItem, taskIdLicenseNameMapping } from "../license";
import { Business, TaskProgress } from "../userData";

export const getNonLicenseTasks = (business: Business): Record<string, TaskProgress> =>
  Object.fromEntries(
    Object.entries(business.taskProgress).filter(
      ([key]) => !Object.keys(taskIdLicenseNameMapping).includes(key)
    )
  );
export type LicenseChecklistResponse = {
  licenseStatus: LicenseStatus;
  expirationDateISO: string | undefined;
  checklistItems: LicenseStatusItem[];
  professionNameAndLicenseType: string;
};
export type LicenseStatusResults = Partial<
  Record<LicenseName, Omit<LicenseChecklistResponse, "professionNameAndLicenseType">>
>;
export const getLicenseTasksProgress = (
  licenseStatusResult: LicenseStatusResults
): Record<string, TaskProgress> => {
  // const licenseTasksProgress: Record<string, TaskProgress> = {};
  // for (const licenseName of Object.keys(licenseStatusResult) as LicenseName[]) {
  //   const taskId = Object.keys(taskIdLicenseNameMapping).find(
  //     (taskId) => taskIdLicenseNameMapping[taskId as keyof typeof taskIdLicenseNameMapping] === licenseName
  //   );
  //   let taskStatus: TaskProgress = "NOT_STARTED";
  //   if (licenseStatusResult[licenseName]!.licenseStatus === "ACTIVE") {
  //     taskStatus = "COMPLETED";
  //   } else if (licenseStatusResult[licenseName]!.licenseStatus === "PENDING") {
  //     taskStatus = "IN_PROGRESS";
  //   }
  //   if (taskId !== undefined) licenseTasksProgress[taskId] = taskStatus;
  // }

  const licenseTasksProgress: Record<string, TaskProgress> = {};
  for (const licenseName of Object.keys(licenseStatusResult) as LicenseName[]) {
    const taskId = Object.keys(taskIdLicenseNameMapping).find(
      (taskId) => taskIdLicenseNameMapping[taskId as keyof typeof taskIdLicenseNameMapping] === licenseName
    );
    if (taskId === undefined) {
      continue;
    }
    let taskStatus: TaskProgress = "NOT_STARTED";
    if (licenseStatusResult[licenseName]!.licenseStatus === "ACTIVE") {
      taskStatus = "COMPLETED";
    } else if (licenseStatusResult[licenseName]!.licenseStatus === "PENDING") {
      taskStatus = "IN_PROGRESS";
    }
    licenseTasksProgress[taskId] = taskStatus;
  }

  return licenseTasksProgress;
};
