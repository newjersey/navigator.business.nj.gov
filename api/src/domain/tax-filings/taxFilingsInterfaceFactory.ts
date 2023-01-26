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
      preferences: {
        ...request.userData.preferences,
        isCalendarFullView: state === "SUCCESS" ? true : request.userData.preferences.isCalendarFullView,
      },
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
    const response = await apiTaxFilingClient.onboarding(
      request.taxId,
      request.userData.user.email,
      request.businessName
    );

    switch (response.state) {
      case "PENDING": {
        return {
          ...request.userData,
          taxFilingData: {
            ...request.userData.taxFilingData,
            lastUpdatedISO: new Date(Date.now()).toISOString(),
            registeredISO: new Date(Date.now()).toISOString(),
            errorField: response.errorField,
            state: response.state,
            businessName: request.businessName,
          },
        };
      }
      case "SUCCESS": {
        return await lookup(request);
      }

      case "API_ERROR":
      case "FAILED": {
        return {
          ...request.userData,
          taxFilingData: {
            ...request.userData.taxFilingData,
            registeredISO: undefined,
            state: response.state,
            errorField: response.errorField,
            businessName: request.businessName,
          },
        };
      }

      default: {
        return {
          ...request.userData,
          taxFilingData: {
            ...request.userData.taxFilingData,
            registeredISO: undefined,
            state: response.state,
            errorField: response.errorField,
            businessName: request.businessName,
          },
        };
      }
    }
  };

  return { lookup, onboarding };
};
