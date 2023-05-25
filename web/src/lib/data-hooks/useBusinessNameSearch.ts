import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { NameAvailability, UserData } from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
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
  setBusinessName: (
    submittedName: string,
    nameAvailability: NameAvailability,
    isDbaOverride?: boolean
  ) => Promise<void>;
  setNameAvailability: React.Dispatch<React.SetStateAction<NameAvailability | undefined>>;
  resetSearch: () => void;
} => {
  const { userData, update } = useUserData();
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
  const emptyNameAvailability: NameAvailability = {
    similarNames: [],
    status: undefined,
    lastUpdatedTimeStamp: "",
  };
  const FIELD_NAME = "businessName";

  const setNameAvailability = isDba ? setDbaBusinessNameAvailability : setBusinessNameAvailability;
  const nameHasBeenSearched = (): boolean => {
    if (isDba) {
      return userData?.formationData.dbaBusinessNameAvailability !== undefined;
    } else {
      return userData?.formationData.businessNameAvailability !== undefined;
    }
  };

  const nameIsNotAvailable = (): boolean => {
    if (isDba) {
      return userData?.formationData.dbaBusinessNameAvailability?.status !== "AVAILABLE";
    } else {
      return userData?.formationData.businessNameAvailability?.status !== "AVAILABLE";
    }
  };

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    setCurrentName(isDba ? userData.profileData.nexusDbaName || "" : userData.profileData.businessName);
    if (nameIsNotAvailable() && nameHasBeenSearched()) {
      setFieldsInteracted([FIELD_NAME]);
    }
  }, userData);

  const updateCurrentName = (value: string): void => {
    setCurrentName(value);
  };

  const onBlurNameField = (value: string): void => {
    if (value !== state.formationFormData.businessName) {
      setFormationFormData({
        ...state.formationFormData,
        businessName: currentName,
      });
      setNameAvailability(emptyNameAvailability);
    }
    setFieldsInteracted([FIELD_NAME]);
  };

  const resetSearch = (): void => {
    setBusinessNameAvailability(emptyNameAvailability);
    setDbaBusinessNameAvailability(emptyNameAvailability);
    setUpdateButtonClicked(false);
    setError(undefined);
    setCurrentName("");
    setBusinessName("", emptyNameAvailability);
    setBusinessName("", emptyNameAvailability, !isDba);
  };

  const setBusinessName = async (
    submittedName: string,
    nameAvailability: NameAvailability,
    isDbaOverride?: boolean
  ): Promise<void> => {
    if (!userData) return;

    let newUserData: UserData | undefined;
    if (isDbaOverride ?? isDba) {
      newUserData = {
        ...userData,
        profileData: {
          ...userData.profileData,
          nexusDbaName: submittedName,
          needsNexusDbaName: true,
        },
      };
    } else {
      if (nameAvailability.status === "AVAILABLE") {
        newUserData = {
          ...userData,
          formationData: {
            ...userData.formationData,
            formationFormData: {
              ...userData.formationData.formationFormData,
              businessName: submittedName,
            },
          },
          profileData: {
            ...userData.profileData,
            businessName: submittedName,
            nexusDbaName: emptyProfileData.nexusDbaName,
            needsNexusDbaName: emptyProfileData.needsNexusDbaName,
          },
        };
      } else if (nameAvailability.status === "UNAVAILABLE") {
        newUserData = {
          ...userData,
          formationData: {
            ...userData.formationData,
            formationFormData: {
              ...userData.formationData.formationFormData,
              businessName: submittedName,
            },
          },
          profileData: {
            ...userData.profileData,
            businessName: submittedName,
            needsNexusDbaName: true,
          },
        };
      }
    }

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        ...newUserData?.formationData.formationFormData,
      };
    });

    await update(newUserData);
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

    setFieldsInteracted([FIELD_NAME]);

    setIsLoading(true);
    analytics.event.task_business_name_check_availability.submit.view_business_name_availability();
    return api
      .searchBusinessName(currentName)
      .then((result: NameAvailability) => {
        resetState();
        setIsLoading(false);
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
    setBusinessName,
    setCurrentName,
    updateCurrentName,
    onBlurNameField,
    searchBusinessName,
    setNameAvailability,
    resetSearch,
  };
};
