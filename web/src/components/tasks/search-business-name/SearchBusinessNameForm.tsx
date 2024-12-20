import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNameError } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import {
  determineIfNexusDbaNameNeeded,
  emptyProfileData,
  NameAvailability,
} from "@businessnjgovnavigator/shared/";
import { TextField } from "@mui/material";
import { FormEvent, ReactElement, useCallback, useContext, useEffect, useRef } from "react";

type SearchBusinessNameFormConfig = {
  searchButtonText: string;
  searchButtonTestId: string;
  inputLabel?: string;
};

interface Props {
  unavailable: (props: UnavailableProps) => ReactElement<any>;
  available: (props: AvailableProps) => ReactElement<any>;
  businessName: string;
  config: SearchBusinessNameFormConfig;
  className?: string;
  isBusinessFormation?: boolean;
  hideTextFieldWhenUnavailable?: boolean;
  isDba?: boolean;
  nameAvailability: NameAvailability | undefined;
}

export const SearchBusinessNameForm = (props: Props): ReactElement<any> => {
  const {
    currentName,
    isLoading,
    error,
    updateButtonClicked,
    onChangeNameField,
    searchBusinessName,
    resetSearch,
  } = useBusinessNameSearch({
    isBusinessFormation: !!props.isBusinessFormation,
    isDba: props.isDba || false,
  });

  const { Config } = useConfig();
  const didInitialSearch = useRef<boolean>(false);
  const { business, updateQueue } = useUserData();
  const {
    setFormationFormData,
    setBusinessNameAvailability,
    setDbaBusinessNameAvailability,
    setFieldsInteracted,
  } = useContext(BusinessFormationContext);

  const setNameAvailability = props.isDba ? setDbaBusinessNameAvailability : setBusinessNameAvailability;

  const FIELD_NAME = "businessName";
  const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  const emptyNameAvailability: NameAvailability = {
    similarNames: [],
    status: undefined,
    lastUpdatedTimeStamp: "",
  };

  const Unavailable = props.unavailable;
  const Available = props.available;

  const handleBusinessNameAvailability = (
    nameAvailability: NameAvailability,
    submittedName: string
  ): void => {
    const validName = ["AVAILABLE", "UNAVAILABLE"].includes(nameAvailability.status ?? "");
    if (!updateQueue || !validName) return;

    setFieldsInteracted([FIELD_NAME]);
    updateQueue
      .queueFormationData({
        businessNameAvailability: nameAvailability,
      })
      .queueFormationFormData({ businessName: submittedName })
      .queueProfileData({
        businessName: submittedName,
        nexusDbaName: emptyProfileData.nexusDbaName,
      })
      .update();

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessName: submittedName,
      };
    });
  };

  const handleDbaBusinessNameAvailability = (
    nameAvailability: NameAvailability,
    submittedName: string
  ): void => {
    if (!updateQueue || nameAvailability.status !== "AVAILABLE") return;
    updateQueue
      .queueFormationData({
        dbaBusinessNameAvailability: nameAvailability,
      })
      .queueProfileData({
        nexusDbaName: submittedName,
      })
      .update();
  };

  const doSearch = useCallback(
    async (
      event: FormEvent<HTMLFormElement> | undefined,
      { isInitialSubmit }: { isInitialSubmit: boolean }
    ): Promise<void> => {
      searchBusinessName(event)
        .then(async ({ nameAvailability, submittedName }) => {
          if (!nameAvailability || isInitialSubmit) return;
          if (props.isDba) {
            handleDbaBusinessNameAvailability(nameAvailability, submittedName);
          } else {
            handleBusinessNameAvailability(nameAvailability, submittedName);
          }
          setNameAvailability(nameAvailability);
        })
        .catch(() => {});
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchBusinessName]
  );

  const resetNameAvailability = (): void => {
    resetSearch();
    if (updateQueue) {
      updateQueue
        .queueFormationData({
          businessNameAvailability: emptyNameAvailability,
          dbaBusinessNameAvailability: emptyNameAvailability,
        })
        .queueProfileData({
          nexusDbaName: "",
        })
        .update();
    }
  };

  const shouldShowTextField = (): boolean => {
    if (props.hideTextFieldWhenUnavailable) {
      return props.nameAvailability?.status !== "UNAVAILABLE";
    }

    return true;
  };

  useEffect(() => {
    (function showBusinessNameSearchResultsIfDBANameExists(): void {
      if (!business) return;
      if (props.isDba) return;
      const shouldDoInitialSearch = currentName.length > 0 && determineIfNexusDbaNameNeeded(business);
      if (shouldDoInitialSearch && !didInitialSearch.current) {
        didInitialSearch.current = true;
        doSearch(undefined, { isInitialSubmit: true });
      }
    })();
  }, [currentName, business, props.isDba, doSearch]);

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
            onSubmit={(event): void => {
              doSearch(event, { isInitialSubmit: false });
            }}
            className={`usa-prose grid-container padding-0 ${props.className}`}
          >
            <div className="grid-row grid-gap-1">
              <div className="tablet:grid-col-8">
                <div className="width-100">
                  <TextField
                    id="name-input"
                    margin="dense"
                    value={currentName}
                    onChange={(event): void => {
                      onChangeNameField(event.target.value);
                    }}
                    variant="outlined"
                    inputProps={{
                      "aria-label": props.config.inputLabel ?? "Search business name",
                    }}
                  />
                </div>
              </div>
              <div className="tablet:grid-col-4">
                <div className="margin-top-105">
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
                </div>
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
        {props.nameAvailability?.status === "AVAILABLE" && (
          <Available submittedName={props.businessName} updateButtonClicked={updateButtonClicked} />
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
                name: currentName,
                word: props.nameAvailability.invalidWord ?? "*unknown*",
              })}
            </Content>
          </Alert>
        )}

        {props.nameAvailability?.status === "UNAVAILABLE" && (
          <Unavailable
            resetSearch={(): void => resetNameAvailability()}
            submittedName={currentName}
            nameAvailability={props.nameAvailability}
          />
        )}
      </div>
    </>
  );
};
