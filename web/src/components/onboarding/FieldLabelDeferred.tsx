/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileContentField } from "@/lib/types/types";
import { useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
}

export const FieldLabelDeferred = (props: Props) => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const description = (Config.profileDefaults[state.flow][props.fieldName] as any).description;

  return (
    <>
      <Content>{description}</Content>
    </>
  );
};
