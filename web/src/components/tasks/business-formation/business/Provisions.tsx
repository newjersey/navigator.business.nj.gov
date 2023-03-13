import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const Provisions = (): ReactElement => {
  const MAX_CHARS = 3000;
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const isExpanded = state.formationFormData.provisions && state.formationFormData.provisions.length > 0;

  const handleAddButtonClick = (): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        provisions: [""],
      };
    });
  };

  const handleProvisionChange = (value: string, index: number) => {
    setFieldsInteracted(["provisions"]);
    const newProvisions = [...(state.formationFormData.provisions ?? [])];
    newProvisions[index] = value;
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        provisions: newProvisions,
      };
    });
  };

  const removeProvision = (index: number): void => {
    const newProvisions = [...(state.formationFormData.provisions ?? [])];
    newProvisions.splice(index, 1);

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        provisions: newProvisions,
      };
    });
  };

  const handleAddAnother = () => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        provisions: [...(state.formationFormData.provisions ?? []), ""],
      };
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.formation.fields.provisions.label}{" "}
          <span className="text-normal font-body-lg">{Config.formation.general.optionalLabel}</span>
        </div>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <UnStyledButton style="tertiary" onClick={handleAddButtonClick} dataTestid="show-provisions">
              {Config.formation.fields.provisions.addButtonText}
            </UnStyledButton>
          )}
        </div>
      </div>
      {isExpanded && <Content className="margin-bottom-2">{Config.formation.fields.provisions.body}</Content>}
      {state.formationFormData.provisions?.map((provision: string, index: number) => {
        return (
          <div key={index}>
            <b>{Config.formation.fields.provisions.secondaryLabel}</b>
            <span className="margin-left-05">{Config.formation.general.optionalLabel}</span>
            <div className="grid-row">
              <div className="grid-col">
                <GenericTextField
                  value={provision}
                  handleChange={(value) => {
                    return handleProvisionChange(value, index);
                  }}
                  fieldName={`provisions ${index}`}
                  formInputFull
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
              <div className="grid-col-auto margin-x-2 margin-top-3 display-flex flex-column flex-justify-center">
                <UnStyledButton
                  style="tertiary"
                  onClick={() => {
                    return removeProvision(index);
                  }}
                  className="display-flex flex-column flex-justify-center"
                >
                  <Icon className="font-body-lg" label="remove provision">
                    delete
                  </Icon>
                </UnStyledButton>
              </div>
            </div>
            <div className="text-base-dark margin-top-1 margin-bottom-2">
              {provision.length} / {MAX_CHARS} {Config.formation.general.charactersLabel}
            </div>
          </div>
        );
      })}
      {isExpanded && state.formationFormData.provisions && state.formationFormData.provisions.length < 10 && (
        <UnStyledButton
          onClick={handleAddAnother}
          className="margin-top-2"
          style="tertiary"
          dataTestid="add-new-provision"
        >
          <Icon>add</Icon>
          {Config.formation.fields.provisions.addAnotherButtonText}
        </UnStyledButton>
      )}
    </>
  );
};
