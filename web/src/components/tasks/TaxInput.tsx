import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Icon } from "@/components/njwds/Icon";
import { DisabledTaxId } from "@/components/onboarding/taxId/DisabledTaxId";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { createProfileFieldErrorMap, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { createTheme, ThemeProvider, useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useState } from "react";

interface Props {
  task: Task;
}

export const TaxInput = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const { isAuthenticated } = useContext(AuthAlertContext);
  const { Config } = useConfig();
  const [profileData, setProfileData] = useState<ProfileData>(
    business?.profileData ?? createEmptyProfileData(),
  );

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const shouldLockTaxId =
    business?.taxFilingData.state === "SUCCESS" || business?.taxFilingData.state === "PENDING";

  const saveButtonText =
    isAuthenticated === IsAuthenticated.FALSE
      ? `Register & ${Config.tax.saveButtonText}`
      : Config.tax.saveButtonText;

  useEffect(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, [business]);

  useMountEffectWhenDefined(() => {
    if (!business || !updateQueue) return;
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return;
    }
    if (
      business.profileData.taxId &&
      business.profileData.taxId?.length > 0 &&
      business.profileData.taxId?.length < 12
    ) {
      updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
    }
  }, business);

  FormFuncWrapper(async () => {
    if (!business || !updateQueue || !isValid()) {
      return;
    }

    setIsLoading(true);

    let { taxFilingData } = business;
    if (business.profileData.taxId !== profileData.taxId) {
      taxFilingData = { ...taxFilingData, state: undefined, registeredISO: undefined, filings: [] };
    }

    updateQueue
      .queueProfileData(profileData)
      .queueTaxFilingData(taxFilingData)
      .queueTaskProgress({ [props.task.id]: "COMPLETED" })
      .update()
      .then(() => {
        setIsLoading(false);
      });
  });

  const DisabledElement = (props: { children: ReactNode }): ReactElement => (
    <div className={`flex ${isTabletAndUp ? "flex-row" : "flex-column margin-right-2"} no-wrap`}>
      <div className={`${isTabletAndUp ? "padding-right-1" : ""}`}>{Config.tax.lockedPreText}</div>
      <div>{props.children}</div>
      <div className={`${isTabletAndUp ? "padding-left-1" : ""} margin-right-1`}>
        {Config.tax.lockedPostText}
      </div>
      <div className={"text-wrap margin-bottom-1"}>
        <ArrowTooltip title={Config.profileDefaults.default.lockedFieldTooltipText}>
          <div className="fdr fac  font-body-lg">
            <Icon>help_outline</Icon>
          </div>
        </ArrowTooltip>
      </div>
      {isTabletAndUp ? <div className="margin-x-2">|</div> : <></>}
    </div>
  );

  return (
    <profileFormContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "STARTING",
          },
          setProfileData,
          onBack: (): void => {},
        }}
      >
        <div className={isTabletAndUp ? "flex flex-row" : ""}>
          <ThemeProvider theme={createTheme()}>
            {shouldLockTaxId ? (
              <Alert variant="success" className="width-100">
                <DisabledTaxId template={DisabledElement} />
              </Alert>
            ) : (
              <>
                <OnboardingTaxId required />
                <div className="tablet:margin-top-05 tablet:margin-left-2">
                  <SecondaryButton
                    isColor="primary"
                    onClick={onSubmit}
                    isLoading={isLoading}
                    isSubmitButton={true}
                    isRightMarginRemoved={true}
                    isTextNoWrap={isTabletAndUp}
                    isFullWidthOnDesktop={!isTabletAndUp}
                  >
                    {saveButtonText}
                  </SecondaryButton>
                </div>
              </>
            )}
          </ThemeProvider>
        </div>
      </ProfileDataContext.Provider>
    </profileFormContext.Provider>
  );
};
