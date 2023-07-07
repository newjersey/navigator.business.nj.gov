import { Content } from "@/components/Content";
import { TaxAccessModalBody } from "@/components/filings-calendar/tax-access-modal/TaxAccessModalBody";
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
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createReducedFieldStates, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
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
  moveToPrevStep: () => void;
  CMS_ONLY_fakeError?: "NONE" | "API" | "UNKNOWN"; // for CMS only
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
}

export const TaxAccessStepTwo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { updateQueue, userData: userDataFromHook } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook;

  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);
  const fields: ProfileFields[] = ["businessName", "taxId", "responsibleOwnerName"];
  const has_CMS_ONLY_fakeError = props.CMS_ONLY_fakeError && props.CMS_ONLY_fakeError !== "NONE";

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createReducedFieldStates(fields));

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  useMountEffect(() => {
    if (has_CMS_ONLY_fakeError) {
      formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: "businessName", invalid: true },
      });
      formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: "taxId", invalid: true },
      });
      formContextState.reducer({
        type: FieldStateActionKind.VALIDATION,
        payload: { field: "responsibleOwnerName", invalid: true },
      });
    }
  });

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.taxAccess.modalBusinessFieldErrorName,
    responsibleOwnerName: Config.taxAccess.modalResponsibleOwnerFieldErrorName,
    taxId: Config.taxAccess.modalTaxFieldErrorName,
  };

  const canMoveToPrevStep = userData?.profileData.businessPersona === "OWNING";

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
      return Config.taxAccess.modalBusinessFieldErrorName;
    }
    if (displayResponsibleOwnerName()) {
      return Config.taxAccess.modalResponsibleOwnerFieldErrorName;
    }
    return "";
  };

  const errorAlert = (): ReactElement => {
    const errorApiFailed = apiFailed === "FAILED" || props.CMS_ONLY_fakeError === "API";

    if (userData?.taxFilingData.errorField === "businessName" && errorApiFailed) {
      return (
        <>
          {Config.taxAccess.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessNameError()}</li>
          </ul>
        </>
      );
    } else if (errorApiFailed) {
      return (
        <>
          {Config.taxAccess.failedErrorMessageHeader}
          <ul>
            <li>{responsibleOwnerOrBusinessNameError()}</li>
            <li>{Config.taxAccess.modalTaxFieldErrorName}</li>
          </ul>
        </>
      );
    } else {
      return <Content>{Config.taxAccess.failedUnknownMarkdown}</Content>;
    }
  };

  FormFuncWrapper(
    async () => {
      if (!userData || !updateQueue) return;

      setIsLoading(true);

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

        const userDataToSet = await postTaxFilingsOnboarding({
          taxId: profileData.taxId as string,
          businessName: businessNameToSubmitToTaxApi,
          encryptedTaxId: encryptedTaxId as string,
        });

        updateQueue.queue(userDataToSet).queueProfileData({
          taxId: profileData.taxId,
          encryptedTaxId: encryptedTaxId,
        });

        if (userDataToSet.taxFilingData.state === "SUCCESS") {
          if (displayBusinessName()) {
            updateQueue.queueProfileData({
              businessName: profileData.businessName,
            });
          }

          if (displayResponsibleOwnerName()) {
            updateQueue.queueProfileData({
              responsibleOwnerName: profileData.responsibleOwnerName,
            });
          }
        }

        await updateQueue.update();
      } catch {
        setOnAPIfailed("UNKNOWN");
        setIsLoading(false);
        return;
      }

      const { taxFilingData } = updateQueue.current();

      if (taxFilingData.state === "SUCCESS") {
        setIsLoading(false);
        analytics.event.tax_calendar_modal.submit.tax_deadlines_added_to_calendar();
        props.onSuccess();
        queueUpdateTaskProgress("determine-naics-code", "COMPLETED");
        updateQueue.update();
      }

      if (taxFilingData.state === "PENDING") {
        setIsLoading(false);
        analytics.event.tax_calendar_modal.submit.business_exists_but_not_in_Gov2Go();
        props.close();
      }

      if (taxFilingData.state === "FAILED") {
        if (taxFilingData.errorField === "businessName" && displayBusinessName()) {
          formContextState.reducer({
            type: FieldStateActionKind.VALIDATION,
            payload: { field: "businessName", invalid: true },
          });
        } else if (taxFilingData.errorField === "businessName" && displayResponsibleOwnerName()) {
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

      if (taxFilingData.state === "API_ERROR") {
        setOnAPIfailed("UNKNOWN");
        setIsLoading(false);
      }
    },
    () => analytics.event.tax_calendar_modal.submit.tax_calendar_modal_validation_error()
  );

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

  if (profileData.legalStructureId === undefined) return <></>;

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
          title={Config.taxAccess.modalHeader}
          primaryButtonText={Config.taxAccess.stepTwoNextButton}
          primaryButtonOnClick={(): void => {
            onSubmit();
            setOnSubmitClicked(true);
          }}
          secondaryButtonText={
            canMoveToPrevStep ? Config.taxAccess.stepTwoBackButton : Config.taxAccess.stepTwoCancelButton
          }
          secondaryButtonOnClick={canMoveToPrevStep ? props.moveToPrevStep : onClose}
        >
          {!isValid() && onSubmitClicked && !apiFailed && (
            <Alert variant={"error"}>
              {Config.taxAccess.stepTwoErrorBanner}
              <ul>
                {fields.map((i) => {
                  if (formContextState.fieldStates[i].invalid && errorMessages[i]) {
                    return <li key={i}> {errorMessages[i]}</li>;
                  }
                })}
              </ul>
            </Alert>
          )}

          {(apiFailed || has_CMS_ONLY_fakeError) && <Alert variant={"error"}> {errorAlert()}</Alert>}

          <TaxAccessModalBody isStepOne={false} showHeader={canMoveToPrevStep} />

          {displayBusinessName() && (
            <WithErrorBar hasError={!!formContextState.fieldStates.businessName?.invalid} type="ALWAYS">
              <FieldLabelModal
                fieldName="businessName"
                overrides={{
                  header: Config.taxAccess.modalBusinessFieldHeader,
                  description: Config.taxAccess.modalBusinessFieldMarkdown,
                }}
              />
              <ProfileBusinessName validationText={Config.taxAccess.failedBusinessFieldHelper} required />
            </WithErrorBar>
          )}

          {displayResponsibleOwnerName() && (
            <WithErrorBar
              hasError={!!formContextState.fieldStates.responsibleOwnerName?.invalid}
              type="ALWAYS"
            >
              <FieldLabelModal
                fieldName="responsibleOwnerName"
                overrides={{
                  header: Config.taxAccess.modalBusinessOwnerName,
                  description: Config.taxAccess.modalBusinessOwnerDescription,
                }}
              />
              <ProfileResponsibleOwnerName
                validationText={Config.taxAccess.failedResponsibleOwnerFieldHelper}
                required
              />
            </WithErrorBar>
          )}

          <WithErrorBar hasError={!!formContextState.fieldStates.taxId?.invalid} type="ALWAYS">
            <div data-testid="taxIdInput">
              <FieldLabelModal
                fieldName="taxId"
                overrides={{
                  header: Config.taxAccess.modalTaxIdHeader,
                  description: Config.taxAccess.modalTaxIdMarkdown,
                  postDescription: LookupLegalStructureById(
                    userData?.profileData.legalStructureId
                  ).elementsToDisplay.has("taxIdDisclaimer")
                    ? Config.profileDefaults.fields.taxId.default.disclaimerMd
                    : undefined,
                }}
              />
            </div>
            <OnboardingTaxId
              validationText={Config.taxAccess.failedTaxIdHelper}
              required
              inputWidth="default"
            />
          </WithErrorBar>
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
