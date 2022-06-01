import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const OnboardingEmploymentAgency = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  return (
    <>
      <Content>{Config.profileDefaults[state.flow].employmentAgency.description}</Content>
    </>
  );
};
