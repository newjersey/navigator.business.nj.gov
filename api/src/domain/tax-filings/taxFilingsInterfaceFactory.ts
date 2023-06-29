import { UserData } from "@shared/userData";
import dayjs from "dayjs";
import { TaxFilingClient, TaxFilingInterface } from "../types";
import { fetchMunicipalityByName } from "../user/fetchMunicipalityByName";

type taxFilingInterfaceRequest = {
  userData: UserData;
  taxId: string;
  businessName: string;
};

const isThisYear = (dueDate: string): boolean => {
  return dayjs(dueDate).isSame(dayjs(), "year");
};

export const taxFilingsInterfaceFactory = (apiTaxFilingClient: TaxFilingClient): TaxFilingInterface => {
  const lookup = async (request: taxFilingInterfaceRequest): Promise<UserData> => {
    const { state, filings, taxCity, naicsCode } = await apiTaxFilingClient.lookup({
      taxId: request.taxId,
      businessName: request.businessName,
    });

    const shouldSwitchToCalendarGridView = (): boolean => {
      const maxFilingsInCurrentYearListView = 5;
      const prevFilingsThisYear = request.userData.taxFilingData.filings.filter((it) =>
        isThisYear(it.dueDate)
      );
      const prevFilingsCountBelowMax = prevFilingsThisYear.length <= maxFilingsInCurrentYearListView;

      const newFilingsThisYear = filings.filter((it) => isThisYear(it.dueDate));
      const newFilingsAboveMax = newFilingsThisYear.length > maxFilingsInCurrentYearListView;
      return state === "SUCCESS" && prevFilingsCountBelowMax && newFilingsAboveMax;
    };

    const now = new Date(Date.now()).toISOString();
    let profileDataToReturn = request.userData.profileData;

    if (naicsCode) {
      profileDataToReturn = {
        ...request.userData.profileData,
        naicsCode: naicsCode,
      };
    }

    if (taxCity) {
      const record = await fetchMunicipalityByName(taxCity);
      if (record) {
        profileDataToReturn = {
          ...profileDataToReturn,
          municipality: {
            name: record.townName,
            county: record.countyName,
            id: record.id,
            displayName: record.townDisplayName,
          },
        };
      }
    }
    return {
      ...request.userData,
      profileData: profileDataToReturn,
      preferences: {
        ...request.userData.preferences,
        isCalendarFullView: shouldSwitchToCalendarGridView()
          ? true
          : request.userData.preferences.isCalendarFullView,
      },
      taxFilingData: {
        ...request.userData.taxFilingData,
        businessName: request.businessName,
        lastUpdatedISO: now,
        registeredISO: state === "SUCCESS" ? request.userData.taxFilingData.registeredISO ?? now : undefined,
        errorField: state === "SUCCESS" ? undefined : request.userData.taxFilingData.errorField,
        state: state,
        filings: state === "SUCCESS" ? filings : request.userData.taxFilingData.filings,
      },
    };
  };

  const onboarding = async (request: taxFilingInterfaceRequest): Promise<UserData> => {
    const response = await apiTaxFilingClient.onboarding({
      taxId: request.taxId,
      email: request.userData.user.email,
      businessName: request.businessName,
    });

    switch (response.state) {
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
    }
  };

  return { lookup, onboarding };
};
