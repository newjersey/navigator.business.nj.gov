import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import { templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, TextField } from "@mui/material";
import { FocusEvent, FormEvent, ReactElement, useContext, useEffect } from "react";

const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
  BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
  SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
};

export const BusinessNameStep = (): ReactElement => {
  const FIELD_NAME = "businessName";
  const { state, setFormationFormData, setFieldInteracted, setBusinessNameAvailability } =
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

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    updateCurrentName(state.formationFormData.businessName || userData.profileData.businessName);
  }, userData);

  useEffect(() => {
    setBusinessNameAvailability(nameAvailability);
  }, [nameAvailability, setBusinessNameAvailability]);

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
    setFieldInteracted(FIELD_NAME);
  };

  const hasError = doesFieldHaveError(FIELD_NAME) && state.hasBusinessNameBeenSearched && !isLoading;

  return (
    <div data-testid="business-name-step">
      <form onSubmit={doSearch} className="usa-prose grid-container padding-0">
        <Content>{state.displayContent.businessNameCheck.contentMd}</Content>
        <div className={`${hasError ? "error" : ""} input-error-bar`}>
          <div className="text-bold margin-top-1">{Config.businessFormationDefaults.nameCheckFieldLabel}</div>
          <div className="grid-row grid-gap-2">
            <div className="tablet:grid-col-8">
              <TextField
                autoComplete="off"
                className="fg1 width-100"
                margin="dense"
                value={currentName}
                onChange={(event) => {
                  return updateCurrentName(event.target.value);
                }}
                variant="outlined"
                placeholder={Config.businessFormationDefaults.nameCheckPlaceholderText}
                inputProps={{
                  "aria-label": "Search business name",
                }}
                error={hasError}
                helperText={
                  hasError
                    ? getErrorStateForField("businessName", state.formationFormData, nameAvailability).label
                    : undefined
                }
                onBlur={(event: FocusEvent<HTMLInputElement>) => {
                  setNameInFormationData();
                  setFieldInteracted(FIELD_NAME);
                  onBlurNameField(event);
                }}
              />
            </div>
            <div className="flex flex-justify-end tablet:flex-auto tablet:flex-justify tablet:grid-col-4">
              <FormControl margin="dense">
                <Button
                  style="secondary"
                  onClick={() => {}}
                  loading={isLoading}
                  typeSubmit
                  noRightMargin
                  dataTestid="business-name-search-submit"
                >
                  {Config.searchBusinessNameTask.searchButtonText}
                </Button>
              </FormControl>
            </div>
          </div>
        </div>
      </form>
      {error != null && (
        <Alert variant="error" dataTestid={`error-alert-${error}`}>
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      {nameAvailability != null && nameAvailability.status === "DESIGNATOR" && (
        <Alert variant="error" dataTestid="designator-text">
          <p className="font-sans-xs">{Config.businessFormationDefaults.nameCheckDesignatorText}</p>
        </Alert>
      )}
      {nameAvailability != null && nameAvailability.status === "SPECIAL_CHARACTER" && (
        <Alert variant="error" dataTestid="special-character-text">
          <Content className="font-sans-xs">
            {templateEval(Config.businessFormationDefaults.nameCheckSpecialCharacterMarkDown, {
              name: submittedName,
            })}
          </Content>
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
            {templateEval(Config.businessFormationDefaults.nameCheckAvailableText, {
              name: submittedName,
            })}
          </span>
        </Alert>
      )}
    </div>
  );
};
