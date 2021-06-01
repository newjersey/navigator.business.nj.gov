import React, { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { FormControl, TextField } from "@material-ui/core";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNamesDefaults } from "@/display-content/tasks/search-business-names/SearchBusinessNamesDefaults";
import * as api from "@/lib/api-client/apiClient";
import { NameAvailability, Task } from "@/lib/types/types";
import { Alert } from "@/components/njwds/Alert";
import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { getModifiedTaskContent, templateEval, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { LoadingButton } from "@/components/njwds-extended/LoadingButton";
import { TaskHeader } from "@/components/TaskHeader";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";

interface Props {
  task: Task;
}

export const SearchBusinessName = (props: Props): ReactElement => {
  const [name, setName] = useState<string>("");
  const [nameDisplayedInResults, setNameDisplayedInResults] = useState<string>("");
  const [updateButtonClicked, setUpdateButtonClicked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showBadInputAlert, setShowBadInputAlert] = useState<boolean>(false);
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>(undefined);
  const { userData, update } = useUserData();
  const { roadmap } = useRoadmap();

  const handleName = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const searchBusinessName = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setNameAvailability(undefined);
    setUpdateButtonClicked(false);

    if (!name) {
      setShowBadInputAlert(true);
      return;
    }

    setShowBadInputAlert(false);
    setIsLoading(true);

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
          setShowBadInputAlert(true);
        }
      });
  };

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    setName(userData.onboardingData.businessName);
  }, userData);

  const updateBusinessName = (): void => {
    if (!userData) return;
    setUpdateButtonClicked(true);
    const newUserData = {
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        businessName: name,
      },
    };
    update(newUserData);
  };

  const badInputAlert = (): ReactElement => (
    <div data-testid="bad-input-alert" className="text-orange">
      {SearchBusinessNamesDefaults.badInputAlertText}
    </div>
  );

  const showAvailable = (): ReactElement => {
    return (
      <div data-testid="available-text">
        <p className="font-body-2xs text-primary">
          {templateEval(SearchBusinessNamesDefaults.availableText, { name: nameDisplayedInResults })}
        </p>
        {updateButtonClicked ? (
          <div className="font-body-2xs text-primary margin-top-05" data-testid="name-has-been-updated">
            <span className="padding-right-05">
              <Icon>check</Icon>
            </span>
            <span>{SearchBusinessNamesDefaults.nameHasBeenUpdatedText}</span>
          </div>
        ) : (
          <button
            onClick={updateBusinessName}
            data-testid="update-name"
            className="usa-button usa-button--unstyled font-body-2xs"
          >
            <span className="text-underline">{SearchBusinessNamesDefaults.updateButtonText}</span>
          </button>
        )}
        <Alert variant="info" slim className="margin-bottom-4">
          <Content>{SearchBusinessNamesDefaults.officialCheckText}</Content>
          <a
            href={SearchBusinessNamesDefaults.officialCheckButtonLink}
            target="_blank"
            rel="noreferrer noopener"
          >
            <button data-testid="official-check" className="usa-button usa-button--secondary margin-top-2">
              {SearchBusinessNamesDefaults.officialCheckButtonText}
            </button>
          </a>
        </Alert>
      </div>
    );
  };

  const showUnavailable = (): ReactElement => {
    return (
      <div data-testid="unavailable-text">
        <p className="font-body-2xs text-red">
          {templateEval(SearchBusinessNamesDefaults.unavailableText, { name: nameDisplayedInResults })}
        </p>
        <p className="font-body-2xs text-red margin-bottom-1">
          {SearchBusinessNamesDefaults.similarUnavailableNamesText}
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
              placeholder={SearchBusinessNamesDefaults.placeholderText}
              inputProps={{
                "aria-label": "Search business name",
              }}
            />
          </div>
          <div className="tablet:grid-col-4">
            <FormControl margin="dense" className="">
              <LoadingButton
                onClick={() => {}}
                loading={isLoading}
                outline={true}
                className="text-no-wrap"
                type="submit"
                data-testid="search-availability"
              >
                {SearchBusinessNamesDefaults.searchButtonText}
              </LoadingButton>
            </FormControl>
          </div>
        </div>
      </form>
      <div className="margin-top-2">
        {showBadInputAlert && badInputAlert()}
        {nameAvailability?.status === "AVAILABLE" && showAvailable()}
        {nameAvailability?.status === "UNAVAILABLE" && showUnavailable()}
      </div>
    </>
  );
};
