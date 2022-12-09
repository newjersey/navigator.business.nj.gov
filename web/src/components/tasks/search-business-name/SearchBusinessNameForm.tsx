import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, TextField } from "@mui/material";
import { FormEvent, ReactElement, useCallback, useEffect, useRef } from "react";

type SearchBusinessNameError = "BAD_INPUT" | "SEARCH_FAILED";
const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
  BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
  SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
};

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
  hideTextFieldWhenUnavailable?: boolean;
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
  } = useBusinessNameSearch({ isBusinessFormation: false, isDba: props.isDba || false });

  const didInitialSearch = useRef<boolean>(false);
  const { userData } = useUserData();

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

  const showBadInputError = (): ReactElement => {
    if (error !== "BAD_INPUT") {
      return <></>;
    }
    return (
      <div data-testid={`error-alert-${error}`} className="text-error-dark">
        {SearchBusinessNameErrorLookup[error]}
      </div>
    );
  };

  const showErrorAlert = (): ReactElement => {
    if (!error || error === "BAD_INPUT") {
      return <></>;
    }
    return (
      <Alert dataTestid={`error-alert-${error}`} variant="error">
        {SearchBusinessNameErrorLookup[error]}
      </Alert>
    );
  };

  const showDesignator = (): ReactElement => {
    return (
      <div data-testid="designator-text">
        <p className="font-body-2xs text-red">{Config.searchBusinessNameTask.designatorText}</p>
      </div>
    );
  };

  const shouldShowTextField = (): boolean => {
    if (props.hideTextFieldWhenUnavailable) {
      return nameAvailability?.status !== "UNAVAILABLE";
    }

    return true;
  };

  return (
    <>
      {showErrorAlert()}
      {shouldShowTextField() && (
        <>
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
            className={`usa-prose grid-container padding-0`}
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
                  <Button
                    style="secondary"
                    onClick={() => {}}
                    loading={isLoading}
                    typeSubmit
                    dataTestid={props.config.searchButtonTestId}
                    noRightMargin
                  >
                    {props.config.searchButtonText}
                  </Button>
                </FormControl>
              </div>
            </div>
          </form>
        </>
      )}
      <div className="margin-top-2">
        {showBadInputError()}
        {nameAvailability?.status === "AVAILABLE" && (
          <Available
            submittedName={submittedName}
            updateButtonClicked={updateButtonClicked}
            updateNameOnProfile={updateNameOnProfile}
          />
        )}
        {nameAvailability?.status === "DESIGNATOR" && showDesignator()}
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
