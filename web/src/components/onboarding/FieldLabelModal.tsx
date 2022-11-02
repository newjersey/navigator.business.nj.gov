/* eslint-disable @typescript-eslint/no-explicit-any */

import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileContentField } from "@/lib/types/types";
import { useContext } from "react";

interface FieldOverrides {
  header?: string;
  description?: string;
  headerNotBolded?: string;
}

interface Props {
  fieldName: ProfileContentField;
  overrides?: FieldOverrides;
}

export const FieldLabelModal = (props: Props) => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const header =
    props.overrides?.header || (Config.profileDefaults[state.flow][props.fieldName] as any).header;
  const description =
    props.overrides?.description || (Config.profileDefaults[state.flow][props.fieldName] as any).description;
  const unboldedHeader =
    props.overrides?.headerNotBolded ||
    (Config.profileDefaults[state.flow][props.fieldName] as any).headerNotBolded;

  return (
    <>
      <div className="margin-bottom-2">
        <strong>
          <Content>{header}</Content>
          {unboldedHeader && (
            <>
              {" "}
              <span className="text-light">{unboldedHeader}</span>
            </>
          )}
        </strong>
      </div>
      {description && <Content>{description}</Content>}
    </>
  );
};
