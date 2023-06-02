import { UserData } from "@businessnjgovnavigator/shared/";

export const isGetFilingResponseSuccussful = (userData: UserData | undefined): boolean => {
  return !!userData?.formationData.getFilingResponse?.success;
};
