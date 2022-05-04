import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext, useState } from "react";

export const BusinessPurpose = (): ReactElement => {
  const MAX_CHARS = 300;
  const { state, setFormationFormData } = useContext(FormationContext);
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
        <h2 className="margin-bottom-0">
          {Config.businessFormationDefaults.businessPurposeTitle}
          <span className="text-normal font-body-lg margin-left-1">
            {Config.businessFormationDefaults.businessPurposeOptionalLabel}
          </span>
        </h2>
        <div className="mobile-lg:margin-left-auto flex flex-justify-center">
          {!isExpanded && (
            <Button style="tertiary" onClick={handleButtonClick}>
              {Config.businessFormationDefaults.businessPurposeAddButtonText}
            </Button>
          )}
        </div>
      </div>
      {isExpanded && (
        <>
          <div className="grid-row">
            <div className="grid-col">
              <BusinessFormationTextField
                label={Config.businessFormationDefaults.businessPurposeLabel}
                placeholder={Config.businessFormationDefaults.businessPurposePlaceholderText}
                fieldName="businessPurpose"
                required={false}
                fieldOptions={{
                  multiline: true,
                  rows: 5,
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
          <div className="text-base-dark margin-top-1">
            {state.formationFormData.businessPurpose.length} / {MAX_CHARS}
          </div>
        </>
      )}
    </>
  );
};
