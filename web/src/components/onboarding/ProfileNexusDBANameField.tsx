/* eslint-disable unicorn/filename-case */
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";
import { OnboardingField } from "./OnboardingField";

export const ProfileNexusDBANameField = (): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();
  return (
    <>
      {userData?.profileData.nexusDbaName && (
        <div>
          <h3 className="margin-right-105">{Config.profileDefaults.nexusBusinessName.dbaNameHeader}</h3>
          <OnboardingField fieldName={"nexusDbaName"} />
        </div>
      )}
    </>
  );
};
