/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileContentField } from "@/lib/types/types";
import { useContext } from "react";

interface Props {
  fieldName: ProfileContentField;
}

export const FieldLabelProfile = (props: Props) => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const unboldedHeader = (Config.profileDefaults[state.flow][props.fieldName] as any).headerNotBolded;
  const description = (Config.profileDefaults[state.flow][props.fieldName] as any).description;

  return (
    <>
      <div role="heading" aria-level={3} className="h3-styling margin-bottom-2">
        {(Config.profileDefaults[state.flow][props.fieldName] as any).header}
        {unboldedHeader && (
          <>
            {" "}
            <span className="text-light">{unboldedHeader}</span>
          </>
        )}
      </div>
      {description && <Content>{description}</Content>}
    </>
  );
};
