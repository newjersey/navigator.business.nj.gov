import React, { ReactElement, ReactNode, useContext } from "react";
import { Divider, FormControl, ListSubheader, MenuItem, Select } from "@material-ui/core";
import { OnboardingContext } from "../../pages/onboarding";
import { Industry } from "../../lib/types/types";
import { IndustryLookup } from "../../display-content/IndustryLookup";
import { Content } from "../Content";
import { MenuOptionUnselected } from "../MenuOptionUnselected";
import { MenuOptionSelected } from "../MenuOptionSelected";
import { Alert } from "../njwds/Alert";

export const OnboardingIndustry = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

  const handleIndustry = (event: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    let industry: Industry = "generic";
    if (event.target.value) {
      industry = event.target.value as Industry;
    }
    setOnboardingData({
      ...state.onboardingData,
      industry,
    });
  };

  const renderOption = (industry: Industry): ReactElement =>
    state.onboardingData.industry === industry ? (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionSelected secondaryText={IndustryLookup[industry].secondaryText}>
          {IndustryLookup[industry].primaryText}
        </MenuOptionSelected>
      </div>
    ) : (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionUnselected secondaryText={IndustryLookup[industry].secondaryText}>
          {IndustryLookup[industry].primaryText}
        </MenuOptionUnselected>
      </div>
    );

  const renderValue = (value: unknown): ReactNode => {
    if (value === "placeholder") {
      return <span className="text-base">{state.displayContent.industry.placeholder}</span>;
    }

    return <>{IndustryLookup[value as Industry].primaryText}</>;
  };

  return (
    <>
      <Content>{state.displayContent.industry.contentMd}</Content>
      <Alert variant="info" slim className="margin-bottom-4">
        <Content>{state.displayContent.industry.infoAlertMd}</Content>
      </Alert>
      <div className="form-input margin-top-2">
        <FormControl variant="outlined" fullWidth>
          <Select
            fullWidth
            value={state.onboardingData.industry || "placeholder"}
            onChange={handleIndustry}
            inputProps={{
              "aria-label": "Industry",
              "data-testid": "industry",
            }}
            renderValue={renderValue}
          >
            <MenuItem value="restaurant" data-testid="restaurant">
              {renderOption("restaurant")}
            </MenuItem>
            <MenuItem value="home-contractor" data-testid="home-contractor">
              {renderOption("home-contractor")}
            </MenuItem>
            <MenuItem value="e-commerce" data-testid="e-commerce">
              {renderOption("e-commerce")}
            </MenuItem>
            <MenuItem value="cosmetology" data-testid="cosmetology">
              {renderOption("cosmetology")}
            </MenuItem>
            <ListSubheader>
              <Divider light />
            </ListSubheader>
            <MenuItem value="generic" data-testid="generic">
              {renderOption("generic")}
            </MenuItem>
          </Select>
        </FormControl>

        {state.onboardingData.industry === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificHomeContractorMd}</Content>
          </div>
        )}
      </div>
    </>
  );
};
