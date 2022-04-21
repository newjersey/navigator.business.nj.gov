import { DialogTwoButton } from "@/components/DialogTwoButton";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
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
  UserData,
} from "@businessnjgovnavigator/shared/";
import { FormControl } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useMemo, useState } from "react";

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

  const shouldShowSectorDropdown = (): boolean => {
    return profileData.industryId === "generic" || !profileData.industryId;
  };

  const graduateToOwning = async (): Promise<void> => {
    if (!userData) return;

    const newProfileData = {
      ...profileData,
      hasExistingBusiness: true,
    };

    setAnalyticsDimensions(newProfileData);

    let newUserData: UserData = {
      ...userData,
      profileData: newProfileData,
    };

    newUserData = await postGetAnnualFilings(newUserData);

    analytics.event.graduation_modal.submit.prospective_roadmap_to_existing_dashboard();
    await update(newUserData);

    await router.push("/dashboard");
  };

  const onSubmit = async () => {
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
      <DialogTwoButton
        isOpen={props.open}
        close={handleClose}
        title={Config.roadmapDefaults.graduationModalTitle}
        primaryButtonText={Config.roadmapDefaults.graduationModalContinueButtonText}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.roadmapDefaults.graduationModalCancelButtonText}
        maxWidth="md"
        dividers={true}
      >
        <div data-testid="graduation-modal">
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
              {shouldShowSectorDropdown() && (
                <OnboardingSectors
                  onValidation={onValidation}
                  fieldStates={fieldStates}
                  headerAriaLevel={3}
                />
              )}
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
      </DialogTwoButton>
    </ProfileDataContext.Provider>
  );
};
