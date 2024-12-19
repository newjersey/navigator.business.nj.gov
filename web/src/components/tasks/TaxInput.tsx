import { ArrowTooltip } from "@/components/ArrowTooltip";
import { DisabledTaxId } from "@/components/data-fields/tax-id/DisabledTaxId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Icon } from "@/components/njwds/Icon";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { createProfileFieldErrorMap, Task } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { useMediaQuery } from "@mui/material";
import { ReactElement, ReactNode, useContext, useEffect, useState } from "react";

interface Props {
  task: Task;
}

export const TaxInput = (props: Props): ReactElement<any> => {
  const { business, updateQueue } = useUserData();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const [profileData, setProfileData] = useState<ProfileData>(
    business?.profileData ?? createEmptyProfileData()
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

  const DisabledElement = (props: { children: ReactNode }): ReactElement<any> => (
    <div className={`flex ${isTabletAndUp ? "flex-row" : "flex-column margin-right-2"} no-wrap`}>
      <div className={`${isTabletAndUp ? "padding-right-1" : ""}`}>{Config.tax.lockedPreText}</div>
      <div>{props.children}</div>
      <div className={`${isTabletAndUp ? "padding-left-1" : ""} margin-right-1`}>
        {Config.tax.lockedPostText}
      </div>
      <div className={"text-wrap margin-bottom-1"}>
        <ArrowTooltip title={Config.profileDefaults.default.lockedFieldTooltipText}>
          <div className="fdr fac  font-body-lg">
            <Icon iconName="help_outline" />
          </div>
        </ArrowTooltip>
      </div>
      {isTabletAndUp ? <div className="margin-x-2">|</div> : <></>}
    </div>
  );

  const getNeedsAccountModalFunction = (): (() => void) | undefined => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return () => {
        return setShowNeedsAccountModal(true);
      };
    }
    return undefined;
  };

  const onSave = (): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
    } else {
      onSubmit();
    }
  };

  return (
    <ProfileFormContext.Provider value={formContextState}>
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
          {shouldLockTaxId ? (
            <Alert variant="success" className="width-100">
              <DisabledTaxId template={DisabledElement} />
            </Alert>
          ) : (
            <>
              <TaxId
                required={isAuthenticated === IsAuthenticated.TRUE}
                handleChangeOverride={getNeedsAccountModalFunction()}
              />
              <div className="tablet:margin-top-05 tablet:margin-left-2">
                <SecondaryButton
                  isColor="primary"
                  onClick={onSave}
                  isLoading={isLoading}
                  isSubmitButton={true}
                  isRightMarginRemoved={true}
                  isFullWidthOnDesktop={!isTabletAndUp}
                >
                  {saveButtonText}
                </SecondaryButton>
              </div>
            </>
          )}
        </div>
      </ProfileDataContext.Provider>
    </ProfileFormContext.Provider>
  );
};
