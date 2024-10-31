import { Business } from "@businessnjgovnavigator/shared/userData";
import dayjs from "dayjs";

export const isLicenseDataFromDatabaseDataMoreRecent = ({
  businessFromDb,
  businessFromUpdateQueue,
}: {
  businessFromDb: Business;
  businessFromUpdateQueue: Business;
}): boolean => {
  if (typeof businessFromDb.licenseData !== typeof businessFromUpdateQueue.licenseData) return true;

  const bothBusinessesHaveLicenseData =
    !!businessFromDb?.licenseData?.lastUpdatedISO && !!businessFromUpdateQueue?.licenseData?.lastUpdatedISO;

  if (bothBusinessesHaveLicenseData) {
    const dateFromDb = dayjs(businessFromDb?.licenseData?.lastUpdatedISO);
    const dateFromUpdateQueue = dayjs(businessFromUpdateQueue?.licenseData?.lastUpdatedISO);
    return dateFromDb.diff(dateFromUpdateQueue) > 0;
  }
  return false;
};
