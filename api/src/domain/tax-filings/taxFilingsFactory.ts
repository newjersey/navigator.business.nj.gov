import { UserData } from "@shared/userData";
import { ApiTaxFilingClient, TaxFilingClient, UserDataClient } from "../types";

export const taxFilingsFactory = (
  userDataClient: UserDataClient,
  apiTaxFilingClient: ApiTaxFilingClient
): TaxFilingClient => {
  const lookup = async (props: {
    userId: string;
    taxId: string;
    businessName: string;
  }): Promise<UserData> => {
    let userData = await userDataClient.get(props.userId);
    const response = await apiTaxFilingClient.lookup(props.taxId, props.businessName);
    userData =
      response.state == "SUCCESS"
        ? {
            ...userData,
            taxFilingData: {
              ...userData.taxFilingData,
              businessName: props.businessName,
              lastUpdated: new Date(Date.now()).toISOString(),
              ...response,
            },
          }
        : {
            ...userData,
            taxFilingData: {
              ...userData.taxFilingData,
              businessName: props.businessName,
              lastUpdated: new Date(Date.now()).toISOString(),
              state: response.state,
            },
          };
    return userData;
  };

  const onboarding = async (props: {
    userId: string;
    taxId: string;
    businessName: string;
  }): Promise<UserData> => {
    let userData = await lookup({
      userId: props.userId,
      taxId: props.taxId,
      businessName: props.businessName,
    });
    if (userData.taxFilingData.state === "FAILED") {
      const response = await apiTaxFilingClient.onboarding(
        props.taxId,
        userData.user.email,
        props.businessName
      );
      userData =
        response.state == "SUCCESS"
          ? {
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                businessName: props.businessName,
                lastUpdated: new Date(Date.now()).toISOString(),
                state: "PENDING",
              },
            }
          : {
              ...userData,
              taxFilingData: {
                ...userData.taxFilingData,
                businessName: props.businessName,
                lastUpdated: new Date(Date.now()).toISOString(),
                state: response.state,
              },
            };
    }
    return userData;
  };

  return { lookup, onboarding };
};
