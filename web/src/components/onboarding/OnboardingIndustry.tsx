import React, { ReactElement, ReactNode, useContext } from "react";
import { Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Industries, Industry, LookupIndustryById } from "@businessnjgovnavigator/shared";
import { Content } from "@/components/Content";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { setHeaderRole } from "@/lib/utils/helpers";
import orderBy from "lodash.orderby";

export const OnboardingIndustry = (): ReactElement => {
  const { state, setProfileData } = useContext(OnboardingContext);
  const [open, setOpen] = React.useState(false);

  const handleIndustry = (event: SelectChangeEvent) => {
    let industry = "generic";
    if (event.target.value) {
      industry = event.target.value as string;
    }

    let homeBasedBusiness = true;
    if (!isHomeBasedBusinessApplicable(industry)) {
      homeBasedBusiness = false;
    } else {
      const wasHomeBasedBusinessPreviouslyApplicable = isHomeBasedBusinessApplicable(
        state.profileData.industryId
      );
      if (wasHomeBasedBusinessPreviouslyApplicable) {
        homeBasedBusiness = state.profileData.homeBasedBusiness;
      }
    }

    setProfileData({
      ...state.profileData,
      liquorLicense: isLiquorLicenseApplicable(industry) ? state.profileData.liquorLicense : false,
      homeBasedBusiness,
      industryId: industry,
    });
  };

  const renderOption = (industry: Industry | string): ReactElement => {
    const industryRecord: Industry | undefined =
      typeof industry === "string" ? LookupIndustryById(industry) : industry;

    if (!industryRecord) throw "Industry is undefined";

    return state.profileData.industryId === industryRecord.id ? (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionSelected secondaryText={industryRecord.description}>
          {industryRecord.name}
        </MenuOptionSelected>
      </div>
    ) : (
      <div className="padding-top-1 padding-bottom-1">
        <MenuOptionUnselected secondaryText={industryRecord.description}>
          {industryRecord.name}
        </MenuOptionUnselected>
      </div>
    );
  };

  const renderValue = (value: unknown): ReactNode => {
    if (value === "") {
      return <span className="text-base">{state.displayContent.industry.placeholder}</span>;
    }

    const industry = LookupIndustryById(value as string);
    if (!industry) throw "Industry is undefined";

    return <>{industry.name}</>;
  };

  const headerLevelTwo = setHeaderRole(2, "h2-element");

  const IndustriesOrdered: Industry[] = orderBy(Industries, (industry: Industry) => {
    return industry.name;
  });

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>{state.displayContent.industry.contentMd}</Content>
      <div className="form-input margin-top-2">
        <FormControl fullWidth>
          <InputLabel id="industry-label" className="visibility-hidden">
            Industry
          </InputLabel>
          <Select
            labelId="industry-label"
            id="Industry"
            displayEmpty
            value={state.profileData.industryId || ""}
            onChange={handleIndustry}
            open={open}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
            inputProps={{ "data-testid": "industryid" }}
            renderValue={renderValue}
          >
            <MenuItem value="generic" data-testid="generic">
              {renderOption("generic")}
            </MenuItem>
            <Divider aria-hidden="true" style={{ background: "#e6e6e6" }} />
            {IndustriesOrdered.filter((industry) => industry.id !== "generic").map((industry) => (
              <MenuItem key={industry.id} value={industry.id} data-testid={industry.id}>
                {renderOption(industry)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {state.profileData.industryId === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificHomeContractorMd}</Content>
          </div>
        )}

        {state.profileData.industryId === "employment-agency" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificEmploymentAgencyMd}</Content>
          </div>
        )}

        {isLiquorLicenseApplicable(state.profileData.industryId) && (
          <div className="margin-top-4">
            <OnboardingLiquorLicense />
          </div>
        )}
      </div>
    </>
  );
};
