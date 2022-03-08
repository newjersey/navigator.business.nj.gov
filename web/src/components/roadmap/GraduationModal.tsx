import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  createProfileFieldErrorMap,
  LoadDisplayContent,
  ProfileFieldErrorMap,
  ProfileFields,
  UserDisplayContent,
} from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ProfileDataContext } from "@/pages/onboarding";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  createEmptyProfileData,
  Industries,
  LegalStructures,
  ProfileData,
} from "@businessnjgovnavigator/shared";
import { Dialog, DialogContent, DialogTitle, FormControl, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { FormEvent, ReactElement, useMemo, useState } from "react";

interface Props {
  open: boolean;
  displayContent: LoadDisplayContent;
  handleClose: () => void;
  onSave: () => void;
}

export const GraduationModal = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const { userData, update } = useUserData();

  const mergeDisplayContent = (): UserDisplayContent => {
    return {
      ...props.displayContent["OWNING"],
      ...props.displayContent["PROFILE"],
    } as UserDisplayContent;
  };

  const mergedDisplayContent = useMemo(mergeDisplayContent, [props.displayContent]);

  const needsDateOfFormation = useMemo(
    () => LegalStructures.find((x) => x.id === userData?.profileData.legalStructureId)?.requiresPublicFiling,
    [userData?.profileData.legalStructureId]
  );

  useMountEffectWhenDefined(() => {
    if (userData) {
      const userProfileData = userData.profileData;
      if (!userProfileData.sectorId && userProfileData.industryId) {
        const industry = Industries.find((i) => i.id == userProfileData.industryId);
        userProfileData.sectorId = industry?.defaultSectorId;
      }
      setProfileData(userProfileData);
    }
  }, userData);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { invalid } });
  };

  const handleClose = () => {
    props.handleClose();
    setFieldStates(createProfileFieldErrorMap());
  };

  const graduateToOwning = async (): Promise<void> => {
    if (!userData) return;

    const newProfileData = {
      ...profileData,
      hasExistingBusiness: true,
    };
    setAnalyticsDimensions(newProfileData);
    analytics.event.graduation_modal.submit.prospective_roadmap_to_existing_dashboard();
    await update({
      ...userData,
      profileData: newProfileData,
    });

    await router.push("/dashboard");
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userData) return;
    const errorMap = {
      ...fieldStates,
      sectorId: { invalid: !profileData.sectorId },
      existingEmployees: { invalid: !profileData.existingEmployees },
      dateOfFormation: { invalid: !!(needsDateOfFormation && !profileData.dateOfFormation) },
    };
    setFieldStates(errorMap);
    if (Object.keys(errorMap).some((k) => errorMap[k as ProfileFields].invalid)) return;

    await graduateToOwning();
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          displayContent: mergedDisplayContent,
          flow: "OWNING",
          municipalities: [],
        },
        setProfileData,
        setUser: () => {},
        onBack: () => {},
      }}
    >
      <Dialog open={props.open} maxWidth="md" onClose={handleClose} data-testid={"onboarding-modal"}>
        <DialogTitle sx={{ padding: 3, paddingBottom: 0 }}>
          <Content>{Config.roadmapDefaults.graduationModalTitle}</Content>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: "absolute",
              right: 10,
              top: 12,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
        </DialogTitle>

        <DialogContent dividers={true}>
          <div className="margin-bottom-1">
            <form data-testid="onboarding-modal-content" onSubmit={onSubmit}>
              <div className="grid-row grid-gap-2">
                <FormControl fullWidth={true}>
                  {needsDateOfFormation ? (
                    <OnboardingDateOfFormation
                      onValidation={onValidation}
                      fieldStates={fieldStates}
                      required={true}
                      disabled={userData?.formationData.getFilingResponse?.success}
                      headerAriaLevel={3}
                    />
                  ) : undefined}
                  <div className="margin-top-1">
                    <OnboardingSectors
                      onValidation={onValidation}
                      fieldStates={fieldStates}
                      headerAriaLevel={3}
                    />
                  </div>
                  <div className="margin-top-1">
                    <OnboardingOwnership headerAriaLevel={3} />
                  </div>
                  <div className="margin-top-4">
                    <OnboardingExistingEmployees
                      onValidation={onValidation}
                      fieldStates={fieldStates}
                      headerAriaLevel={3}
                    />
                  </div>
                </FormControl>
              </div>
              <div className="margin-top-2">
                <div
                  className="padding-3 bg-base-lightest flex flex-justify-end task-submit-button-background flex-wrap"
                  style={{ gap: "1rem" }}
                >
                  <Button
                    style="secondary"
                    onClick={handleClose}
                    dataTestid="onboardingModalCancel"
                    widthAutoOnMobile
                    noRightMargin
                  >
                    {Config.roadmapDefaults.graduationModalCancelButtonText}
                  </Button>
                  <Button
                    style="primary"
                    typeSubmit={true}
                    dataTestid="onboardingModalSubmit"
                    noRightMargin
                    widthAutoOnMobile
                  >
                    <span className="text-no-wrap">
                      {Config.roadmapDefaults.graduationModalContinueButtonText}
                    </span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </ProfileDataContext.Provider>
  );
};
