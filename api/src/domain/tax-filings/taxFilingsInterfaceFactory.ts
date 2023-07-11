import { Business } from "@shared/business";
import { getCurrentBusinessForUser, getUserDataWithUpdatedCurrentBusiness } from "@shared/businessHelpers";
import { UserDataPrime } from "@shared/userData";
import dayjs from "dayjs";
import { TaxFilingClient, TaxFilingInterface } from "../types";
import { fetchMunicipalityByName } from "../user/fetchMunicipalityByName";

type taxFilingInterfaceRequest = {
  userData: UserDataPrime;
  taxId: string;
  businessName: string;
};

const isThisYear = (dueDate: string): boolean => {
  return dayjs(dueDate).isSame(dayjs(), "year");
};

export const taxFilingsInterfaceFactory = (apiTaxFilingClient: TaxFilingClient): TaxFilingInterface => {
  const lookup = async (request: taxFilingInterfaceRequest): Promise<UserDataPrime> => {
    const currentBusiness = getCurrentBusinessForUser(request.userData);
    const { state, filings, taxCity, naicsCode } = await apiTaxFilingClient.lookup({
      taxId: request.taxId,
      businessName: request.businessName,
    });

    const shouldSwitchToCalendarGridView = (): boolean => {
      const maxFilingsInCurrentYearListView = 5;
      const prevFilingsThisYear = currentBusiness.taxFilingData.filings.filter((it) =>
        isThisYear(it.dueDate)
      );
      const prevFilingsCountBelowMax = prevFilingsThisYear.length <= maxFilingsInCurrentYearListView;

      const newFilingsThisYear = filings.filter((it) => isThisYear(it.dueDate));
      const newFilingsAboveMax = newFilingsThisYear.length > maxFilingsInCurrentYearListView;
      return state === "SUCCESS" && prevFilingsCountBelowMax && newFilingsAboveMax;
    };

    const now = new Date(Date.now()).toISOString();
    let profileDataToReturn = currentBusiness.profileData;

    if (naicsCode) {
      profileDataToReturn = {
        ...currentBusiness.profileData,
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

    const updatedBusiness: Business = {
      ...currentBusiness,
      profileData: profileDataToReturn,
      preferences: {
        ...currentBusiness.preferences,
        isCalendarFullView: shouldSwitchToCalendarGridView()
          ? true
          : currentBusiness.preferences.isCalendarFullView,
      },
      taxFilingData: {
        ...currentBusiness.taxFilingData,
        businessName: request.businessName,
        lastUpdatedISO: now,
        registeredISO: state === "SUCCESS" ? currentBusiness.taxFilingData.registeredISO ?? now : undefined,
        errorField: state === "SUCCESS" ? undefined : currentBusiness.taxFilingData.errorField,
        state: state,
        filings: state === "SUCCESS" ? filings : currentBusiness.taxFilingData.filings,
      },
    };
    return getUserDataWithUpdatedCurrentBusiness(request.userData, updatedBusiness);
  };

  const onboarding = async (request: taxFilingInterfaceRequest): Promise<UserDataPrime> => {
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
        const previousBusiness = getCurrentBusinessForUser(request.userData);
        const updatedBusiness: Business = {
          ...previousBusiness,
          taxFilingData: {
            ...previousBusiness.taxFilingData,
            registeredISO: undefined,
            state: response.state,
            errorField: response.errorField,
            businessName: request.businessName,
          },
        };
        return getUserDataWithUpdatedCurrentBusiness(request.userData, updatedBusiness);
      }
    }
  };

  return { lookup, onboarding };
};
