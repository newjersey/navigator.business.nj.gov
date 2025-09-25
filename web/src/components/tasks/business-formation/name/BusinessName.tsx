import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getErrorStateForFormationField } from "@/components/tasks/business-formation/getErrorStateForFormationField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { MediaQueries } from "@/lib/PageSizes";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";
import { SearchBusinessNameError } from "@businessnjgovnavigator/shared/types";
import { TextField, useMediaQuery } from "@mui/material";
import {
  FocusEvent,
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

export const BusinessName = (): ReactElement => {
  const FIELD_NAME = "businessName";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const [confirmationValue, setConfirmationValue] = useState("");
  const { business } = useUserData();
  const {
    currentName,
    isLoading,
    error,
    updateCurrentName,
    onBlurNameField,
    onChangeNameField,
    searchBusinessName,
    resetNameAvailability,
  } = useBusinessNameSearch({ isBusinessFormation: true, isDba: false });
  const { doesFieldHaveError } = useFormationErrors();
  const mountEffectOccurred = useRef<boolean>(false);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  useEffect(() => {
    if (!business || !state.hasSetStateFirstTime || mountEffectOccurred.current) return;
    const nameToSet = state.formationFormData.businessName || business.profileData.businessName;
    updateCurrentName(nameToSet);

    setFormationFormData((prev) => ({ ...prev, businessName: nameToSet }));
    mountEffectOccurred.current = true;
  }, [
    business,
    state.hasSetStateFirstTime,
    mountEffectOccurred,
    state.formationFormData,
    updateCurrentName,
    setFormationFormData,
  ]);

  const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  const doSearch = (event: FormEvent<HTMLFormElement>): void => {
    if (!state.formationFormData.businessNameConfirmation) {
      event.preventDefault();
      return;
    }

    searchBusinessName(event).catch(() => {});
    setFieldsInteracted([FIELD_NAME]);
  };

  const hasError = doesFieldHaveError(FIELD_NAME);

  return (
    <form onSubmit={doSearch} className="usa-prose margin-top-1 grid-container padding-0">
      <WithErrorBar hasError={hasError} type="DESKTOP-ONLY">
        <div className={isTabletAndUp ? "grid-row grid-gap-2" : "display-flex flex-column"}>
          <div className={isTabletAndUp ? "grid-col-8" : ""}>
            <WithErrorBar hasError={hasError} type="MOBILE-ONLY">
              <div className="text-bold">{Config.formation.fields.businessName.label}</div>
              <TextField
                autoComplete="no"
                id={`question-${FIELD_NAME}`}
                value={currentName}
                onChange={(event): void => {
                  onChangeNameField(event.target.value);
                  setFormationFormData({
                    ...state.formationFormData,
                    businessName: event.target.value,
                    businessNameConfirmation: false,
                  });
                  setConfirmationValue("");
                }}
                variant="outlined"
                inputProps={{
                  "aria-label": "Search business name",
                }}
                error={hasError}
                onBlur={(event: FocusEvent<HTMLInputElement>): void => {
                  setFieldsInteracted([FIELD_NAME]);
                  onBlurNameField(event.target.value);
                }}
              />
              <div className="text-bold margin-top-1">
                {Config.formation.fields.businessName.confirmBusinessNameLabel}
              </div>
              <TextField
                autoComplete="no"
                value={
                  state.formationFormData.businessNameConfirmation
                    ? state.formationFormData.businessName
                    : confirmationValue
                }
                onChange={(event): void => {
                  resetNameAvailability();
                  setConfirmationValue(event.target.value);
                  setFormationFormData({
                    ...state.formationFormData,
                    businessNameConfirmation:
                      state.formationFormData.businessName === event.target.value,
                  });
                }}
                variant="outlined"
                inputProps={{
                  "aria-label": "Confirm business name",
                }}
                error={hasError}
                helperText={
                  hasError
                    ? getErrorStateForFormationField({
                        field: "businessName",
                        formationFormData: state.formationFormData,
                        businessNameAvailability: state.businessNameAvailability,
                      }).label
                    : undefined
                }
                onBlur={(): void => {
                  resetNameAvailability();
                  setFieldsInteracted([FIELD_NAME]);
                }}
              />
              {state.businessNameAvailability?.status === "UNAVAILABLE" && (
                <div
                  className="text-error-dark text-bold margin-y-2"
                  data-testid="unavailable-text"
                >
                  <p>
                    {templateEval(Config.formation.fields.businessName.alertUnavailable, {
                      name: state.formationFormData.businessName,
                    })}
                  </p>
                  {state.businessNameAvailability.similarNames.length > 0 && (
                    <>
                      <p className="margin-bottom-1">
                        {Config.searchBusinessNameTask.similarUnavailableNamesText}
                      </p>
                      <ul className="usa-list">
                        {state.businessNameAvailability.similarNames.map((otherName) => {
                          return (
                            <li className="text-uppercase text-bold margin-y-0" key={otherName}>
                              {otherName}
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </WithErrorBar>
          </div>
          <div
            style={{
              marginTop: isTabletAndUp ? "123px" : "8px",
            }}
          >
            <SecondaryButton
              isColor="primary"
              onClick={(): void => {}}
              isLoading={isLoading}
              isSubmitButton={true}
              isRightMarginRemoved={true}
              dataTestId="business-name-search-submit"
              isNotFullWidthOnMobile={true}
            >
              {Config.searchBusinessNameTask.searchButtonText}
            </SecondaryButton>
          </div>
        </div>
      </WithErrorBar>
      {error && (
        <Alert variant="error" dataTestid={`error-alert-${error}`}>
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      {state.businessNameAvailability?.status === "DESIGNATOR_ERROR" && (
        <Alert variant="error" dataTestid="designator-error-text">
          <p className="font-sans-xs">{Config.formation.fields.businessName.alertDesignator}</p>
        </Alert>
      )}
      {state.businessNameAvailability?.status === "SPECIAL_CHARACTER_ERROR" && (
        <Alert variant="error" dataTestid="special-character-error-text">
          <Content className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertSpecialCharacters, {
              name: state.formationFormData.businessName,
            })}
          </Content>
        </Alert>
      )}
      {state.businessNameAvailability?.status === "RESTRICTED_ERROR" && (
        <Alert variant="error" dataTestid="restricted-word-error-text">
          <Content className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertRestrictedWord, {
              name: state.formationFormData.businessName,
              word: state.businessNameAvailability.invalidWord ?? "*unknown*",
            })}
          </Content>
        </Alert>
      )}
      {state.businessNameAvailability?.status === "AVAILABLE" && (
        <Alert variant="success" dataTestid="available-text">
          <span className="font-sans-xs">
            {templateEval(Config.formation.fields.businessName.alertAvailable, {
              name: state.formationFormData.businessName,
            })}
          </span>
        </Alert>
      )}
    </form>
  );
};
