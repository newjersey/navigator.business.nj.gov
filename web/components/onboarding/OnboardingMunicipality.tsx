import React, { ChangeEvent, ReactElement, useContext, useState } from "react";
import { TextField } from "@material-ui/core";
import { OnboardingContext } from "@/pages/onboarding";
import { Autocomplete } from "@material-ui/lab";
import { Municipality } from "@/lib/types/types";
import { Content } from "@/components/Content";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";

export const OnboardingMunicipality = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);
  const [searchText, setSearchText] = useState<string>("");

  const handleMunicipality = (event: ChangeEvent<unknown>, value: Municipality | null) => {
    setSearchText(value ? value.displayName : "");
    setOnboardingData({
      ...state.onboardingData,
      municipality: value || undefined,
    });
  };

  const splitAndBoldSearchText = (displayName: string): ReactElement => {
    const index = displayName.toLowerCase().indexOf(searchText.toLowerCase());
    if (index >= 0) {
      const prefixText = displayName.substr(0, index);
      const toBold = displayName.substr(index, searchText.length);
      const afterText = displayName.substr(index + searchText.length);
      return (
        <span style={{ whiteSpace: "pre-wrap" }}>
          {prefixText}
          <span className="text-bold">{toBold}</span>
          {afterText}
        </span>
      );
    } else {
      return <>{displayName}</>;
    }
  };

  return (
    <>
      <Content>{state.displayContent.municipality.contentMd}</Content>
      <div className="form-input margin-top-2">
        <Autocomplete
          options={state.municipalities}
          getOptionLabel={(municipality: Municipality) => municipality.displayName}
          getOptionSelected={(option: Municipality, value: Municipality) => option.id === value.id}
          value={state.onboardingData.municipality || null}
          onChange={handleMunicipality}
          renderOption={(option) =>
            state.onboardingData.municipality?.id === option.id ? (
              <MenuOptionSelected>{option.displayName}</MenuOptionSelected>
            ) : (
              <MenuOptionUnselected>{splitAndBoldSearchText(option.displayName)}</MenuOptionUnselected>
            )
          }
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{
                "aria-label": "Location",
                "data-testid": "municipality",
                ...params.inputProps,
              }}
              value={searchText}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearchText(event.target.value)}
              variant="outlined"
              placeholder={state.displayContent.municipality.placeholder}
            />
          )}
          fullWidth
          openOnFocus
          clearOnEscape
          autoHighlight
        />

        {isHomeBasedBusinessApplicable(state.onboardingData.industry) && (
          <div className="margin-top-3">
            <OnboardingHomeBasedBusiness />
          </div>
        )}
      </div>
    </>
  );
};
