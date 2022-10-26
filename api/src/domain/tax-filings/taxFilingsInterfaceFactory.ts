import { UserData } from "@shared/userData";
import { TaxFilingClient, TaxFilingInterface } from "../types";

type taxFilingInterfaceRequest = {
  userData: UserData;
  taxId: string;
  businessName: string;
};

export const taxFilingsInterfaceFactory = (apiTaxFilingClient: TaxFilingClient): TaxFilingInterface => {
  const lookup = async (request: taxFilingInterfaceRequest): Promise<UserData> => {
    const { state, filings } = await apiTaxFilingClient.lookup(request.taxId, request.businessName);
    return {
      ...request.userData,
      taxFilingData: {
        ...request.userData.taxFilingData,
        businessName: request.businessName,
        lastUpdatedISO: new Date(Date.now()).toISOString(),
        state,
        filings: state == "SUCCESS" ? filings : request.userData.taxFilingData.filings,
      },
    };
  };

  const onboarding = async (request: taxFilingInterfaceRequest): Promise<UserData> => {
    const userData = await lookup(request);
    if (userData.taxFilingData.state === "UNREGISTERED") {
      const response = await apiTaxFilingClient.onboarding(
        request.taxId,
        userData.user.email,
        request.businessName
      );
      return {
        ...userData,
        taxFilingData: {
          ...userData.taxFilingData,
          businessName: request.businessName,
          lastUpdatedISO: new Date(Date.now()).toISOString(),
          registered: ["SUCCESS", "PENDING"].includes(response.state),
          errorField: response.errorField,
          state: response.state == "SUCCESS" ? "PENDING" : response.state,
        },
      };
    } else {
      return {
        ...userData,
        taxFilingData: {
          ...userData.taxFilingData,
          registered: ["SUCCESS", "PENDING"].includes(userData.taxFilingData.state ?? ""),
        },
      };
    }
  };

  return { lookup, onboarding };
};
