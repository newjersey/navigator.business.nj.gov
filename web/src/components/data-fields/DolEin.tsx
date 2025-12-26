import { Content } from "@/components/Content";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { GenericTextField } from "@/components/GenericTextField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext, useState } from "react";
import { formatDolEin } from "@/lib/domain-logic/formatDolEin";
import { ShowHideStatus, ShowHideToggleButton } from "@/components/ShowHideToggleButton";
import { InputAdornment } from "@mui/material";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useMountEffect } from "@/lib/utils/helpers";
import { DOL_EIN_CHARACTERS } from "@businessnjgovnavigator/shared";

interface Props {
  editable?: boolean;
  onValidation?: (fieldName: string, invalid: boolean) => void;
  handleChange?: (value: string) => void;
  value: string | undefined;
  error?: boolean;
  validationText?: string;
  startHidden?: boolean;
}

export const DOL_EIN_CHARACTERS_WITH_FORMATTING = 20;

export const DolEin = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const [showHideStatus, setShowHideStatus] = useState<ShowHideStatus>(
    props.startHidden ? "password-view" : "text-view",
  );
  const [isEncrypted, setIsEncrypted] = useState(false);
  const value = props.value ?? state?.profileData.deptOfLaborEin;

  useMountEffect(() => {
    if (state.profileData.deptOfLaborEin.length > 0) {
      setIsEncrypted(true);
    }
  });

  const toggleShowHide = async (): Promise<void> => {
    if (showHideStatus === "password-view" && isEncrypted) {
      await decryptValue({
        encryptedValue: state.profileData.deptOfLaborEin as string,
      }).then((decryptedValue) => {
        setProfileData({ ...state.profileData, deptOfLaborEin: decryptedValue });
        setIsEncrypted(false);
      });
    }

    if (showHideStatus === "password-view") {
      setShowHideStatus("text-view");
    } else {
      setShowHideStatus("password-view");
    }
  };

  const getShowHideToggleButton = (): ReactElement => {
    return (
      <ShowHideToggleButton
        showText={Config.profileDefaults.fields.deptOfLaborEin.default.showButtonText}
        hideText={Config.profileDefaults.fields.deptOfLaborEin.default.hideButtonText}
        status={showHideStatus}
        toggle={toggleShowHide}
      />
    );
  };

  const getDisplayValue = (value: string | undefined): string => {
    if (!value) return "";
    if (showHideStatus === "text-view") {
      return formatDolEin(value);
    } else {
      return formatDolEin("*".repeat(DOL_EIN_CHARACTERS));
    }
  };

  return (
    <>
      <strong>
        <Content>{Config.employerRates.dolEinLabelText}</Content>
      </strong>

      {props.editable && (
        <ScrollableFormFieldWrapper fieldName={"dolEin"}>
          <div className="text-field-width-reduced padding-bottom-2">
            <GenericTextField
              numericProps={{
                maxLength: DOL_EIN_CHARACTERS,
              }}
              fieldName={"dolEin"}
              inputWidth={"default"}
              disabled={showHideStatus === "password-view"}
              value={value}
              onValidation={props.onValidation}
              error={props.error}
              validationText={props.validationText}
              onChange={props.handleChange}
              visualFilter={getDisplayValue}
              inputProps={{
                endAdornment: (
                  <InputAdornment position="end">{getShowHideToggleButton()}</InputAdornment>
                ),
              }}
            />
          </div>
        </ScrollableFormFieldWrapper>
      )}

      {!props.editable && (
        <>
          <span className={"margin-right-1"}>{getDisplayValue(value)}</span>
          <span>{getShowHideToggleButton()}</span>
        </>
      )}
    </>
  );
};
