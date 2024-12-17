import { Content } from "@/components/Content";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { TaxAccessModalBody } from "@/components/filings-calendar/tax-access-modal/TaxAccessModalBody";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FieldStateActionKind } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { gov2GovTaxFiling } from "@/lib/taxation/helpers";
import { createReducedFieldStates, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  Business,
  createEmptyProfileData,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { isOwningBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { Backdrop, CircularProgress } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
  moveToPrevStep: () => void;
  CMS_ONLY_fakeError?: "NONE" | "API" | "UNKNOWN";
  CMS_ONLY_fakeBusiness?: Business;
}

export const TaxAccessStepTwo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const business = props.CMS_ONLY_fakeBusiness ?? updateQueue?.currentBusiness();

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
    if (!business) return;
    setProfileData(business.profileData);
  }, business);

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

  const canMoveToPrevStep = isOwningBusiness(business);

  const displayBusinessName = (): boolean => {
    return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
      "businessName"
    );
  };

  const displayResponsibleOwnerName = (): boolean => {
    return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
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

    if (business?.taxFilingData.errorField === "businessName" && errorApiFailed) {
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
      if (!business || !updateQueue) return;

      setIsLoading(true);

      try {
        await gov2GovTaxFiling({ updateQueue, stagedProfileData: profileData });
        await updateQueue.update();
        if (profileData.businessName) {
          updateQueue.queueProfileData({
            businessName: profileData.businessName,
          });
        }
        if (profileData.responsibleOwnerName) {
          updateQueue.queueProfileData({
            responsibleOwnerName: profileData.responsibleOwnerName,
          });
        }
      } catch {
        setOnAPIfailed("UNKNOWN");
        setIsLoading(false);
        return;
      }

      const { taxFilingData } = updateQueue.currentBusiness();

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
    if (!business) return;
    props.close();
    setProfileData(business.profileData);
    setOnAPIfailed(undefined);
    setOnSubmitClicked(false);
    formContextState.reducer({ type: FieldStateActionKind.RESET });
  };

  if (profileData.legalStructureId === undefined) return <></>;

  return (
    <ProfileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "OWNING",
          },
          setProfileData,
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
            <WithErrorBar
              hasError={!!formContextState.fieldStates.businessName?.invalid}
              type="ALWAYS"
              className="margin-top-2"
            >
              <FieldLabelModal
                fieldName="businessName"
                overrides={{
                  header: Config.taxAccess.modalBusinessFieldHeader,
                  description: Config.taxAccess.modalBusinessFieldMarkdown,
                  headerNotBolded: "",
                  postDescription: "",
                }}
              />
              <BusinessName validationText={Config.taxAccess.failedBusinessFieldHelper} required />
            </WithErrorBar>
          )}
          {displayResponsibleOwnerName() && (
            <WithErrorBar
              hasError={!!formContextState.fieldStates.responsibleOwnerName?.invalid}
              type="ALWAYS"
              className="margin-top-3"
            >
              <FieldLabelModal
                fieldName="responsibleOwnerName"
                overrides={{
                  header: Config.taxAccess.modalBusinessOwnerName,
                  description: Config.taxAccess.modalBusinessOwnerDescription,
                  headerNotBolded: "",
                  postDescription: "",
                }}
              />
              <ResponsibleOwnerName
                validationText={Config.taxAccess.failedResponsibleOwnerFieldHelper}
                required
              />
            </WithErrorBar>
          )}
          <WithErrorBar
            hasError={!!formContextState.fieldStates.taxId?.invalid}
            type="ALWAYS"
            className="margin-top-3"
          >
            <div data-testid="taxIdInput">
              <FieldLabelModal
                fieldName="taxId"
                overrides={{
                  header: Config.taxAccess.modalTaxIdHeader,
                  description: Config.taxAccess.modalTaxIdMarkdown,
                  headerNotBolded: "",
                  postDescription: LookupLegalStructureById(
                    business?.profileData.legalStructureId
                  ).elementsToDisplay.has("taxIdDisclaimer")
                    ? Config.profileDefaults.fields.taxId.default.disclaimerMd
                    : undefined,
                }}
              />
            </div>
            <TaxId validationText={Config.taxAccess.failedTaxIdHelper} required inputWidth={"full"} />
          </WithErrorBar>
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </ProfileFormContext.Provider>
  );
};
