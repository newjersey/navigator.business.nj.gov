import { Content } from "@/components/Content";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { TaxAccessBody } from "@/components/filings-calendar/tax-access/TaxAccessBody";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ReverseOrderInMobile } from "@/components/njwds-layout/ReverseOrderInMobile";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  DataFormErrorMapContext,
  DataFormErrorMapFields,
} from "@/contexts/dataFormErrorMapContext";
import { createReducedFieldStates } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { gov2GovTaxFiling } from "@/lib/taxation/helpers";
import analytics from "@/lib/utils/analytics";
import { useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  Business,
  createEmptyProfileData,
  LookupLegalStructureById,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { isOwningBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { FieldStateActionKind } from "@businessnjgovnavigator/shared/types";
import { Backdrop, CircularProgress } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  onSuccess: () => void;
  moveToPrevStep: () => void;
  CMS_ONLY_fakeError?: "NONE" | "API" | "UNKNOWN";
  CMS_ONLY_fakeBusiness?: Business;
  hadLegalStructureOnMount?: boolean;
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
  const fields: DataFormErrorMapFields[] = ["businessName", "taxId", "responsibleOwnerName"];
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

  const errorMessages: Partial<Record<DataFormErrorMapFields, string>> = {
    businessName: Config.taxAccess.businessFieldErrorName,
    responsibleOwnerName: Config.taxAccess.responsibleOwnerFieldErrorName,
    taxId: Config.taxAccess.taxFieldErrorName,
  };

  const canMoveToPrevStep = isOwningBusiness(business) && !props.hadLegalStructureOnMount;

  const displayBusinessName = (): boolean => {
    return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
      "businessName",
    );
  };

  const displayResponsibleOwnerName = (): boolean => {
    return LookupLegalStructureById(business?.profileData.legalStructureId).elementsToDisplay.has(
      "responsibleOwnerName",
    );
  };

  const responsibleOwnerOrBusinessNameError = (): string => {
    if (displayBusinessName()) {
      return Config.taxAccess.businessFieldErrorName;
    }
    if (displayResponsibleOwnerName()) {
      return Config.taxAccess.responsibleOwnerFieldErrorName;
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
            <li>{Config.taxAccess.taxFieldErrorName}</li>
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
        analytics.event.tax_calendar.submit.tax_deadlines_added_to_calendar();
        props.onSuccess();
        queueUpdateTaskProgress("determine-naics-code", "COMPLETED");
        updateQueue.update();
      }

      if (taxFilingData.state === "PENDING") {
        setIsLoading(false);
        analytics.event.tax_calendar.submit.business_exists_but_not_in_Gov2Go();
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
        analytics.event.tax_calendar.submit.tax_calendar_business_does_not_exist();
        setIsLoading(false);
      }

      if (taxFilingData.state === "API_ERROR") {
        setOnAPIfailed("UNKNOWN");
        setIsLoading(false);
      }
    },
    () => analytics.event.tax_calendar.submit.tax_calendar_validation_error(),
  );

  if (profileData.legalStructureId === undefined) return <></>;

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
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
        <div className="width-full">
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

          {(apiFailed || has_CMS_ONLY_fakeError) && (
            <Alert variant={"error"}> {errorAlert()}</Alert>
          )}

          <TaxAccessBody isStepOne={false} showHeader={canMoveToPrevStep} />

          {displayBusinessName() && (
            <WithErrorBar
              hasError={!!formContextState.fieldStates.businessName?.invalid}
              type="ALWAYS"
              className="margin-top-2 width-full"
            >
              <FieldLabelModal
                fieldName="businessName"
                overrides={{
                  header: Config.taxAccess.businessFieldHeader,
                  description: Config.taxAccess.businessFieldMarkdown,
                  headerNotBolded: "",
                  postDescription: "",
                }}
              />
              <BusinessName
                validationText={Config.taxAccess.failedBusinessFieldHelper}
                required
                inputWidth={"full"}
              />
            </WithErrorBar>
          )}
          {displayResponsibleOwnerName() && (
            <WithErrorBar
              hasError={!!formContextState.fieldStates.responsibleOwnerName?.invalid}
              type="ALWAYS"
              className="margin-top-3 width-full"
            >
              <FieldLabelModal
                fieldName="responsibleOwnerName"
                overrides={{
                  header: Config.taxAccess.businessOwnerName,
                  description: Config.taxAccess.businessOwnerDescription,
                  headerNotBolded: "",
                  postDescription: "",
                }}
              />
              <ResponsibleOwnerName
                validationText={Config.taxAccess.failedResponsibleOwnerFieldHelper}
                required
                inputWidth={"full"}
              />
            </WithErrorBar>
          )}
          <WithErrorBar
            hasError={!!formContextState.fieldStates.taxId?.invalid}
            type="ALWAYS"
            className="margin-top-3 width-full padding-right-0"
          >
            <div data-testid="taxIdInput" className="width-full">
              <FieldLabelModal
                fieldName="taxId"
                overrides={{
                  header: Config.taxAccess.taxIdHeader,
                  description: Config.taxAccess.taxIdMarkdown,
                  headerNotBolded: "",
                  postDescription: "",
                }}
              />
            </div>
            <TaxId
              dbBusinessTaxId={business?.profileData.taxId}
              validationText={Config.taxAccess.failedTaxIdHelper}
              required
              inputWidth={"full"}
            />
          </WithErrorBar>
          <div
            className="margin-top-3 width-full"
            data-testid="tax-calendar-access-step-two-button-container"
          >
            <ReverseOrderInMobile className="display-flex flex-column mobile-lg:flex-row width-full gap-3 mobile-lg:gap-0">
              {canMoveToPrevStep && (
                <SecondaryButton
                  isColor="primary"
                  dataTestId="tax-calendar-back-button"
                  onClick={props.moveToPrevStep}
                >
                  {Config.taxAccess.stepTwoBackButton}
                </SecondaryButton>
              )}
              <div
                className={`mobile-lg:margin-left-auto ${canMoveToPrevStep ? "" : "width-full"}`}
              >
                <PrimaryButton
                  isColor="primary"
                  isRightMarginRemoved={true}
                  isFullWidthOnDesktop={!canMoveToPrevStep}
                  onClick={(): void => {
                    onSubmit();
                    setOnSubmitClicked(true);
                    analytics.event.tax_calendar.click.click_calendar_access_v2();
                  }}
                  dataTestId="tax-calendar-access-submit-button"
                >
                  {Config.taxAccess.stepTwoNextButton}
                </PrimaryButton>
              </div>
            </ReverseOrderInMobile>
          </div>
        </div>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
