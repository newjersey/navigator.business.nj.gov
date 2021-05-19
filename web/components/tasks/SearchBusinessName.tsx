import React, { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { FormControl, TextField } from "@material-ui/core";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SearchBusinessNamesDefaults } from "@/display-content/tasks/search-business-names/SearchBusinessNamesDefaults";
import * as api from "@/lib/api-client/apiClient";
import { NameAvailability } from "@/lib/types/types";
import { Alert } from "@/components/njwds/Alert";
import { Content } from "@/components/Content";

export const SearchBusinessName = (): ReactElement => {
  const [name, setName] = useState<string>("");
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>(undefined);
  const { userData, update } = useUserData();

  const handleName = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value);
  };

  const searchBusinessName = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const result = await api.searchBusinessName(name);
    setNameAvailability(result);
  };

  useEffect(() => {
    if (userData) {
      setName(userData.onboardingData.businessName);
    }
  }, [userData]);

  const updateBusinessName = (): void => {
    if (!userData) return;
    const newUserData = {
      ...userData,
      onboardingData: {
        ...userData.onboardingData,
        businessName: name,
      },
    };
    update(newUserData);
  };

  const showAvailable = (): ReactElement => {
    return (
      <div data-testid="available-text" className="margin-top-2">
        <p className="font-body-2xs text-primary">{SearchBusinessNamesDefaults.availableText}</p>
        <button
          onClick={updateBusinessName}
          data-testid="update-name"
          className="usa-button usa-button--unstyled font-body-2xs"
        >
          <span className="text-underline">{SearchBusinessNamesDefaults.updateButtonText}</span>
        </button>
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
      <div data-testid="unavailable-text" className="margin-top-2">
        <p className="font-body-2xs text-red">{SearchBusinessNamesDefaults.unavailableText}</p>
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
              <button
                type="submit"
                data-testid="search-availability"
                className="usa-button usa-button--outline text-no-wrap"
                onClick={() => {}}
              >
                {SearchBusinessNamesDefaults.searchButtonText}
              </button>
            </FormControl>
          </div>
        </div>
      </form>
      {nameAvailability?.status === "AVAILABLE" && showAvailable()}
      {nameAvailability?.status === "UNAVAILABLE" && showUnavailable()}
    </>
  );
};
