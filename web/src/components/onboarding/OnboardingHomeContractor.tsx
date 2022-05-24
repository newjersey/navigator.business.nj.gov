import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import React, { ReactElement, useContext } from "react";

export const OnboardingHomeContractor = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);
  return (
    <>
      <Content>{Config.profileDefaults[state.flow].homeContractor.description}</Content>
    </>
  );
};
