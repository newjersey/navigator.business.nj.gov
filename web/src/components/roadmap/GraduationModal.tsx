import { DialogTwoButton } from "@/components/DialogTwoButton";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postGetAnnualFilings } from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { BusinessPersona } from "@businessnjgovnavigator/shared";
import {
  createEmptyProfileData,
  Industries,
  LegalStructures,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { FormControl } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useMemo, useState } from "react";

interface Props {
  open: boolean;
  handleClose: () => void;
  onSave: () => void;
}

export const GraduationModal = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());
  const { userData, update } = useUserData();

  const needsDateOfFormation = useMemo(
    () => LegalStructures.find((x) => x.id === userData?.profileData.legalStructureId)?.requiresPublicFiling,
    [userData?.profileData.legalStructureId]
  );

  useMountEffectWhenDefined(() => {
    if (userData) {
      const userProfileData = userData.profileData;
      if (!userProfileData.sectorId && userProfileData.industryId) {
        const industry = Industries.find((i) => i.id == userProfileData.industryId);
        const newProfileData = {
          ...userProfileData,
          sectorId: industry?.defaultSectorId,
        };
        setProfileData(newProfileData);
      } else {
        setProfileData(userData.profileData);
      }
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
      businessPersona: "OWNING" as BusinessPersona,
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
      businessName: { invalid: !profileData.businessName },
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
            {!userData?.formationData.getFilingResponse?.success ? (
              <OnboardingBusinessName
                onValidation={onValidation}
                fieldStates={fieldStates}
                headerAriaLevel={3}
              />
            ) : undefined}
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
