import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability, SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";

export const useBusinessNameSearch = (
  isBusinessFormation: boolean
): {
  currentName: string;
  submittedName: string;
  isNameFieldEmpty: boolean;
  isLoading: boolean;
  error: SearchBusinessNameError | undefined;
  nameAvailability: NameAvailability | undefined;
  updateButtonClicked: boolean;
  updateCurrentName: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlurNameField: (event: FocusEvent<HTMLInputElement>) => void;
  searchBusinessName: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  updateNameOnProfile: () => void;
  setCurrentName: (name: string) => void;
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
    if (!userData) return;
    setCurrentName(userData.profileData.businessName);
  }, userData);

  const updateCurrentName = (event: ChangeEvent<HTMLInputElement>): void => {
    setCurrentName(event.target.value);
  };

  const onBlurNameField = (event: FocusEvent<HTMLInputElement>): void => {
    setIsNameFieldEmpty(event.target.value.length === 0);
  };

  const searchBusinessName = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setNameAvailability(undefined);
    setUpdateButtonClicked(false);
    setError(undefined);

    if (!currentName) {
      if (isBusinessFormation) {
        setIsNameFieldEmpty(true);
      } else {
        setError("BAD_INPUT");
      }
      return;
    }

    setIsLoading(true);
    analytics.event.task_business_name_check_availability.submit.view_business_name_availability();
    api
      .searchBusinessName(currentName)
      .then((result: NameAvailability) => {
        setSubmittedName(currentName);
        setIsLoading(false);
        setNameAvailability(result);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error === 400) {
          setError("BAD_INPUT");
        } else {
          setError("SEARCH_FAILED");
        }
      });
  };

  const updateNameOnProfile = (): void => {
    if (!userData) return;
    setUpdateButtonClicked(true);
    update({
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: submittedName,
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
  };
};
