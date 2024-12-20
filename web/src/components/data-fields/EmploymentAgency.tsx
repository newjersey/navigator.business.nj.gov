import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, useContext } from "react";

export const EmploymentAgency = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["employmentAgency"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "employmentAgency",
    });

  return (
    <>
      <Content>{contentFromConfig.description}</Content>
    </>
  );
};
