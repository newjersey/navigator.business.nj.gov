import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement, useContext } from "react";

interface FieldOverrides {
  header: string | undefined;
  description: string | undefined;
  headerNotBolded: string | undefined;
  postDescription: string | undefined;
}

interface Props {
  fieldName: ProfileContentField;
  overrides?: FieldOverrides;
}

export const FieldLabelModal = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: props.fieldName,
  });

  const header = props.overrides?.header ?? contentFromConfig.header;
  const description = props.overrides?.description ?? contentFromConfig.description;
  const unboldedHeader = props.overrides?.headerNotBolded ?? contentFromConfig.headerNotBolded;
  const postDescription = props.overrides?.postDescription;

  return (
    <>
      <div className="margin-bottom-05">
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
      {description && (
        <div data-testid="description">
          <Content>{description}</Content>
        </div>
      )}

      {postDescription && (
        <>
          <div data-testid="postDescription" className="margin-top-05">
            <Content>{postDescription}</Content>
          </div>
        </>
      )}
    </>
  );
};
