import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/businessNameSearch";
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
  onBlurNameField: (value: string) => void;
  searchBusinessName: (
    event?: FormEvent<HTMLFormElement>
  ) => Promise<{ nameAvailability: NameAvailability; submittedName: string }>;
  setCurrentName: (name: string) => void;
  resetSearch: () => void;
} => {
  const { userData } = useUserData();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const [currentName, setCurrentName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SearchBusinessNameError | undefined>(undefined);
  const [updateButtonClicked, setUpdateButtonClicked] = useState<boolean>(false);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setCurrentName(isDba ? userData.profileData.nexusDbaName || "" : userData.profileData.businessName);
    if (
      userData.formationData.formationFormData.businessNameAvailability.status !== "AVAILABLE" &&
      userData.formationData.formationFormData.hasBusinessNameBeenSearched
    ) {
      setFieldsInteracted(["businessName"]);
    }
  }, userData);

  const updateCurrentName = (value: string): void => {
    setCurrentName(value);
  };

  const onBlurNameField = (): void => {
    setFormationFormData({
      ...state.formationFormData,
      businessName: currentName,
      businessNameAvailability: { similarNames: [], status: undefined },
    });
  };

  const resetSearch = () => {
    setFormationFormData({
      ...state.formationFormData,
      businessNameAvailability: { similarNames: [], status: undefined },
    });
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

    const resetState = () => {
      setFormationFormData({
        ...state.formationFormData,
        businessNameAvailability: { similarNames: [], status: undefined },
      });
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
        setFormationFormData({
          ...state.formationFormData,
          businessNameAvailability: result,
          businessName: currentName,
          hasBusinessNameBeenSearched: true,
        });
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
    onBlurNameField,
    searchBusinessName,
    resetSearch,
  };
};
