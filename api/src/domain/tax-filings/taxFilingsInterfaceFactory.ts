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
      const registered = ["SUCCESS", "PENDING"].includes(response.state);
      return {
        ...userData,
        taxFilingData: {
          ...userData.taxFilingData,
          businessName: request.businessName,
          lastUpdatedISO: new Date(Date.now()).toISOString(),
          registeredISO: registered ? new Date(Date.now()).toISOString() : undefined,
          errorField: response.errorField,
          state: response.state == "SUCCESS" ? "PENDING" : response.state,
        },
      };
    } else {
      const registered = ["SUCCESS", "PENDING"].includes(userData.taxFilingData.state ?? "");
      return {
        ...userData,
        taxFilingData: {
          ...userData.taxFilingData,
          registeredISO:
            userData.taxFilingData.registeredISO ??
            (registered ? new Date(Date.now()).toISOString() : undefined),
        },
      };
    }
  };

  return { lookup, onboarding };
};
