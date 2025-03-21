import { TaxFilingClient, TaxFilingInterface } from "@domain/types";
import { fetchMunicipalityByName } from "@domain/user/fetchMunicipalityByName";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";

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
    const currentBusiness = getCurrentBusiness(request.userData);
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

    return modifyCurrentBusiness(request.userData, (business) => ({
      ...business,
      profileData: profileDataToReturn,
      preferences: {
        ...business.preferences,
        isCalendarFullView: shouldSwitchToCalendarGridView() ? true : business.preferences.isCalendarFullView,
      },
      taxFilingData: {
        ...business.taxFilingData,
        businessName: request.businessName,
        lastUpdatedISO: now,
        registeredISO: state === "SUCCESS" ? business.taxFilingData.registeredISO ?? now : undefined,
        errorField: state === "SUCCESS" ? undefined : business.taxFilingData.errorField,
        state: state,
        filings: state === "SUCCESS" ? filings : business.taxFilingData.filings,
      },
    }));
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
        return modifyCurrentBusiness(request.userData, (business) => ({
          ...business,
          taxFilingData: {
            ...business.taxFilingData,
            registeredISO: undefined,
            state: response.state,
            errorField: response.errorField,
            businessName: request.businessName,
          },
        }));
      }
    }
  };

  return { lookup, onboarding };
};
