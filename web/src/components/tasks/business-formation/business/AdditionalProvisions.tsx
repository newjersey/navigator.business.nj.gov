import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const AdditionalProvisions = (): ReactElement => {
  const MAX_CHARS = 3000;
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const isExpanded =
    state.formationFormData.additionalProvisions && state.formationFormData.additionalProvisions.length > 0;

  const handleAddButtonClick = (): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        additionalProvisions: [""],
      };
    });
  };

  const handleProvisionChange = (value: string, index: number): void => {
    setFieldsInteracted(["additionalProvisions"]);
    const newProvisions = [...(state.formationFormData.additionalProvisions ?? [])];
    newProvisions[index] = value;
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        additionalProvisions: newProvisions,
      };
    });
  };

  const removeProvision = (index: number): void => {
    const newProvisions = [...(state.formationFormData.additionalProvisions ?? [])];
    newProvisions.splice(index, 1);

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        additionalProvisions: newProvisions,
      };
    });
  };

  const handleAddAnother = (): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        additionalProvisions: [...(state.formationFormData.additionalProvisions ?? []), ""],
      };
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <Heading level={2} styleVariant="h3" className="margin-0-override">
          {Config.formation.fields.additionalProvisions.label}{" "}
          <span className="text-normal font-body-lg">{Config.formation.general.optionalLabel}</span>
        </Heading>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <UnStyledButton onClick={handleAddButtonClick} dataTestid="show-provisions">
              {Config.formation.fields.additionalProvisions.addButtonText}
            </UnStyledButton>
          )}
        </div>
      </div>
      {isExpanded && (
        <Content className="margin-bottom-2">{Config.formation.fields.additionalProvisions.body}</Content>
      )}
      {state.formationFormData.additionalProvisions?.map((provision: string, index: number) => {
        return (
          <div key={index}>
            <strong>
              <ModifiedContent>{Config.formation.fields.additionalProvisions.secondaryLabel}</ModifiedContent>
            </strong>
            <span className="margin-left-05">{Config.formation.general.optionalLabel}</span>
            <div className="grid-row">
              <div className="grid-col">
                <GenericTextField
                  inputWidth="full"
                  value={provision}
                  handleChange={(value): void => handleProvisionChange(value, index)}
                  fieldName={`provisions ${index}`}
                  fieldOptions={{
                    multiline: true,
                    minRows: 3,
                    maxRows: 20,
                    className: "override-padding",
                    inputProps: {
                      maxLength: MAX_CHARS,
                      sx: {
                        padding: "1rem",
                      },
                    },
                  }}
                />
              </div>
              <div className="grid-col-auto margin-x-2 margin-top-05 display-flex flex-column flex-justify-center">
                <UnStyledButton
                  onClick={(): void => removeProvision(index)}
                  className="display-flex flex-column flex-justify-center"
                >
                  <Icon className="font-body-lg" iconName="delete" label="remove provision" />
                </UnStyledButton>
              </div>
            </div>
            <div className="text-base-dark margin-top-1 margin-bottom-2">
              {provision.length} / {MAX_CHARS} {Config.formation.general.charactersLabel}
            </div>
          </div>
        );
      })}
      {isExpanded &&
        state.formationFormData.additionalProvisions &&
        state.formationFormData.additionalProvisions.length < 10 && (
          <UnStyledButton onClick={handleAddAnother} className="margin-top-2" dataTestid="add-new-provision">
            <Icon iconName="add" />
            {Config.formation.fields.additionalProvisions.addAnotherButtonText}
          </UnStyledButton>
        )}
    </>
  );
};
