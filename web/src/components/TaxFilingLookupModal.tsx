import { Content } from "@/components/Content";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postTaxRegistrationOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData, UserData } from "@businessnjgovnavigator/shared";
import { Backdrop, CircularProgress } from "@mui/material";
import { ReactElement, useState } from "react";
import { useUserData } from "../lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "../lib/types/types";
import { ModalTwoButton } from "./ModalTwoButton";
import { Alert } from "./njwds-extended/Alert";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
}
export const TaxFilingLookupModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  const fields: ProfileFields[] = ["businessName", "taxId"];

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.taxCalendar.ModalBusinessFieldErrorName,
    taxId: Config.taxCalendar.ModalTaxErrorName,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);

  const getErrors = () => {
    return {
      businessName: { invalid: profileData.businessName.trim().length === 0 },
      taxId: { invalid: profileData.taxId?.trim().length != 12 ?? true },
    };
  };

  const hasErrors = (errors?: Partial<ProfileFieldErrorMap>) => {
    return fields.some((i) => {
      return (errors ?? fieldStates)[i]?.invalid == true;
    });
  };

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { ...fieldStates[field], invalid } });
  };

  const onSubmit = async () => {
    if (!userData) {
      return;
    }
    setOnSubmitClicked(true);
    const errors = getErrors();
    setFieldStates((prev) => {
      return { ...prev, ...errors };
    });
    if (hasErrors(errors)) {
      analytics.event.tax_calendar_modal.submit.tax_calendar_modal_validation_error();
      return;
    }
    setIsLoading(true);
    let userDataToSet: UserData;
    try {
      userDataToSet = await postTaxRegistrationOnboarding({
        taxId: profileData.taxId as string,
        businessName: profileData.businessName,
      });
    } catch {
      setOnAPIfailed("UNKNOWN");
      setIsLoading(false);
      return;
    }
    userDataToSet = {
      ...userDataToSet,
      profileData: { ...userDataToSet.profileData, taxId: profileData.taxId },
    };

    await update(userDataToSet);
    if (userDataToSet.taxFilingData.state == "SUCCESS") {
      setIsLoading(false);
      analytics.event.tax_calendar_modal.submit.tax_deadlines_added_to_calendar();
      props.onSuccess();
    }

    if (userDataToSet.taxFilingData.state == "PENDING") {
      setIsLoading(false);
      analytics.event.tax_calendar_modal.submit.business_exists_but_not_in_Gov2Go();
      props.close();
    }

    if (userDataToSet.taxFilingData.state == "FAILED") {
      setFieldStates((previousState) => {
        return {
          ...fields.reduce(
            (reducer, value) => {
              reducer[value] = { ...reducer[value], invalid: true };
              return reducer;
            },
            { ...previousState }
          ),
        };
      });
      setOnAPIfailed("FAILED");
      analytics.event.tax_calendar_modal.submit.tax_calendar_business_does_not_exist();
      setIsLoading(false);
    }

    if (userDataToSet.taxFilingData.state == "API_ERROR") {
      setOnAPIfailed("UNKNOWN");
      setIsLoading(false);
    }
  };

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const onClose = () => {
    if (!userData) {
      return;
    }
    props.close();
    setProfileData(userData.profileData);
    setOnAPIfailed(undefined);
    setOnSubmitClicked(false);
    setFieldStates(createProfileFieldErrorMap());
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "OWNING",
          municipalities: [],
        },
        setUser: () => {},
        setProfileData,
        onBack: () => {},
      }}
    >
      <Backdrop sx={{ zIndex: 20000 }} open={isLoading}>
        <CircularProgress aria-label="Loading indicator" aria-busy={true} />
      </Backdrop>
      <ModalTwoButton
        isOpen={props.isOpen}
        close={onClose}
        title={Config.taxCalendar.ModalHeader}
        primaryButtonText={Config.taxCalendar.ModalNextButton}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.taxCalendar.ModalPreviousButton}
      >
        {hasErrors() && onSubmitClicked && !apiFailed && (
          <Alert variant={"error"}>
            {Config.taxCalendar.ModalErrorHeader}
            <ul>
              {fields.map((i) => {
                if (fieldStates[i].invalid && errorMessages[i]) {
                  return <li key={i}> {errorMessages[i]}</li>;
                }
              })}
            </ul>
          </Alert>
        )}
        {apiFailed && (
          <Alert variant={"error"}>
            {" "}
            <Content>
              {apiFailed == "FAILED"
                ? Config.taxCalendar.FailedErrorMessageMarkdown
                : Config.taxCalendar.FailedUnknownMarkdown}
            </Content>
          </Alert>
        )}
        <div className="margin-bottom-4">
          <Content>{Config.taxCalendar.ModalBody}</Content>
        </div>
        <FieldLabelModal
          fieldName="businessName"
          overrides={{
            header: Config.taxCalendar.ModalBusinessFieldHeader,
            description: Config.taxCalendar.ModalBusinessFieldMarkdown,
          }}
        />
        <OnboardingBusinessName
          inputErrorBar
          onValidation={onValidation}
          fieldStates={fieldStates}
          validationText={apiFailed == "FAILED" ? Config.taxCalendar.FailedBusinessFieldHelper : undefined}
          disabled={userData?.formationData.completedFilingPayment}
        />
        <FieldLabelModal
          fieldName="businessName"
          overrides={{
            header: Config.taxCalendar.ModalTaxIdHeader,
            description: Config.taxCalendar.ModalTaxIdMarkdown,
          }}
        />
        <OnboardingTaxId
          onValidation={onValidation}
          inputErrorBar
          fieldStates={fieldStates}
          validationText={apiFailed == "FAILED" ? Config.taxCalendar.FailedTaxIdHelper : undefined}
          required
        />
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
