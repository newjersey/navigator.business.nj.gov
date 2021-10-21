import React, { ReactElement, ReactNode, useContext } from "react";
import { Divider, FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { OnboardingContext } from "@/pages/onboarding";
import { Industries, Industry, LookupIndustryById } from "@/shared/industry";
import { Content } from "@/components/Content";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { setHeaderRole } from "@/lib/utils/helpers";
import orderBy from "lodash.orderby";

export const OnboardingIndustry = (): ReactElement => {
  const { state, setOnboardingData } = useContext(OnboardingContext);

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
        state.onboardingData.industryId
      );
      if (wasHomeBasedBusinessPreviouslyApplicable) {
        homeBasedBusiness = state.onboardingData.homeBasedBusiness;
      }
    }

    setOnboardingData({
      ...state.onboardingData,
      liquorLicense: isLiquorLicenseApplicable(industry) ? state.onboardingData.liquorLicense : false,
      homeBasedBusiness,
      industryId: industry,
    });
  };

  const renderOption = (industry: Industry | string): ReactElement => {
    const industryRecord: Industry | undefined =
      typeof industry === "string" ? LookupIndustryById(industry) : industry;

    if (!industryRecord) throw "Industry is undefined";

    return state.onboardingData.industryId === industryRecord.id ? (
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
        <FormControl variant="outlined" fullWidth>
          <Select
            fullWidth
            displayEmpty
            value={state.onboardingData.industryId || ""}
            onChange={handleIndustry}
            inputProps={{
              "aria-label": "Industry",
              "data-testid": "industryid",
            }}
            renderValue={renderValue}
          >
            <MenuItem value="generic" data-testid="generic">
              {renderOption("generic")}
            </MenuItem>
            <Divider style={{ background: "#e6e6e6" }} />
            {IndustriesOrdered.filter((industry) => industry.id !== "generic").map((industry) => (
              <MenuItem key={industry.id} value={industry.id} data-testid={industry.id}>
                {renderOption(industry)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {state.onboardingData.industryId === "home-contractor" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificHomeContractorMd}</Content>
          </div>
        )}

        {state.onboardingData.industryId === "employment-agency" && (
          <div className="margin-top-2">
            <Content>{state.displayContent.industry.specificEmploymentAgencyMd}</Content>
          </div>
        )}

        {isLiquorLicenseApplicable(state.onboardingData.industryId) && (
          <div className="margin-top-4">
            <OnboardingLiquorLicense />
          </div>
        )}
      </div>
    </>
  );
};
