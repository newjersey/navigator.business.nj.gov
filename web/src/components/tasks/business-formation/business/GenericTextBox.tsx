import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { FormationFields } from "@/lib/types/types";
import { camelCaseToSentence } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext, useState } from "react";

interface Props {
  maxChars: number;
  fieldName: FormationFields;
  required: boolean;
  inputLabel?: string;
  optionalLabel?: string;
  placeholderText: string;
  addButtonText?: string;
  title: string;
  contentMd: string;
}

export const GenericTextbox = (props: Props): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const [isExpanded, setIsExpanded] = useState(props.required || !!state.formationFormData[props.fieldName]);

  const handleAddButtonClick = (): void => {
    setIsExpanded(true);
  };

  const handleChange = (value: string) => {
    setFormationFormData({
      ...state.formationFormData,
      [props.fieldName]: value,
    });
  };

  const removeEntry = (): void => {
    setIsExpanded(false);
    setFormationFormData({
      ...state.formationFormData,
      [props.fieldName]: "",
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {props.title}{" "}
          {!props.required ? (
            <span className="text-normal font-body-lg">
              {props.optionalLabel ?? Config.businessFormationDefaults.optionalLabel}
            </span>
          ) : (
            <></>
          )}
        </div>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <Button style="tertiary" onClick={handleAddButtonClick}>
              {props.addButtonText}
            </Button>
          )}
        </div>
      </div>
      {isExpanded ? (
        <>
          <Content className="margin-bottom-2">{props.contentMd}</Content>
          <div style={{ maxWidth: "41em" }}>
            {props.inputLabel && <Content>{props.inputLabel}</Content>}
            <div className="grid-row">
              <div className="grid-col">
                <GenericTextField
                  value={state.formationFormData[props.fieldName] as string}
                  placeholder={props.placeholderText}
                  handleChange={(value) => handleChange(value)}
                  fieldName={props.fieldName}
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
              {!props.required ? (
                <div className="grid-col-auto margin-x-2 margin-top-3 display-flex flex-column flex-justify-center">
                  <Button
                    style="tertiary"
                    onClick={() => removeEntry()}
                    className="display-flex flex-column flex-justify-center"
                  >
                    <Icon
                      className="font-body-lg"
                      label={`remove ${camelCaseToSentence(props.fieldName).toLowerCase()}`}
                    >
                      delete
                    </Icon>
                  </Button>
                </div>
              ) : (
                <></>
              )}
            </div>
            <div className="text-base-dark margin-top-1 margin-bottom-2">
              {(state.formationFormData[props.fieldName] as string)?.length ?? 0} / {props.maxChars}{" "}
              {Config.businessFormationDefaults.charactersLabel}
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
    </>
  );
};
