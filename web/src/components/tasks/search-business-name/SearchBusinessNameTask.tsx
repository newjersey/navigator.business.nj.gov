import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { TaskHeader } from "@/components/TaskHeader";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useBusinessNameSearch } from "@/lib/data-hooks/useBusinessNameSearch";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";
import { createEmptyFormationFormData, NameAvailability } from "@businessnjgovnavigator/shared";
import { createEmptyDbaDisplayContent, Task } from "@businessnjgovnavigator/shared/types";
import { TextField } from "@mui/material";
import { FormEvent, ReactElement, SetStateAction, useState } from "react";

type Props = { task: Task };

const SearchBusinessNameFormBody = ({
  nameAvailability,
  onAvailableNameFound,
}: {
  nameAvailability: NameAvailability | undefined;
  onAvailableNameFound: (name: string) => void;
}): ReactElement => {
  const { Config } = useConfig();
  const [confirmationValue, setConfirmationValue] = useState("");
  const { currentName, isLoading, error, onChangeNameField, searchBusinessName } =
    useBusinessNameSearch({ isBusinessFormation: false, isDba: false });

  const SearchBusinessNameErrorLookup: Record<string, string> = {
    BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
    SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
  };

  const namesMatch = currentName.length > 0 && currentName === confirmationValue;

  const doSearch = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!namesMatch) return;
    searchBusinessName(event)
      .then(({ nameAvailability: result, submittedName }) => {
        if (result.status === "AVAILABLE") {
          onAvailableNameFound(submittedName);
        } else {
          onAvailableNameFound("");
        }
      })
      .catch(() => {
        onAvailableNameFound("");
      });
  };

  return (
    <>
      {error === "SEARCH_FAILED" && (
        <Alert dataTestid={`error-alert-${error}`} variant="error">
          {SearchBusinessNameErrorLookup[error]}
        </Alert>
      )}
      <WithErrorBar hasError={error === "BAD_INPUT"} type="ALWAYS">
        <form onSubmit={doSearch} className="usa-prose grid-container padding-0 margin-top-1">
          We’ll check to see if your desired business name is available. Once you find an available
          name, you can use it to form your business in the next step. What do you want to name your
          business?
          <div className="grid-row grid-gap-2">
            <div className="grid-col-8">
              <div className="text-bold">{Config.formation.fields.businessName.label}</div>
              <TextField
                id="name-input"
                margin="dense"
                value={currentName}
                onChange={(event): void => {
                  onChangeNameField(event.target.value);
                  setConfirmationValue("");
                  onAvailableNameFound("");
                }}
                required
                variant="outlined"
                inputProps={{ "aria-label": "Search business name" }}
              />
              <div className="text-bold margin-top-1">
                {Config.formation.fields.businessName.confirmBusinessNameLabel}
              </div>
              <TextField
                id="confirm-name-input"
                margin="dense"
                value={confirmationValue}
                onChange={(event): void => {
                  setConfirmationValue(event.target.value);
                  onAvailableNameFound("");
                }}
                required
                variant="outlined"
                inputProps={{ "aria-label": "Confirm business name" }}
              />
            </div>
            <div className="grid-col-4" style={{ marginTop: "123px" }}>
              <SecondaryButton
                isColor="primary"
                onClick={(): void => {}}
                isLoading={isLoading}
                isSubmitButton={true}
                dataTestId="search-business-name-availability"
                isRightMarginRemoved={true}
              >
                {Config.searchBusinessNameTask.searchButtonText}
              </SecondaryButton>
            </div>
          </div>
        </form>
        {error === "BAD_INPUT" && (
          <div data-testid={`error-alert-${error}`} className="text-error-dark">
            {SearchBusinessNameErrorLookup[error]}
          </div>
        )}
      </WithErrorBar>
      <div className="margin-top-2">
        {nameAvailability?.status === "AVAILABLE" && (
          <div data-testid="available-text">
            <Alert variant="success">
              <span className="font-sans-xs">
                {templateEval(Config.searchBusinessNameTask.availableText, {
                  name: currentName,
                })}
              </span>
            </Alert>
          </div>
        )}
        {nameAvailability?.status === "UNAVAILABLE" && (
          <div data-testid="unavailable-text">
            <Alert variant="error">
              <Content className="font-sans-xs">
                {templateEval(Config.searchBusinessNameTask.unavailableText, {
                  name: currentName,
                })}
              </Content>
              {nameAvailability.similarNames.length > 0 && (
                <ul className="font-body-2xs">
                  {nameAvailability.similarNames.map((name) => (
                    <li className="text-uppercase text-bold margin-top-0" key={name}>
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          </div>
        )}
        {nameAvailability?.status === "DESIGNATOR_ERROR" && (
          <Alert variant="error" dataTestid="designator-error-text">
            <p className="font-sans-xs">{Config.searchBusinessNameTask.designatorText}</p>
          </Alert>
        )}
        {nameAvailability?.status === "SPECIAL_CHARACTER_ERROR" && (
          <Alert variant="error" dataTestid="special-character-error-text">
            <Content className="font-sans-xs">
              {templateEval(Config.formation.fields.businessName.alertSpecialCharacters, {
                name: currentName,
              })}
            </Content>
          </Alert>
        )}
        {nameAvailability?.status === "RESTRICTED_ERROR" && (
          <Alert variant="error" dataTestid="restricted-word-error-text">
            <Content className="font-sans-xs">
              {templateEval(Config.formation.fields.businessName.alertRestrictedWord, {
                name: currentName,
                word: nameAvailability.invalidWord ?? "*unknown*",
              })}
            </Content>
          </Alert>
        )}
      </div>
    </>
  );
};

export const SearchBusinessNameTask = ({ task }: Props): ReactElement => {
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>();
  const [availableName, setAvailableName] = useState<string>("");
  const { updateQueue } = useUserData();
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();

  const handleSetBusinessNameAvailability = (
    availability: SetStateAction<NameAvailability | undefined>,
  ): void => {
    const resolved = availability as NameAvailability | undefined;
    setNameAvailability(resolved);
    if (resolved?.status !== "AVAILABLE") {
      setAvailableName("");
    }
  };

  const handleSave = (): void => {
    if (!availableName || !updateQueue) return;
    updateQueue.queueProfileData({ businessName: availableName });
    queueUpdateTaskProgress(task.id, "COMPLETED");
    updateQueue.update();
  };

  return (
    <BusinessFormationContext.Provider
      value={{
        state: {
          stepIndex: 0,
          formationFormData: {
            ...createEmptyFormationFormData(),
            legalType: "limited-liability-company",
          },
          businessNameAvailability: nameAvailability,
          dbaBusinessNameAvailability: undefined,
          showResponseAlert: false,
          hasBeenSubmitted: false,
          dbaContent: createEmptyDbaDisplayContent(),
          interactedFields: [],
          hasSetStateFirstTime: true,
          foreignGoodStandingFile: undefined,
          reviewCheckboxes: {
            namesAddressesDatesChecked: false,
            permanentRecordChecked: false,
            correctionFeesChecked: false,
          },
        },
        setFormationFormData: () => {},
        setStepIndex: () => {},
        setShowResponseAlert: () => {},
        setFieldsInteracted: () => {},
        setHasBeenSubmitted: () => {},
        setBusinessNameAvailability: handleSetBusinessNameAvailability,
        setDbaBusinessNameAvailability: () => {},
        setForeignGoodStandingFile: () => {},
        setReviewCheckboxes: () => {},
        allConfirmationsChecked: () => false,
      }}
    >
      <div>
        <TaskHeader task={task} />
        <SearchBusinessNameFormBody
          nameAvailability={nameAvailability}
          onAvailableNameFound={setAvailableName}
        />
        <div className="margin-top-2">
          <button
            type="button"
            className={`usa-button usa-button--outline margin-right-0${availableName ? "" : " usa-button--disabled"}`}
            disabled={!availableName}
            onClick={handleSave}
            data-testid="save-business-name"
          >
            Save
          </button>
        </div>
        {congratulatoryModal}
      </div>
    </BusinessFormationContext.Provider>
  );
};
