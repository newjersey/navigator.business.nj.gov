import { BusinessNameClient, TimeStampBusinessSearch } from "@domain/types";
import { NameAvailability, NameAvailabilityResponse } from "@shared/businessNameSearch";
import { getCurrentDateISOString } from "@shared/dateHelpers";

export const timeStampBusinessSearch = (businessNameClient: BusinessNameClient): TimeStampBusinessSearch => {
  const search = async (businessName: string): Promise<NameAvailability> => {
    const result = await businessNameClient.search(businessName).then((result: NameAvailabilityResponse) => {
      return {
        ...result,
        similarNames: result.similarNames.slice(0, 10),
      };
    });

    return {
      ...result,
      lastUpdatedTimeStamp: getCurrentDateISOString(),
    };
  };
  return { search };
};
