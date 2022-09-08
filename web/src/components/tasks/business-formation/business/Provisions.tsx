import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const Provisions = (): ReactElement => {
  const MAX_CHARS = 3000;
  const { state, setFormationFormData, setFieldInteracted } = useContext(BusinessFormationContext);
  const isExpanded = state.formationFormData.provisions.length > 0;

  const handleAddButtonClick = (): void => {
    setFormationFormData({
      ...state.formationFormData,
      provisions: [""],
    });
  };

  const handleProvisionChange = (value: string, index: number) => {
    setFieldInteracted("provisions");
    const newProvisions = [...state.formationFormData.provisions];
    newProvisions[index] = value;
    setFormationFormData({
      ...state.formationFormData,
      provisions: newProvisions,
    });
  };

  const removeProvision = (index: number): void => {
    const newProvisions = [...state.formationFormData.provisions];
    newProvisions.splice(index, 1);

    setFormationFormData({
      ...state.formationFormData,
      provisions: newProvisions,
    });
  };

  const handleAddAnother = () => {
    setFormationFormData({
      ...state.formationFormData,
      provisions: [...state.formationFormData.provisions, ""],
    });
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.businessFormationDefaults.provisionsTitle}{" "}
          <span className="text-normal font-body-lg">
            {Config.businessFormationDefaults.provisionsOptionalLabel}
          </span>
        </div>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <Button style="tertiary" onClick={handleAddButtonClick}>
              {Config.businessFormationDefaults.provisionsAddButtonText}
            </Button>
          )}
        </div>
      </div>
      {isExpanded && (
        <Content className="margin-bottom-2">{Config.businessFormationDefaults.provisionsBodyText}</Content>
      )}
      {state.formationFormData.provisions.map((provision: string, index: number) => (
        <div key={index}>
          <Content>{Config.businessFormationDefaults.provisionsLabel}</Content>
          <div className="grid-row">
            <div className="grid-col">
              <GenericTextField
                value={provision}
                placeholder={Config.businessFormationDefaults.provisionsPlaceholderText}
                handleChange={(value) => handleProvisionChange(value, index)}
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
              <Button
                style="tertiary"
                onClick={() => removeProvision(index)}
                className="display-flex flex-column flex-justify-center"
              >
                <Icon className="font-body-lg" label="remove provision">
                  delete
                </Icon>
              </Button>
            </div>
          </div>
          <div className="text-base-dark margin-top-1 margin-bottom-2">
            {provision.length} / {MAX_CHARS} {Config.businessFormationDefaults.charactersLabel}
          </div>
        </div>
      ))}
      {isExpanded && state.formationFormData.provisions.length < 10 && (
        <Button onClick={handleAddAnother} className="margin-top-2" style="tertiary">
          <Icon>add</Icon>
          {Config.businessFormationDefaults.provisionsAddAnotherButtonText}
        </Button>
      )}
    </>
  );
};
