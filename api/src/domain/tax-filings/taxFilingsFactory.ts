import { UserData } from "@shared/userData";
import { ApiTaxFilingClient, TaxFilingClient, UserDataClient } from "../types";

export const taxFilingsFactory = (
  userDataClient: UserDataClient,
  taxFilingClient: ApiTaxFilingClient
): TaxFilingClient => {
  const lookup = async (props: {
    userId: string;
    taxId: string;
    businessName: string;
  }): Promise<UserData> => {
    let userData = await userDataClient.get(props.userId);
    const response = await taxFilingClient.lookup(props.taxId, props.businessName);
    userData =
      response.state == "SUCCESS"
        ? { ...userData, taxFilingData: { ...userData.taxFilingData, ...response } }
        : { ...userData, taxFilingData: { ...userData.taxFilingData, state: response.state } };
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
      const response = await taxFilingClient.onboarding(props.taxId, userData.user.email, props.businessName);
      userData =
        response.state == "SUCCESS"
          ? { ...userData, taxFilingData: { ...userData.taxFilingData, state: "PENDING" } }
          : { ...userData, taxFilingData: { ...userData.taxFilingData, state: response.state } };
    }
    return userData;
  };

  return { lookup, onboarding };
};
