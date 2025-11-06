import { GenericTextField } from "@/components/GenericTextField";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { responsesToString } from "@/components/tasks/environment-questionnaire/results/helpers";
import { WithErrorBar } from "@/components/WithErrorBar";
import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { validateEmail } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { InputLabel } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

export const PersonalizedSupport = (): ReactElement => {
  const envContext = useContext(EnvPermitContext);
  const Config = getMergedConfig();
  const [error, setError] = useState<"EMAIL" | "GENERAL" | undefined>();
  const { userData, business, updateQueue } = useUserData();
  const [email, setEmail] = useState<string | undefined>(userData?.user.email ?? "");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (): Promise<void> => {
    setError(undefined);
    const isValidEmail = validateEmail(email ?? "");
    if (!isValidEmail) {
      setError("EMAIL");
      return;
    }
    const emailMetaData = {
      email: email ?? userData?.user.email ?? "N/A",
      userName: userData?.user.name ?? "N/A",
      businessName:
        business?.profileData.businessName && business?.profileData.businessName !== ""
          ? business.profileData.businessName
          : "N/A",
      industry: business?.profileData.industryId ?? "N/A",
      location: business?.formationData.formationFormData.addressCity ?? "N/A",
      phase: business?.profileData.businessPersona ?? "N/A",
      naicsCode:
        business?.profileData.naicsCode && business?.profileData.naicsCode !== ""
          ? business?.profileData.naicsCode
          : "N/A",
      questionnaireResponses: responsesToString(envContext.state.questionnaireData),
    };
    setIsLoading(true);
    await api
      .sendEnvironmentPermitEmail(emailMetaData)
      .then(() => {
        envContext.setEmailSent(true);
        updateQueue
          ?.queueEnvironmentData({
            sbapEmailSent: true,
          })
          .update();
        analytics.event.email_sbap_clicked.click.email_sbap_clicked();
      })
      .catch(() => {
        setError("GENERAL");
      });
    setIsLoading(false);
  };

  return (
    <ResultsSectionAccordion
      title={Config.envResultsPage.personalizedSupport.title}
      onOpenFunc={
        analytics.event.gen_guidance_stepper_sbap_accordion_opened.click
          .general_guidance_sbap_accordion_opened
      }
    >
      <div className={"padding-205 margin-y-2 bg-base-extra-light text-body radius-lg"}>
        {error && (
          <Alert
            variant="error"
            dataTestid={error === "EMAIL" ? "email-error-alert" : "general-error-alert"}
          >
            {error === "EMAIL"
              ? Config.envResultsPage.personalizedSupport.emailErrorAlertText
              : Config.envResultsPage.personalizedSupport.generalErrorAlertText}
          </Alert>
        )}
        <div className={"padding-bottom-1"}>{Config.envResultsPage.personalizedSupport.body}</div>
        <div className="flex fdc">
          <div className="text-bold">
            {envContext.state.sbapEmailSent
              ? Config.envResultsPage.personalizedSupport.directContactInfo
              : Config.envResultsPage.personalizedSupport.submissionCadence}
          </div>
          {envContext.state.sbapEmailSent !== true && (
            <div className={`margin-top-1 ${error ? "margin-x-2" : ""}`}>
              <WithErrorBar hasError={!!error} type="ALWAYS">
                <InputLabel className="text-base-darkest text-bold" htmlFor="email">
                  {Config.envResultsPage.personalizedSupport.emailLabel}
                </InputLabel>
                <div className="fdr fww space-between">
                  <GenericTextField
                    inputWidth="default"
                    fieldName="email"
                    value={email}
                    handleChange={(value) => {
                      setError(undefined);
                      setEmail(value);
                    }}
                    error={!!error}
                    validationText={
                      error === "EMAIL"
                        ? Config.envResultsPage.personalizedSupport.emailErrorText
                        : Config.envResultsPage.personalizedSupport.generalErrorText
                    }
                    className="margin-right-2 width-100 tablet:width-80"
                  />
                  <SecondaryButton
                    className={"height-6 margin-top-05 tablet:width-11rem margin-top-05"}
                    isColor={"accent-cooler"}
                    onClick={onSubmit}
                    isLoading={isLoading}
                    isRightMarginRemoved
                  >
                    {Config.envResultsPage.personalizedSupport.contactSbapButton}
                  </SecondaryButton>
                </div>
              </WithErrorBar>
            </div>
          )}
        </div>
      </div>
    </ResultsSectionAccordion>
  );
};
