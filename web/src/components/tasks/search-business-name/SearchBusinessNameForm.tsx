import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { WithErrorBar } from "@/components/WithErrorBar";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/index";
import { FormControl, TextField } from "@mui/material";
import { FormEvent, ReactElement, useCallback, useEffect, useRef } from "react";

type SearchBusinessNameFormConfig = {
  searchButtonText: string;
  searchButtonTestId: string;
  inputPlaceholderText: string;
  inputLabel?: string;
};

interface Props {
  unavailable: (props: UnavailableProps) => ReactElement;
  available: (props: AvailableProps) => ReactElement;
  config: SearchBusinessNameFormConfig;
  className?: string;
  isBusinessFormation?: boolean;
  hideTextFieldWhenUnavailable?: boolean;
  onChange?: (nameAvailability: NameAvailability | undefined) => void;
  onSubmit?: (
    submittedName: string,
    nameAvailability: NameAvailability,
    isInitialSubmit: boolean
  ) => Promise<void>;
  isDba?: boolean;
}

export const SearchBusinessNameForm = (props: Props): ReactElement => {
  const {
    currentName,
    submittedName,
    isLoading,
    error,
    nameAvailability,
    updateButtonClicked,
    updateCurrentName,
    searchBusinessName,
    updateNameOnProfile,
    resetSearch,
  } = useBusinessNameSearch({
    isBusinessFormation: !!props.isBusinessFormation,
    isDba: props.isDba || false,
  });

  const { Config } = useConfig();
  const didInitialSearch = useRef<boolean>(false);
  const { userData } = useUserData();

  const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  useEffect(() => {
    props.onChange && props.onChange(nameAvailability);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameAvailability]);

  const Unavailable = props.unavailable;
  const Available = props.available;
  const onSubmit = props.onSubmit;

  const doSearch = useCallback(
    async (
      event: FormEvent<HTMLFormElement> | undefined,
      { isInitialSubmit }: { isInitialSubmit: boolean }
    ): Promise<void> => {
      searchBusinessName(event)
        .then(({ nameAvailability, submittedName }) => {
          if (onSubmit) {
            onSubmit(submittedName, nameAvailability, isInitialSubmit);
          }
        })
        .catch(() => {});
    },
    [onSubmit, searchBusinessName]
  );

  useEffect(() => {
    (function showBusinessNameSearchResultsIfDBANameExists() {
      if (!userData) {
        return;
      }
      if (props.isDba) {
        return;
      }
      const shouldDoInitialSearch = currentName.length > 0 && userData.profileData.nexusDbaName !== undefined;
      if (shouldDoInitialSearch && !didInitialSearch.current) {
        didInitialSearch.current = true;
        doSearch(undefined, { isInitialSubmit: true });
      }
    })();
  }, [currentName, userData, props.isDba, doSearch]);

  const shouldShowTextField = (): boolean => {
    if (props.hideTextFieldWhenUnavailable) {
      return nameAvailability?.status !== "UNAVAILABLE";
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
            onSubmit={(event) => {
              return doSearch(event, { isInitialSubmit: false });
            }}
            className={`usa-prose grid-container padding-0 ${props.className}`}
          >
            <div className="grid-row grid-gap-1">
              <div className="tablet:grid-col-8">
                <TextField
                  id="name-input"
                  className="fg1 width-100"
                  margin="dense"
                  value={currentName}
                  onChange={(event) => {
                    return updateCurrentName(event.target.value);
                  }}
                  variant="outlined"
                  placeholder={props.config.inputPlaceholderText}
                  inputProps={{
                    "aria-label": props.config.inputLabel ?? "Search business name",
                  }}
                />
              </div>
              <div className="tablet:grid-col-4">
                <FormControl margin="dense" className="">
                  <SecondaryButton
                    isColor="primary"
                    onClick={() => {}}
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
          {error === "BAD_INPUT" && (
            <div data-testid={`error-alert-${error}`} className="text-error-dark">
              {SearchBusinessNameErrorLookup[error]}
            </div>
          )}
        </WithErrorBar>
      )}
      <div className="margin-top-2">
        {nameAvailability?.status === "AVAILABLE" && (
          <Available
            submittedName={submittedName}
            updateButtonClicked={updateButtonClicked}
            updateNameOnProfile={updateNameOnProfile}
          />
        )}
        {nameAvailability?.status === "DESIGNATOR" && (
          <Alert variant="error" dataTestid="designator-text">
            <p className="font-sans-xs">{Config.searchBusinessNameTask.designatorText}</p>
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
          <Unavailable
            resetSearch={resetSearch}
            submittedName={submittedName}
            nameAvailability={nameAvailability}
          />
        )}
      </div>
    </>
  );
};
