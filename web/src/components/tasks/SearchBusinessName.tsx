import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getModifiedTaskContent, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, TextField } from "@mui/material";
import React, { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { Button } from "../njwds-extended/Button";
interface Props {
  task: Task;
}

type SearchBusinessNameError = "BAD_INPUT" | "SEARCH_FAILED";
const SearchBusinessNameErrorLookup: Record<SearchBusinessNameError, string> = {
  BAD_INPUT: Config.searchBusinessNameTask.errorTextBadInput,
  SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
};

export const SearchBusinessName = (props: Props): ReactElement => {
  const [name, setName] = useState<string>("");
  const [nameDisplayedInResults, setNameDisplayedInResults] = useState<string>("");
  const [updateButtonClicked, setUpdateButtonClicked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<SearchBusinessNameError | undefined>(undefined);
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>(undefined);
  const { userData, update } = useUserData();
  const { roadmap } = useRoadmap();
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);

  const handleName = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const searchBusinessName = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setNameAvailability(undefined);
    setUpdateButtonClicked(false);

    if (!name) {
      setError("BAD_INPUT");
      return;
    }

    setError(undefined);
    setIsLoading(true);
    analytics.event.task_business_name_check_availability.submit.view_business_name_availability();

    api
      .searchBusinessName(name)
      .then((result: NameAvailability) => {
        setNameDisplayedInResults(name);
        setIsLoading(false);
        setNameAvailability(result);
      })
      .catch((error) => {
        setIsLoading(false);
        if (error === 400) {
          setError("BAD_INPUT");
        } else {
          setError("SEARCH_FAILED");
        }
      });
  };

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setName(userData.profileData.businessName);
  }, userData);

  const updateBusinessName = (): void => {
    if (!userData) return;
    setUpdateButtonClicked(true);
    const newUserData = {
      ...userData,
      profileData: {
        ...userData.profileData,
        businessName: name,
      },
    };
    update(newUserData);
  };

  const showBadInputError = (): ReactElement => {
    if (error !== "BAD_INPUT") return <></>;
    return (
      <div data-testid={`error-alert-${error}`} className="text-orange">
        {SearchBusinessNameErrorLookup[error]}
      </div>
    );
  };

  const showErrorAlert = (): ReactElement => {
    if (!error || error === "BAD_INPUT") return <></>;
    return (
      <Alert dataTestid={`error-alert-${error}`} variant="error">
        {SearchBusinessNameErrorLookup[error]}
      </Alert>
    );
  };

  const showAvailable = (): ReactElement => {
    return (
      <div data-testid="available-text">
        <p className="font-body-2xs text-primary">
          {templateEval(Config.searchBusinessNameTask.availableText, { name: nameDisplayedInResults })}
        </p>
        {updateButtonClicked ? (
          <div className="font-body-2xs text-primary margin-top-05" data-testid="name-has-been-updated">
            <span className="padding-right-05">
              <Icon>check</Icon>
            </span>
            <span>{Config.searchBusinessNameTask.nameHasBeenUpdatedText}</span>
          </div>
        ) : (
          <button
            onClick={updateBusinessName}
            data-testid="update-name"
            className="usa-button usa-button--unstyled font-body-2xs"
          >
            <span className="text-underline">{Config.searchBusinessNameTask.updateButtonText}</span>
          </button>
        )}
        <div className="margin-bottom-2">
          <Alert variant="info">
            <Content>{Config.searchBusinessNameTask.officialCheckText}</Content>
            <a
              href={Config.searchBusinessNameTask.officialCheckButtonLink}
              target="_blank"
              rel="noreferrer noopener"
            >
              <button data-testid="official-check" className="usa-button usa-button--secondary margin-top-2">
                {Config.searchBusinessNameTask.officialCheckButtonText}
              </button>
            </a>
          </Alert>
        </div>
      </div>
    );
  };

  const showUnavailable = (): ReactElement => {
    return (
      <div data-testid="unavailable-text">
        <p className="font-body-2xs text-red">
          {templateEval(Config.searchBusinessNameTask.unavailableText, { name: nameDisplayedInResults })}
        </p>
        <p className="font-body-2xs text-red margin-bottom-1">
          {Config.searchBusinessNameTask.similarUnavailableNamesText}
        </p>
        <ul className="usa-list--unstyled font-body-2xs text-red">
          {nameAvailability &&
            nameAvailability.similarNames.map((otherName) => (
              <li className="text-uppercase text-bold margin-top-0" key={otherName}>
                {otherName}
              </li>
            ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <TaskHeader task={props.task} />
      <UnlockedBy taskLinks={taskFromRoadmap?.unlockedBy || []} isLoading={!taskFromRoadmap} />
      {showErrorAlert()}
      <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>

      <form onSubmit={searchBusinessName} className={`usa-prose grid-container padding-0`}>
        <div className="grid-row grid-gap-1">
          <div className="tablet:grid-col-8">
            <TextField
              className="fg1 width-100"
              margin="dense"
              value={name}
              onChange={handleName}
              variant="outlined"
              placeholder={Config.searchBusinessNameTask.placeholderText}
              inputProps={{
                "aria-label": "Search business name",
              }}
            />
          </div>
          <div className="tablet:grid-col-4">
            <FormControl margin="dense" className="">
              <Button
                style="secondary-input-field-height"
                onClick={() => {}}
                loading={isLoading}
                typeSubmit
                dataTestid="search-availability"
                noRightMargin
              >
                {Config.searchBusinessNameTask.searchButtonText}
              </Button>
            </FormControl>
          </div>
        </div>
      </form>
      <div className="margin-top-2">
        {showBadInputError()}
        {nameAvailability?.status === "AVAILABLE" && showAvailable()}
        {nameAvailability?.status === "UNAVAILABLE" && showUnavailable()}
      </div>
    </>
  );
};
