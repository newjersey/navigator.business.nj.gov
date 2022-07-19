/* eslint-disable unicorn/filename-case */
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ReactElement, useContext } from "react";
import { OnboardingField } from "./OnboardingField";

export const ProfileNexusDBANameField = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  return (
    <>
      {state?.profileData.nexusDbaName && (
        <div>
          <OnboardingField fieldName={"nexusDbaName"} />
        </div>
      )}
    </>
  );
};
