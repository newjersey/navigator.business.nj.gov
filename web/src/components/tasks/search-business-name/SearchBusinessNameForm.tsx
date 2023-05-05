import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/";
import { FormControl, TextField } from "@mui/material";
import { FormEvent, ReactElement, useCallback, useEffect, useRef } from "react";

type SearchBusinessNameFormConfig = {
  availableAlertText: string;
  helperText?: string;
  inputLabel?: string;
  searchButtonTestId: string;
  searchButtonText: string;
};

interface Props {
  unavailable: (props: UnavailableProps) => ReactElement;
  businessName: string;
  config: SearchBusinessNameFormConfig;
  className?: string;
  hasError?: boolean;
  hideTextFieldWhenUnavailable?: boolean;
  isBusinessFormation?: boolean;
  nameAvailability?: NameAvailability;
  setNameAvailability: (nameAvailability: NameAvailability | undefined) => void;
  isDba?: boolean;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onChange?: (nameAvailability: NameAvailability | undefined) => void;
  onSubmit:
    | ((submittedName: string, nameAvailability: NameAvailability, isInitialSubmit: boolean) => Promise<void>)
    | (() => void);
}

export const SearchBusinessNameForm = (props: Props): ReactElement => {
  const { currentName, isLoading, error, updateCurrentName, searchBusinessName, resetSearch } =
    useBusinessNameSearch({
      isBusinessFormation: !!props.isBusinessFormation,
      isDba: props.isDba || false,
    });

  const { Config } = useConfig();
  const didInitialSearch = useRef<boolean>(false);
  const { userData } = useUserData();

  // TODO: Use business formation context over local state variable
  // Once in biz context, add auto-save
  const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  const Unavailable = props.unavailable;
  const onSubmit = props.onSubmit;

  const doSearch = useCallback(
    async (
      event: FormEvent<HTMLFormElement> | undefined,
      { isInitialSubmit }: { isInitialSubmit: boolean }
    ): Promise<void> => {
      searchBusinessName(event)
        .then(({ nameAvailability, submittedName }) => {
          props.setNameAvailability(nameAvailability);
          if (onSubmit) {
            onSubmit(submittedName, nameAvailability, isInitialSubmit);
          }
        })
        .catch(() => {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, searchBusinessName]
  );

  useEffect(() => {
    (function showBusinessNameSearchResultsIfDBANameExists(): void {
      if (!userData) {
        return;
      }
      if (props.isDba) {
        return;
      }
      const shouldDoInitialSearch = currentName.length > 0 && userData.profileData.needsNexusDbaName;
      if (shouldDoInitialSearch && !didInitialSearch.current) {
        didInitialSearch.current = true;
        doSearch(undefined, { isInitialSubmit: true });
      }
    })();
  }, [currentName, userData, props.isDba, doSearch]);

  const shouldShowTextField = (): boolean => {
    if (props.hideTextFieldWhenUnavailable) {
      return props.nameAvailability?.status !== "UNAVAILABLE";
    }

    return true;
  };

  return (
    <>
      {error === "SEARCH_FAILED" && (
        <Alert dataTestid={`error-alert-${error}`} variant="error">
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      {`shouldShowTextField: ${shouldShowTextField()}`}
      {shouldShowTextField() && (
        <WithErrorBar hasError={error === "BAD_INPUT"} type="ALWAYS">
          {props.config.inputLabel && (
            <div className="margin-top-2">
              <label className="text-bold" htmlFor="name-input">
                {props.config.inputLabel}
              </label>
            </div>
          )}
          <form
            onSubmit={(event): void => {
              doSearch(event, { isInitialSubmit: false });
            }}
            className={`usa-prose grid-container padding-0 ${props.className}`}
          >
            <div className="grid-row grid-gap-1">
              <div className="tablet:grid-col-8">
                <TextField
                  autoComplete="no"
                  className="fg1 width-100"
                  error={props.hasError}
                  helperText={props.config.helperText}
                  id="name-input"
                  inputProps={{
                    "aria-label": props.config.inputLabel ?? "Search business name",
                  }}
                  margin="dense"
                  onBlur={props.onBlur}
                  onChange={(event): void => {
                    updateCurrentName(event.target.value);
                  }}
                  value={currentName}
                  variant="outlined"
                />
              </div>
              <div className="tablet:grid-col-4">
                <FormControl margin="dense">
                  <SecondaryButton
                    isColor="primary"
                    onClick={(): void => {}}
                    isLoading={isLoading}
                    isSubmitButton={true}
                    dataTestId={props.config.searchButtonTestId}
                    isRightMarginRemoved={true}
                  >
                    {props.config.searchButtonText}
                  </SecondaryButton>
                </FormControl>
              </div>
            </div>
          </form>
          {error && (
            <Alert variant="error" dataTestid={`error-alert-${error}`} className="text-error-dark">
              {SearchBusinessNameErrorLookup[error]}
            </Alert>
          )}
        </WithErrorBar>
      )}
      <div className="margin-top-2">
        {props.nameAvailability?.status === "AVAILABLE" && (
          <Alert variant="success" dataTestid="available-text">
            <span className="font-sans-xs">
              {templateEval(props.config.availableAlertText, {
                name: props.businessName,
              })}
            </span>
          </Alert>
        )}
        <>{(props.isDba ? "DBA" : "Nexus")} {(props.nameAvailability?.status ?? "")}</>
        {props.nameAvailability?.status === "UNAVAILABLE" && (
          <Unavailable
            resetSearch={(): void => {
              // resetSearch()
              // props.setNameAvailability(undefined);
            }}
            submittedName={props.businessName}
            nameAvailability={props.nameAvailability}
          />
        )}
        {props.nameAvailability?.status === "DESIGNATOR_ERROR" && (
          <Alert variant="error" dataTestid="designator-error-text">
            <p className="font-sans-xs">{Config.searchBusinessNameTask.designatorText}</p>
          </Alert>
        )}
        {props.nameAvailability?.status === "SPECIAL_CHARACTER_ERROR" && (
          <Alert variant="error" dataTestid="special-character-error-text">
            <Content className="font-sans-xs">
              {templateEval(Config.formation.fields.businessName.alertSpecialCharacters, {
                name: props.businessName,
              })}
            </Content>
          </Alert>
        )}
        {props.nameAvailability?.status === "RESTRICTED_ERROR" && (
          <Alert variant="error" dataTestid="restricted-word-error-text">
            <Content className="font-sans-xs">
              {templateEval(Config.formation.fields.businessName.alertRestrictedWord, {
                name: props.businessName,
                word: props.nameAvailability.invalidWord ?? "*unknown*",
              })}
            </Content>
          </Alert>
        )}
      </div>
    </>
  );
};
