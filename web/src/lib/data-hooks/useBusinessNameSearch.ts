import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/businessNameSearch";
import { FormEvent, useState } from "react";

export const useBusinessNameSearch = ({
  isBusinessFormation,
  isDba,
}: {
  isBusinessFormation: boolean;
  isDba: boolean;
}): {
  currentName: string;
  submittedName: string;
  isNameFieldEmpty: boolean;
  isLoading: boolean;
  error: SearchBusinessNameError | undefined;
  nameAvailability: NameAvailability | undefined;
  updateButtonClicked: boolean;
  updateCurrentName: (value: string) => void;
  onBlurNameField: (value: string) => void;
  searchBusinessName: (
    event?: FormEvent<HTMLFormElement>
  ) => Promise<{ nameAvailability: NameAvailability; submittedName: string }>;
  updateNameOnProfile: () => void;
  setCurrentName: (name: string) => void;
  resetSearch: () => void;
} => {
  const { userData, update } = useUserData();
  const [currentName, setCurrentName] = useState<string>("");
  const [submittedName, setSubmittedName] = useState<string>("");
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SearchBusinessNameError | undefined>(undefined);
  const [updateButtonClicked, setUpdateButtonClicked] = useState<boolean>(false);
  const [isNameFieldEmpty, setIsNameFieldEmpty] = useState<boolean>(false);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setCurrentName(isDba ? userData.profileData.nexusDbaName || "" : userData.profileData.businessName);
  }, userData);

  const updateCurrentName = (value: string): void => {
    setCurrentName(value);
    setNameAvailability(undefined);
  };

  const onBlurNameField = (value: string): void => {
    setIsNameFieldEmpty(value.length === 0);
  };

  const resetSearch = () => {
    setNameAvailability(undefined);
    setUpdateButtonClicked(false);
    setError(undefined);
    setCurrentName("");
    setIsNameFieldEmpty(true);
  };

  const searchBusinessName = async (
    event?: FormEvent<HTMLFormElement>
  ): Promise<{ nameAvailability: NameAvailability; submittedName: string }> => {
    if (event) {
      event.preventDefault();
    }

    const resetState = () => {
      setNameAvailability(undefined);
      setUpdateButtonClicked(false);
      setError(undefined);
    };

    if (!currentName) {
      if (isBusinessFormation) {
        setIsNameFieldEmpty(true);
      } else {
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
        setSubmittedName(currentName);
        setIsLoading(false);
        setNameAvailability(result);
        return { nameAvailability: result, submittedName: currentName };
      })
      .catch((error) => {
        resetState();
        setIsLoading(false);
        if (error === 400) {
          setError("BAD_INPUT");
        } else {
          setError("SEARCH_FAILED");
        }
        throw new Error("ERROR");
      });
  };

  const updateNameOnProfile = (): void => {
    if (!userData) {
      return;
    }
    setUpdateButtonClicked(true);
    const newData = isDba ? { nexusDbaName: submittedName } : { businessName: submittedName };
    update({
      ...userData,
      profileData: {
        ...userData.profileData,
        ...newData,
      },
    });
  };

  return {
    currentName,
    submittedName,
    isNameFieldEmpty,
    isLoading,
    error,
    nameAvailability,
    updateButtonClicked,
    setCurrentName,
    updateCurrentName,
    onBlurNameField,
    searchBusinessName,
    updateNameOnProfile,
    resetSearch,
  };
};
