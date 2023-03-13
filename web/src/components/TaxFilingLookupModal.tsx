import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingResponsibleOwnerName } from "@/components/onboarding/OnboardingResponsibleOwnerName";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
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

interface Props {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
}
export const TaxFilingLookupModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);
  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.taxCalendar.modalBusinessFieldErrorName,
    responsibleOwnerName: Config.taxCalendar.modalResponsibleOwnerFieldErrorName,
    taxId: Config.taxCalendar.modalTaxFieldErrorName,
  };

  const getErrors = (): Partial<ProfileFieldErrorMap> => {
    return {
      businessName: {
        invalid: displayBusinessName() ? profileData.businessName.trim().length === 0 : false,
      },
      responsibleOwnerName: {
        invalid: displayResponsibleOwnerName() ? profileData.responsibleOwnerName.trim().length === 0 : false,
      },
      taxId: { invalid: profileData.taxId?.trim().length != 12 ?? true },
    };
  };

  const hasErrors = (errors?: Partial<ProfileFieldErrorMap>) => {
    return fields.some((i) => {
      return (errors ?? fieldStates)[i]?.invalid == true;
    });
  };

  const displayBusinessName = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).displayBusinessName;
  };

  const displayResponsibleOwnerName = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).displayResponsibleOwnerName;
  };

  const responsibleOwnerOrBusinessNameError = () => {
    if (displayBusinessName()) {
      return Config.taxCalendar.modalBusinessFieldErrorName;
    }
    if (displayResponsibleOwnerName()) {
      return Config.taxCalendar.modalResponsibleOwnerFieldErrorName;
    }
  };

  const errorAlert = (): ReactElement => {
    if (userData?.taxFilingData.errorField == "businessName" && apiFailed == "FAILED") {
      return (
        <>
          {Config.taxCalendar.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessNameError()}</li>
          </ul>
        </>
      );
    } else if (apiFailed == "FAILED") {
      return (
        <>
          {Config.taxCalendar.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessNameError()}</li>
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
      let businessNameToSubmitToTaxApi = "";

      if (displayBusinessName()) {
        businessNameToSubmitToTaxApi = profileData.businessName;
      }
      if (displayResponsibleOwnerName()) {
        businessNameToSubmitToTaxApi = profileData.responsibleOwnerName;
      }

      userDataToSet = await postTaxFilingsOnboarding({
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
      if (userDataToSet.taxFilingData.errorField == "businessName" && displayBusinessName()) {
        setFieldStates((prev) => {
          return { ...prev, businessName: { invalid: true } };
        });
      } else if (userDataToSet.taxFilingData.errorField == "businessName" && displayResponsibleOwnerName()) {
        setFieldStates((prev) => {
          return { ...prev, responsibleOwnerName: { invalid: true } };
        });
      } else {
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
      }
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

        {displayBusinessName() && (
          <WithErrorBar hasError={!!fieldStates?.businessName?.invalid} type="ALWAYS">
            <FieldLabelModal
              fieldName="businessName"
              overrides={{
                header: Config.taxCalendar.modalBusinessFieldHeader,
                description: Config.taxCalendar.modalBusinessFieldMarkdown,
              }}
            />
            <OnboardingBusinessName
              onValidation={onValidation}
              fieldStates={fieldStates}
              validationText={Config.taxCalendar.failedBusinessFieldHelper}
            />
          </WithErrorBar>
        )}

        {displayResponsibleOwnerName() && (
          <WithErrorBar hasError={!!fieldStates?.responsibleOwnerName?.invalid} type="ALWAYS">
            <FieldLabelModal fieldName="responsibleOwnerName" />
            <OnboardingResponsibleOwnerName
              onValidation={onValidation}
              fieldStates={fieldStates}
              validationText={Config.taxCalendar.failedResponsibleOwnerFieldHelper}
            />
          </WithErrorBar>
        )}

        <WithErrorBar hasError={!!fieldStates?.responsibleOwnerName?.invalid} type="ALWAYS">
          <div data-testid="taxIdInput">
            <FieldLabelModal
              fieldName="taxId"
              overrides={{
                header: Config.taxCalendar.modalTaxIdHeader,
                description: Config.taxCalendar.modalTaxIdMarkdown,
                postDescription: LookupLegalStructureById(userData?.profileData.legalStructureId)
                  .displayTaxDisclaimer
                  ? Config.profileDefaults.fields.taxId.default.disclaimerMd
                  : undefined,
              }}
            />
          </div>
          <OnboardingTaxId
            onValidation={onValidation}
            fieldStates={fieldStates}
            validationText={Config.taxCalendar.failedTaxIdHelper}
            required
          />
        </WithErrorBar>
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
