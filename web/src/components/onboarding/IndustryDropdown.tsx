import { Industries, Industry, LookupIndustryById } from "@businessnjgovnavigator/shared";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { Autocomplete, createFilterOptions, TextField } from "@mui/material";
import React, { ChangeEvent, ReactElement, useContext, useState } from "react";
import orderBy from "lodash.orderby";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { OnboardingContext } from "@/pages/onboarding";
import { splitAndBoldSearchText } from "@/lib/utils/helpers";

export const IndustryDropdown = (): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");
  const { state, setProfileData } = useContext(OnboardingContext);

  const IndustriesOrdered: Industry[] = orderBy(Industries, (industry: Industry) => {
    return industry.name;
  });

  const handleIndustryIdChange = (industryId: string | undefined) => {
    let homeBasedBusiness = true;

    if (!isHomeBasedBusinessApplicable(industryId)) {
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
      liquorLicense: isLiquorLicenseApplicable(industryId) ? state.profileData.liquorLicense : false,
      homeBasedBusiness,
      industryId: industryId,
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSearchText(event.target.value);
  };

  const handleIndustry = (event: ChangeEvent<unknown>, value: Industry | null) => {
    handleIndustryIdChange(value?.id);
    setSearchText(value ? value.name : "");
  };

  const filterOptions = createFilterOptions({
    matchFrom: "any",
    stringify: (option: Industry) => `${option.name} ${option.description}`,
  });

  return (
    <Autocomplete
      options={IndustriesOrdered}
      filterOptions={filterOptions}
      getOptionLabel={(industry: Industry) => industry.name}
      isOptionEqualToValue={(option: Industry, value: Industry) => option.id === value.id}
      value={state.profileData.industryId ? LookupIndustryById(state.profileData.industryId) : null}
      onChange={handleIndustry}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          {selected ? (
            <div className="padding-top-1 padding-bottom-1" data-testid={option.id}>
              <MenuOptionSelected secondaryText={option.description}>{option.name}</MenuOptionSelected>
            </div>
          ) : (
            <div className="padding-top-1 padding-bottom-1" data-testid={option.id}>
              <MenuOptionUnselected secondaryText={splitAndBoldSearchText(option.description, searchText)}>
                {splitAndBoldSearchText(option.name, searchText)}
              </MenuOptionUnselected>
            </div>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          id="industry"
          inputProps={{
            "aria-label": "Industry",
            "data-testid": "industryid",
            ...params.inputProps,
          }}
          value={searchText}
          onChange={handleChange}
          variant="outlined"
          placeholder={state.displayContent.industry.placeholder}
        />
      )}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
