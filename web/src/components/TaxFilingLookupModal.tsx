import { Content } from "@/components/Content";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { LockedProfileField } from "@/components/onboarding/LockedProfileField";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingResponsibleOwnerName } from "@/components/onboarding/OnboardingResponsibleOwnerName";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postTaxRegistrationOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyProfileData,
  LookupLegalStructureById,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared";
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

  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.taxCalendar.modalBusinessFieldErrorName,
    responsibleOwnerName: Config.taxCalendar.modalResponsibleOwnerFieldErrorName,
    taxId: Config.taxCalendar.modalTaxFieldErrorName,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);

  const isPublicFiling = LookupLegalStructureById(
    userData?.profileData.legalStructureId
  ).requiresPublicFiling;

  const shouldLockFormationFields = userData?.formationData.getFilingResponse?.success;

  const getErrors = (): Partial<ProfileFieldErrorMap> => {
    return {
      businessName: {
        invalid: shouldShowBusinessNameField() ? profileData.businessName.trim().length === 0 : false,
      },
      responsibleOwnerName: {
        invalid: shouldShowResponsibleOwnerField()
          ? profileData.responsibleOwnerName.trim().length === 0
          : false,
      },
      taxId: { invalid: profileData.taxId?.trim().length != 12 ?? true },
    };
  };

  const hasErrors = (errors?: Partial<ProfileFieldErrorMap>) => {
    return fields.some((i) => {
      return (errors ?? fieldStates)[i]?.invalid == true;
    });
  };

  const responsibleOwnerOrBusinessName = () => {
    return LookupLegalStructureById(profileData.legalStructureId).requiresPublicFiling
      ? Config.taxCalendar.modalBusinessFieldErrorName
      : Config.taxCalendar.modalResponsibleOwnerFieldErrorName;
  };

  const errorAlert = (): ReactElement => {
    if (userData?.taxFilingData.errorField == "Business Name" && apiFailed == "FAILED") {
      return (
        <>
          {Config.taxCalendar.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessName()}</li>
          </ul>
        </>
      );
    } else if (apiFailed == "FAILED") {
      return (
        <>
          {Config.taxCalendar.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessName()}</li>
            <li>{Config.taxCalendar.modalTaxFieldErrorName}</li>
          </ul>
        </>
      );
    } else {
      return <Content>{Config.taxCalendar.failedUnknownMarkdown}</Content>;
    }
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

    const encryptedTaxId =
      profileData.taxId == userData.profileData.taxId ? profileData.encryptedTaxId : undefined;

    try {
      const businessNameToSubmitToTaxApi = isPublicFiling
        ? profileData.businessName
        : profileData.responsibleOwnerName;

      userDataToSet = await postTaxRegistrationOnboarding({
        taxId: profileData.taxId as string,
        businessName: businessNameToSubmitToTaxApi,
        encryptedTaxId: encryptedTaxId as string,
      });
    } catch {
      setOnAPIfailed("UNKNOWN");
      setIsLoading(false);
      return;
    }

    userDataToSet = {
      ...userDataToSet,
      profileData: {
        ...userDataToSet.profileData,
        taxId: profileData.taxId,
        encryptedTaxId: encryptedTaxId,
        responsibleOwnerName: profileData.responsibleOwnerName,
      },
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

  const onClose = (): void => {
    if (!userData) {
      return;
    }
    props.close();
    setProfileData(userData.profileData);
    setOnAPIfailed(undefined);
    setOnSubmitClicked(false);
    setFieldStates(createProfileFieldErrorMap());
  };

  const shouldShowBusinessNameField = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling;
  };

  const shouldShowResponsibleOwnerField = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).hasTradeName;
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "OWNING",
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
        title={Config.taxCalendar.modalHeader}
        primaryButtonText={Config.taxCalendar.modalNextButton}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.taxCalendar.modalCancelButton}
      >
        {hasErrors() && onSubmitClicked && !apiFailed && (
          <Alert variant={"error"}>
            {Config.taxCalendar.modalErrorHeader}
            <ul>
              {fields.map((i) => {
                if (fieldStates[i].invalid && errorMessages[i]) {
                  return <li key={i}> {errorMessages[i]}</li>;
                }
              })}
            </ul>
          </Alert>
        )}

        {apiFailed && <Alert variant={"error"}> {errorAlert()}</Alert>}

        <div className="margin-bottom-4">
          <Content>{Config.taxCalendar.modalBody}</Content>
        </div>

        {shouldShowBusinessNameField() && (
          <>
            {shouldLockFormationFields ? (
              <LockedProfileField fieldName="businessName" />
            ) : (
              <>
                <div
                  className={`${
                    fieldStates && fieldStates?.businessName?.invalid ? "input-error-bar error" : ""
                  }`}
                >
                  <FieldLabelModal
                    fieldName="businessName"
                    overrides={{
                      header: Config.taxCalendar.modalBusinessFieldHeader,
                      description: Config.taxCalendar.modalBusinessFieldMarkdown,
                    }}
                  />
                  <OnboardingBusinessName
                    inputErrorBar={true}
                    onValidation={onValidation}
                    fieldStates={fieldStates}
                    validationText={
                      apiFailed == "FAILED" ? Config.taxCalendar.failedBusinessFieldHelper : undefined
                    }
                  />
                </div>
              </>
            )}
          </>
        )}

        {shouldShowResponsibleOwnerField() && (
          <>
            <div
              className={`${
                fieldStates && fieldStates?.responsibleOwnerName?.invalid ? "input-error-bar error" : ""
              }`}
            >
              <FieldLabelModal fieldName="responsibleOwnerName" />
              <OnboardingResponsibleOwnerName
                inputErrorBar
                onValidation={onValidation}
                fieldStates={fieldStates}
                validationText={
                  apiFailed == "FAILED" ? Config.taxCalendar.failedResponsibleOwnerFieldHelper : undefined
                }
              />
            </div>
          </>
        )}

        <div className={`${fieldStates && fieldStates?.taxId?.invalid ? "input-error-bar error" : ""}`}>
          <FieldLabelModal
            fieldName="taxId"
            overrides={{
              header: Config.taxCalendar.modalTaxIdHeader,
              description: Config.taxCalendar.modalTaxIdMarkdown,
              postDescription: isPublicFiling ? undefined : Config.taxCalendar.taxIdDisclaimerMd,
            }}
          />
          <OnboardingTaxId
            onValidation={onValidation}
            inputErrorBar
            fieldStates={fieldStates}
            validationText={apiFailed == "FAILED" ? Config.taxCalendar.failedTaxIdHelper : undefined}
            required
          />
        </div>
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
