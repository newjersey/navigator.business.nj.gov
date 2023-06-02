import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/";
import { FormEvent, useContext, useState } from "react";

export const useBusinessNameSearch = ({
  isBusinessFormation,
  isDba,
}: {
  isBusinessFormation: boolean;
  isDba: boolean;
}): {
  currentName: string;
  isLoading: boolean;
  error: SearchBusinessNameError | undefined;
  updateButtonClicked: boolean;
  updateCurrentName: (value: string) => void;
  onChangeNameField: (value: string) => void;
  onBlurNameField: (value: string) => void;
  searchBusinessName: (
    event?: FormEvent<HTMLFormElement>
  ) => Promise<{ nameAvailability: NameAvailability; submittedName: string }>;
  setCurrentName: (name: string) => void;
  resetSearch: () => void;
} => {
  const { business } = useUserData();
  const {
    state,
    setFormationFormData,
    setFieldsInteracted,
    setBusinessNameAvailability,
    setDbaBusinessNameAvailability,
  } = useContext(BusinessFormationContext);
  const [currentName, setCurrentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SearchBusinessNameError | undefined>(undefined);
  const [updateButtonClicked, setUpdateButtonClicked] = useState<boolean>(false);

  const businessNameHasBeenSearched = (): boolean => {
    return business?.formationData.businessNameAvailability !== undefined;
  };

  const businessNameIsNotAvailable = (): boolean => {
    return business?.formationData.businessNameAvailability?.status !== "AVAILABLE";
  };

  const setNameAvailability = isDba ? setDbaBusinessNameAvailability : setBusinessNameAvailability;

  const emptyNameAvailability: NameAvailability = {
    similarNames: [],
    status: undefined,
    lastUpdatedTimeStamp: "",
  };

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setCurrentName(isDba ? business.profileData.nexusDbaName || "" : business.profileData.businessName);
    if (businessNameIsNotAvailable() && businessNameHasBeenSearched()) {
      setFieldsInteracted(["businessName"]);
    }
  }, business);

  const updateCurrentName = (value: string): void => {
    setCurrentName(value);
  };

  const onChangeNameField = (value: string): void => {
    updateCurrentName(value);
    setNameAvailability(emptyNameAvailability);
  };

  const onBlurNameField = (): void => {
    setFormationFormData({
      ...state.formationFormData,
      businessName: currentName,
    });
    setNameAvailability(emptyNameAvailability);
  };

  const resetSearch = (): void => {
    setBusinessNameAvailability(emptyNameAvailability);
    setDbaBusinessNameAvailability(emptyNameAvailability);
    setUpdateButtonClicked(false);
    setError(undefined);
    setCurrentName("");
  };

  const searchBusinessName = async (
    event?: FormEvent<HTMLFormElement>
  ): Promise<{ nameAvailability: NameAvailability; submittedName: string }> => {
    if (event) {
      event.preventDefault();
    }

    const resetState = (): void => {
      setNameAvailability(emptyNameAvailability);
      setUpdateButtonClicked(false);
      setError(undefined);
    };

    if (!currentName) {
      if (!isBusinessFormation) {
        setError("BAD_INPUT");
      }
      throw new Error("ERROR");
    }

    setIsLoading(true);
    analytics.event.task_business_name_check_availability.submit.view_business_name_availability();
    return api
      .searchBusinessName(currentName)
      .then((result: NameAvailability) => {
        resetState();
        setIsLoading(false);
        if (!isDba) {
          setFormationFormData({
            ...state.formationFormData,
            businessName: currentName,
          });
        }
        setNameAvailability({ ...result });
        return { nameAvailability: result, submittedName: currentName };
      })
      .catch((api_error) => {
        resetState();
        setIsLoading(false);
        if (api_error === 400) {
          setError("BAD_INPUT");
        } else {
          setError("SEARCH_FAILED");
        }
        throw new Error("ERROR");
      });
  };

  return {
    currentName,
    isLoading,
    error,
    updateButtonClicked,
    setCurrentName,
    updateCurrentName,
    onChangeNameField,
    onBlurNameField,
    searchBusinessName,
    resetSearch,
  };
};
