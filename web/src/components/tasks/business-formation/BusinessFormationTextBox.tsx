import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { camelCaseToSentence } from "@/lib/utils/cases-helpers";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useContext, useState } from "react";

interface Props {
  maxChars: number;
  fieldName: FormationTextField;
  className?: string;
  required: boolean;
  inputLabel?: string;
  optionalLabel?: string;
  addButtonText?: string;
  title: string;
  contentMd: string;
}

export const BusinessFormationTextBox = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const [isExpanded, setIsExpanded] = useState(props.required || !!state.formationFormData[props.fieldName]);
  const { doesFieldHaveError } = useFormationErrors();

  const handleAddButtonClick = (): void => {
    setIsExpanded(true);
  };

  const removeEntry = (): void => {
    setIsExpanded(false);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        [props.fieldName]: "",
      };
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <Heading level={2} styleVariant="h3" className="margin-0-override">
          {props.title}{" "}
          {props.required ? (
            <></>
          ) : (
            <span className="text-normal font-body-lg">
              {props.optionalLabel ?? Config.formation.general.optionalLabel}
            </span>
          )}
        </Heading>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <UnStyledButton onClick={handleAddButtonClick} dataTestid={`show-${props.fieldName}`}>
              {props.addButtonText}
            </UnStyledButton>
          )}
        </div>
      </div>
      {isExpanded && (
        <WithErrorBar hasError={doesFieldHaveError(props.fieldName)} type="ALWAYS">
          <Content className="margin-bottom-2">{props.contentMd}</Content>
          <div className="grid-row">
            <div className="grid-col">
              <BusinessFormationTextField
                errorBarType="NEVER"
                fieldName={props.fieldName}
                label={props.inputLabel ?? ""}
                validationText={Config.formation.general.genericErrorText}
                required={props.required}
                fieldOptions={{
                  multiline: true,
                  rows: 3,
                  className: "override-padding",
                  inputProps: {
                    maxLength: props.maxChars,
                    sx: {
                      padding: "1rem",
                    },
                  },
                }}
              />
            </div>
            {props.required ? (
              <></>
            ) : (
              <div className="grid-col-auto margin-x-2 margin-top-3 display-flex flex-column flex-justify-center">
                <UnStyledButton
                  onClick={(): void => removeEntry()}
                  className="display-flex flex-column flex-justify-center"
                >
                  <Icon
                    className="font-body-lg"
                    label={`remove ${camelCaseToSentence(props.fieldName).toLowerCase()}`}
                    iconName="delete"
                  />
                </UnStyledButton>
              </div>
            )}
          </div>
          <div className="text-base-dark margin-top-1 margin-bottom-2">
            {(state.formationFormData[props.fieldName] as string)?.length ?? 0} / {props.maxChars}{" "}
            {Config.formation.general.charactersLabel}
          </div>
        </WithErrorBar>
      )}
    </>
  );
};
