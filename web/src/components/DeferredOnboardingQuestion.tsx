import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getFlow } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, ReactNode, useEffect, useState } from "react";

interface Props {
  children: ReactNode;
  label: ReactNode;
  onSave: () => void;
}

export const DeferredOnboardingQuestion = (props: Props): ReactElement => {
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { business, updateQueue } = useUserData();
  const { Config } = useConfig();

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  useEffect(() => {
    if (!business) return;
    // Use setTimeout to avoid cascading renders
    const timeoutId = setTimeout(() => {
      setProfileData(business.profileData);
    }, 0);
    return (): void => clearTimeout(timeoutId);
  }, [business]);

  FormFuncWrapper(async () => {
    if (!updateQueue || !business) return;
    const profileDataHasNotChanged =
      JSON.stringify(profileData) === JSON.stringify(business.profileData);
    if (profileDataHasNotChanged) {
      return;
    }

    await updateQueue.queueProfileData(profileData).update();

    props.onSave();
  });

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: getFlow(profileData),
          },
          setProfileData,
          onBack: (): void => {},
        }}
      >
        <div className="padding-3">
          {props.label}
          <div className="display-flex mobile-lg:flex-row flex-column mobile-lg:flex-align-center">
            <div className="margin-right-1 width-100 text-field-width-default margin-bottom-05">
              {props.children}
            </div>
            <SecondaryButton
              isColor="primary"
              onClick={onSubmit}
              dataTestId="deferred-question-save"
            >
              {Config.deferredLocation.deferredOnboardingSaveButtonText}
            </SecondaryButton>
          </div>
        </div>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
