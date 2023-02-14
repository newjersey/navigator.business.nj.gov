import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { SearchBusinessNameError } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { FormControl, TextField, useMediaQuery } from "@mui/material";
import { FocusEvent, FormEvent, ReactElement, useContext, useEffect, useRef } from "react";

export const BusinessNameStep = (): ReactElement => {
  const FIELD_NAME = "businessName";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted, setBusinessNameAvailability } =
    useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const {
    currentName,
    submittedName,
    isLoading,
    error,
    nameAvailability,
    updateCurrentName,
    onBlurNameField,
    searchBusinessName,
  } = useBusinessNameSearch({ isBusinessFormation: true, isDba: false });
  const { doesFieldHaveError } = useFormationErrors();
  const mountEffectOccurred = useRef<boolean>(false);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  useEffect(() => {
    if (!userData || !state.hasSetStateFirstTime || mountEffectOccurred.current) return;
    const nameToSet = state.formationFormData.businessName || userData.profileData.businessName;
    updateCurrentName(nameToSet);
    setFormationFormData((prev) => ({ ...prev, businessName: nameToSet }));
    mountEffectOccurred.current = true;
  }, [
    userData,
    state.hasSetStateFirstTime,
    mountEffectOccurred,
    state.formationFormData,
    updateCurrentName,
    setFormationFormData,
  ]);

  useEffect(() => {
    setBusinessNameAvailability(nameAvailability);
  }, [nameAvailability, setBusinessNameAvailability]);

  const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  const setNameInFormationData = () => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessName: currentName,
      };
    });
  };

  const doSearch = (event: FormEvent<HTMLFormElement>): void => {
    searchBusinessName(event).catch(() => {});
    setNameInFormationData();
    setFieldsInteracted([FIELD_NAME]);
  };

  const hasError = doesFieldHaveError(FIELD_NAME) && state.hasBusinessNameBeenSearched && !isLoading;

  return (
    <div data-testid="business-name-step">
      <form onSubmit={doSearch} className="usa-prose grid-container padding-0">
        <Content>{state.displayContent.businessNameCheck.contentMd}</Content>
        <WithErrorBar hasError={hasError} type="DESKTOP-ONLY">
          <div className="text-bold margin-top-1">{Config.formation.fields.businessName.label}</div>
          <div className={isTabletAndUp ? "grid-row grid-gap-2" : "display-flex flex-column"}>
            <div className={isTabletAndUp ? "grid-col-8" : ""}>
              <WithErrorBar hasError={hasError} type="MOBILE-ONLY">
                <TextField
                  autoComplete="no"
                  className="fg1 width-100"
                  margin="dense"
                  value={currentName}
                  onChange={(event) => {
                    return updateCurrentName(event.target.value);
                  }}
                  variant="outlined"
                  placeholder={Config.formation.fields.businessName.placeholder}
                  inputProps={{
                    "aria-label": "Search business name",
                  }}
                  error={hasError}
                  helperText={
                    hasError
                      ? getErrorStateForField(
                          "businessName",
                          state.formationFormData,
                          nameAvailability,
                          state.displayContent
                        ).label
                      : undefined
                  }
                  onBlur={(event: FocusEvent<HTMLInputElement>) => {
                    setNameInFormationData();
                    setFieldsInteracted([FIELD_NAME]);
                    onBlurNameField(event.target.value);
                  }}
                />{" "}
              </WithErrorBar>
            </div>
            <FormControl margin="dense">
              <SecondaryButton
                isColor="primary"
                onClick={() => {}}
                isLoading={isLoading}
                isSubmitButton={true}
                isRightMarginRemoved={true}
                dataTestId="business-name-search-submit"
                isNotFullWidthOnMobile={true}
              >
                {Config.searchBusinessNameTask.searchButtonText}
              </SecondaryButton>
            </FormControl>
          </div>
        </WithErrorBar>
      </form>
      {error != null && (
        <Alert variant="error" dataTestid={`error-alert-${error}`}>
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      {nameAvailability?.status === "DESIGNATOR" && (
        <Alert variant="error" dataTestid="designator-text">
          <p className="font-sans-xs">{Config.formation.fields.businessName.alertDesignator}</p>
        </Alert>
      )}
      {nameAvailability?.status === "SPECIAL_CHARACTER" && (
        <Alert variant="error" dataTestid="special-character-text">
          <Content className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertSpecialCharacters, {
              name: submittedName,
            })}
          </Content>
        </Alert>
      )}
      {nameAvailability?.status === "RESTRICTED" && (
        <Alert variant="error" dataTestid="restricted-word-text">
          <Content className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertRestrictedWord, {
              name: submittedName,
              word: nameAvailability.invalidWord ?? "*unknown*",
            })}
          </Content>
        </Alert>
      )}

      {nameAvailability?.status === "UNAVAILABLE" && (
        <Alert variant="error" dataTestid="unavailable-text">
          <p className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertUnavailable, {
              name: submittedName,
            })}
          </p>
          {nameAvailability.similarNames.length > 0 && (
            <>
              <p className="font-sans-xs margin-bottom-1">
                {Config.searchBusinessNameTask.similarUnavailableNamesText}
              </p>
              <ul className="usa-list">
                {nameAvailability.similarNames.map((otherName) => {
                  return (
                    <li className="text-uppercase text-bold margin-y-0 font-sans-xs" key={otherName}>
                      {otherName}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Alert>
      )}
      {nameAvailability?.status === "AVAILABLE" && (
        <Alert variant="success" dataTestid="available-text">
          <span className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertAvailable, {
              name: submittedName,
            })}
          </span>
        </Alert>
      )}
    </div>
  );
};
