import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { ProfileBusinessName } from "@/components/profile/ProfileBusinessName";
import { ProfileResponsibleOwnerName } from "@/components/profile/ProfileResponsibleOwnerName";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FieldStateActionKind } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createReducedFieldStates, ProfileFields } from "@/lib/types/types";
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
  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);
  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createReducedFieldStates(fields));

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.taxCalendar.modalBusinessFieldErrorName,
    responsibleOwnerName: Config.taxCalendar.modalResponsibleOwnerFieldErrorName,
    taxId: Config.taxCalendar.modalTaxFieldErrorName,
  };

  const displayBusinessName = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).elementsToDisplay.has(
      "businessName"
    );
  };

  const displayResponsibleOwnerName = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).elementsToDisplay.has(
      "responsibleOwnerName"
    );
  };

  const responsibleOwnerOrBusinessNameError = (): string => {
    if (displayBusinessName()) {
      return Config.taxCalendar.modalBusinessFieldErrorName;
    }
    if (displayResponsibleOwnerName()) {
      return Config.taxCalendar.modalResponsibleOwnerFieldErrorName;
    }
    return "";
  };

  const errorAlert = (): ReactElement => {
    if (userData?.taxFilingData.errorField === "businessName" && apiFailed === "FAILED") {
      return (
        <>
          {Config.taxCalendar.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessNameError()}</li>
          </ul>
        </>
      );
    } else if (apiFailed === "FAILED") {
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

  FormFuncWrapper(
    async () => {
      if (!userData) {
        return;
      }

      setIsLoading(true);
      let userDataToSet: UserData;

      const encryptedTaxId =
        profileData.taxId === userData.profileData.taxId ? profileData.encryptedTaxId : undefined;

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

      if (userDataToSet.taxFilingData.state === "SUCCESS") {
        setIsLoading(false);
        analytics.event.tax_calendar_modal.submit.tax_deadlines_added_to_calendar();
        props.onSuccess();
      }

      if (userDataToSet.taxFilingData.state === "PENDING") {
        setIsLoading(false);
        analytics.event.tax_calendar_modal.submit.business_exists_but_not_in_Gov2Go();
        props.close();
      }

      if (userDataToSet.taxFilingData.state === "FAILED") {
        if (userDataToSet.taxFilingData.errorField === "businessName" && displayBusinessName()) {
          formContextState.reducer({
            type: FieldStateActionKind.VALIDATION,
            payload: { field: "businessName", invalid: true },
          });
        } else if (
          userDataToSet.taxFilingData.errorField === "businessName" &&
          displayResponsibleOwnerName()
        ) {
          formContextState.reducer({
            type: FieldStateActionKind.VALIDATION,
            payload: { field: "responsibleOwnerName", invalid: true },
          });
        } else {
          formContextState.reducer({
            type: FieldStateActionKind.VALIDATION,
            payload: { field: fields, invalid: true },
          });
        }
        setOnAPIfailed("FAILED");
        analytics.event.tax_calendar_modal.submit.tax_calendar_business_does_not_exist();
        setIsLoading(false);
      }

      if (userDataToSet.taxFilingData.state === "API_ERROR") {
        setOnAPIfailed("UNKNOWN");
        setIsLoading(false);
      }
    },
    () => analytics.event.tax_calendar_modal.submit.tax_calendar_modal_validation_error()
  );

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
    formContextState.reducer({ type: FieldStateActionKind.RESET });
  };

  return (
    <profileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "OWNING",
          },
          setProfileData,
          setUser: (): void => {},
          onBack: (): void => {},
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
          primaryButtonOnClick={(): void => {
            onSubmit();
            setOnSubmitClicked(true);
          }}
          secondaryButtonText={Config.taxCalendar.modalCancelButton}
        >
          {!isValid() && onSubmitClicked && !apiFailed && (
            <Alert variant={"error"}>
              {Config.taxCalendar.modalErrorHeader}
              <ul>
                {fields.map((i) => {
                  if (formContextState.fieldStates[i].invalid && errorMessages[i]) {
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
            <WithErrorBar hasError={!!formContextState.fieldStates.businessName?.invalid} type="ALWAYS">
              <FieldLabelModal
                fieldName="businessName"
                overrides={{
                  header: Config.taxCalendar.modalBusinessFieldHeader,
                  description: Config.taxCalendar.modalBusinessFieldMarkdown,
                }}
              />
              <ProfileBusinessName validationText={Config.taxCalendar.failedBusinessFieldHelper} required />
            </WithErrorBar>
          )}

          {displayResponsibleOwnerName() && (
            <WithErrorBar
              hasError={!!formContextState.fieldStates.responsibleOwnerName?.invalid}
              type="ALWAYS"
            >
              <FieldLabelModal fieldName="responsibleOwnerName" />
              <ProfileResponsibleOwnerName
                validationText={Config.taxCalendar.failedResponsibleOwnerFieldHelper}
                required
              />
            </WithErrorBar>
          )}

          <WithErrorBar hasError={!!formContextState.fieldStates.responsibleOwnerName?.invalid} type="ALWAYS">
            <div data-testid="taxIdInput">
              <FieldLabelModal
                fieldName="taxId"
                overrides={{
                  header: Config.taxCalendar.modalTaxIdHeader,
                  description: Config.taxCalendar.modalTaxIdMarkdown,
                  postDescription: LookupLegalStructureById(
                    userData?.profileData.legalStructureId
                  ).elementsToDisplay.has("taxIdDisclaimer")
                    ? Config.profileDefaults.fields.taxId.default.disclaimerMd
                    : undefined,
                }}
              />
            </div>
            <OnboardingTaxId validationText={Config.taxCalendar.failedTaxIdHelper} required />
          </WithErrorBar>
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
