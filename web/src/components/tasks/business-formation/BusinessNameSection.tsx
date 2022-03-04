import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { SearchBusinessNameError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, TextField, useMediaQuery } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";

const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
  BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
  SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
};

export const BusinessNameSection = (): ReactElement => {
  const { state, setTab, setFormationFormData } = useContext(FormationContext);
  const { userData, update } = useUserData();
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const {
    currentName,
    submittedName,
    isNameFieldEmpty,
    isLoading,
    error,
    nameAvailability,
    updateCurrentName,
    onBlurNameField,
    searchBusinessName,
  } = useBusinessNameSearch(true);

  const submitNameAndContinue = async () => {
    if (!userData) return;
    const newFormationFormData = {
      ...state.formationFormData,
      businessName: submittedName,
    };
    setFormationFormData(newFormationFormData);
    update({
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: submittedName,
      },
      formationData: {
        ...userData.formationData,
        formationFormData: newFormationFormData,
      },
    });
    analytics.event.business_formation_name_step_continue_button.click.go_to_next_formation_step();
    setTab(state.tab + 1);
  };

  return (
    <div data-testid="business-name-section">
      <form onSubmit={searchBusinessName} className="usa-prose grid-container padding-0">
        <Content>{state.displayContent.businessNameCheck.contentMd}</Content>
        <div className="text-bold">{Config.businessFormationDefaults.nameCheckFieldLabel}</div>
        <div className="grid-row grid-gap-2">
          <div className="tablet:grid-col-8">
            <TextField
              autoComplete="off"
              className="fg1 width-100"
              margin="dense"
              value={currentName}
              onChange={updateCurrentName}
              variant="outlined"
              placeholder={Config.businessFormationDefaults.nameCheckPlaceholderText}
              inputProps={{
                "aria-label": "Search business name",
              }}
              error={isNameFieldEmpty}
              helperText={
                isNameFieldEmpty ? Config.businessFormationDefaults.nameCheckValidationErrorText : undefined
              }
              onBlur={onBlurNameField}
            />
          </div>
          <div className="flex flex-justify-end tablet:flex-auto tablet:flex-justify tablet:grid-col-4">
            <FormControl margin="dense">
              <Button
                style="secondary-input-field-height"
                onClick={() => {}}
                loading={isLoading}
                typeSubmit
                noRightMargin
              >
                {Config.searchBusinessNameTask.searchButtonText}
              </Button>
            </FormControl>
          </div>
        </div>
      </form>
      {error != null && (
        <Alert variant="error" dataTestid={`error-alert-${error}`}>
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      {nameAvailability != null && nameAvailability.status === "UNAVAILABLE" && (
        <Alert variant="error" dataTestid="unavailable-text">
          <p className="font-sans-xs">
            {templateEval(Config.businessFormationDefaults.nameCheckUnavailableText, {
              name: submittedName,
            })}
          </p>
          {nameAvailability.similarNames.length > 0 && (
            <>
              <p className="font-sans-xs margin-bottom-1">
                {Config.searchBusinessNameTask.similarUnavailableNamesText}
              </p>
              <ul className="usa-list">
                {nameAvailability.similarNames.map((otherName) => (
                  <li className="text-uppercase text-bold margin-y-0 font-sans-xs" key={otherName}>
                    {otherName}
                  </li>
                ))}
              </ul>
            </>
          )}
        </Alert>
      )}
      {nameAvailability?.status === "AVAILABLE" && submittedName === currentName && (
        <Alert variant="success" dataTestid="available-text">
          <span className="font-sans-xs">
            {templateEval(Config.businessFormationDefaults.nameCheckAvailableText, {
              name: submittedName,
            })}
          </span>
        </Alert>
      )}
      <div
        className={"padding-3 bg-base-lightest flex flex-justify-end task-submit-button-background"}
        style={{
          visibility:
            nameAvailability?.status === "AVAILABLE" && submittedName === currentName ? "visible" : "hidden",
        }}
      >
        <Button
          style="primary"
          onClick={submitNameAndContinue}
          noRightMargin
          widthAutoOnMobile
          heightAutoOnMobile={isMobile}
        >
          {Config.businessFormationDefaults.initialNextButtonText}
        </Button>
      </div>
    </div>
  );
};
