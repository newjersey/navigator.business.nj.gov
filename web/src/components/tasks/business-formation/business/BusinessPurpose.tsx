import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext, useState } from "react";

export const BusinessPurpose = (): ReactElement => {
  const MAX_CHARS = 300;
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(!!state.formationFormData.businessPurpose);

  const handleButtonClick = (): void => {
    if (!isExpanded) {
      setIsExpanded(true);
    } else {
      setIsExpanded(false);
      setFormationFormData({
        ...state.formationFormData,
        businessPurpose: "",
      });
    }
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-0">
          {Config.businessFormationDefaults.businessPurposeTitle}{" "}
          <span className="text-normal font-body-lg">
            {Config.businessFormationDefaults.businessPurposeOptionalLabel}
          </span>
        </div>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <Button style="tertiary" onClick={handleButtonClick}>
              {Config.businessFormationDefaults.businessPurposeAddButtonText}
            </Button>
          )}
        </div>
      </div>
      {isExpanded && (
        <div style={{ maxWidth: "41rem" }}>
          <Content className="margin-bottom-2">
            {Config.businessFormationDefaults.businessPurposeBodyText}
          </Content>
          <div className="grid-row">
            <div className="grid-col">
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.businessPurposeLabel}
                placeholder={Config.businessFormationDefaults.businessPurposePlaceholderText}
                fieldName="businessPurpose"
                required={false}
                fieldOptions={{
                  multiline: true,
                  rows: 3,
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
                onClick={handleButtonClick}
                className="display-flex flex-column flex-justify-center"
              >
                <Icon className="font-body-lg" label="remove business purpose">
                  delete
                </Icon>
              </Button>
            </div>
          </div>
          <div className="text-base-dark margin-top-1 margin-bottom-2">
            {state.formationFormData.businessPurpose.length} / {MAX_CHARS}{" "}
            {Config.businessFormationDefaults.charactersLabel}
          </div>
        </div>
      )}
    </>
  );
};
