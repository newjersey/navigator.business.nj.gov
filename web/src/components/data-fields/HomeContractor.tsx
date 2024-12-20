import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, useContext } from "react";

export const HomeContractor = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["homeContractor"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "homeContractor",
    });

  return (
    <>
      <Content>{contentFromConfig.description}</Content>
    </>
  );
};
