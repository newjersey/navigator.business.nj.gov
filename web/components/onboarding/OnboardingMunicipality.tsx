import React, { ChangeEvent, ReactElement, useContext } from "react";
import { TextField } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { Autocomplete } from "@material-ui/lab";
import { Municipality } from "../../lib/types/types";

export const OnboardingMunicipality = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleMunicipality = (event: ChangeEvent<unknown>, value: Municipality | null) => {
    setOnboardingData({
      ...state.onboardingData,
      municipality: value || undefined,
    });
  };

  return (
    <>
      <h3>{state.displayContent.municipality.title}</h3>
      <p>{state.displayContent.municipality.description}</p>
      <div className="form-input">
        <Autocomplete
          options={state.municipalities}
          getOptionLabel={(municipality: Municipality) => municipality.displayName}
          getOptionSelected={(option: Municipality, value: Municipality) => option.id === value.id}
          value={state.onboardingData.municipality || null}
          onChange={handleMunicipality}
          renderInput={(params) => (
            <TextField
              {...params}
              inputProps={{
                "aria-label": "Location",
                "data-testid": "municipality",
                ...params.inputProps,
              }}
              variant="outlined"
              placeholder={state.displayContent.municipality.placeholder}
            />
          )}
          fullWidth
          openOnFocus
          clearOnEscape
          autoHighlight
        />
      </div>
    </>
  );
};
