import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isCannabisLicenseApplicable } from "@/lib/domain-logic/essentialQuestions/isCannabisLicenseApplicable";
import { isCertifiedInteriorDesignerApplicable } from "@/lib/domain-logic/essentialQuestions/isCertifiedInteriorDesignerApplicable";
import { isCpaRequiredApplicable } from "@/lib/domain-logic/essentialQuestions/isCpaRequiredApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/essentialQuestions/isLiquorLicenseApplicable";
import { isProvidesStaffingServicesApplicable } from "@/lib/domain-logic/essentialQuestions/isProvidesStaffingServicesApplicable";
import { isRealEstateAppraisalManagementApplicable } from "@/lib/domain-logic/essentialQuestions/isRealEstateAppraisalManagementApplicable";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { splitAndBoldSearchText, templateEval } from "@/lib/utils/helpers";
import {
  CannabisLicenseType,
  Industries,
  Industry,
  isIndustryIdGeneric,
  LookupIndustryById,
} from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Autocomplete, createFilterOptions, FilterOptionsState, TextField } from "@mui/material";
import { orderBy } from "lodash";
import { ChangeEvent, FocusEvent, ReactElement, useContext, useState } from "react";
import { Content } from "../Content";

interface Props {
  handleChange?: () => void;
  onValidation?: (event: FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  validationText?: string;
  validationLabel?: string;
}

export const IndustryDropdown = (props: Props): ReactElement => {
  const [searchText, setSearchText] = useState<string>("");
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const IndustriesOrdered: Industry[] = orderBy(
    Industries,
    [isIndustryIdGeneric, "name"],
    ["desc", "asc"]
  ).filter((x) => x.isEnabled || process.env.SHOW_DISABLED_INDUSTRIES == "true");

  const onIndustryIdChange = (industryId: string | undefined) => {
    let homeBasedBusiness: boolean | undefined = undefined;
    let cannabisLicenseType = undefined;

    if (!isHomeBasedBusinessApplicable(industryId)) {
      homeBasedBusiness = false;
    }

    if (isCannabisLicenseApplicable(industryId)) {
      const wasCannabisPreviouslyApplicable = isCannabisLicenseApplicable(state.profileData.industryId);
      cannabisLicenseType = wasCannabisPreviouslyApplicable
        ? state.profileData.cannabisLicenseType
        : ("CONDITIONAL" as CannabisLicenseType);
    }

    const newSector = LookupIndustryById(industryId).defaultSectorId;

    setProfileData({
      ...state.profileData,
      liquorLicense: isLiquorLicenseApplicable(industryId)
        ? state.profileData.liquorLicense
        : emptyProfileData.liquorLicense,
      requiresCpa: isCpaRequiredApplicable(industryId)
        ? state.profileData.requiresCpa
        : emptyProfileData.requiresCpa,
      realEstateAppraisalManagement: isRealEstateAppraisalManagementApplicable(industryId)
        ? state.profileData.realEstateAppraisalManagement
        : emptyProfileData.realEstateAppraisalManagement,
      certifiedInteriorDesigner: isCertifiedInteriorDesignerApplicable(industryId)
        ? state.profileData.certifiedInteriorDesigner
        : emptyProfileData.certifiedInteriorDesigner,
      providesStaffingService: isProvidesStaffingServicesApplicable(industryId)
        ? state.profileData.providesStaffingService
        : emptyProfileData.providesStaffingService,
      homeBasedBusiness,
      cannabisLicenseType,
      industryId: industryId,
      sectorId: newSector,
    });
  };

  const handleSearchBoxChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    setSearchText(event.target.value);
  };

  const handleIndustry = (event: ChangeEvent<unknown>, value: Industry | null) => {
    props.handleChange && props.handleChange();
    onIndustryIdChange(value?.id);
    setSearchText(value ? value.name : "");
  };

  const getFilterOptions = (options: Industry[], state: FilterOptionsState<Industry>) => {
    const filterOptions = createFilterOptions({
      matchFrom: "any",
      stringify: (option: Industry) => `${option.name} ${option.description} ${option.additionalSearchTerms}`,
    });
    const industriesList = filterOptions(options, state);

    if (industriesList.length === 0) {
      return [LookupIndustryById("generic")];
    }
    return industriesList;
  };

  return (
    <Autocomplete
      options={IndustriesOrdered}
      filterOptions={getFilterOptions}
      groupBy={() => "DEFAULT-GROUP"}
      renderGroup={(params) => (
        <div key={params.key}>
          {searchText.length > 0 && (
            <div className="padding-2" data-testid="search-affirmation">
              <Content>
                {templateEval(Config.profileDefaults[state.flow].industryId.searchAffirmation, {
                  searchText: searchText,
                })}
              </Content>
            </div>
          )}
          {params.children}
        </div>
      )}
      getOptionLabel={(industry: Industry) => industry.name}
      isOptionEqualToValue={(option: Industry, value: Industry) => option.id === value.id}
      value={state.profileData.industryId ? LookupIndustryById(state.profileData.industryId) : null}
      onChange={handleIndustry}
      onBlur={props.onValidation}
      onSubmit={props.onValidation}
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
          id="industryId"
          inputProps={{
            "aria-label": "Industry",
            "data-testid": "industryid",
            ...params.inputProps,
          }}
          value={searchText}
          onChange={handleSearchBoxChange}
          onSubmit={props.onValidation}
          variant="outlined"
          placeholder={Config.profileDefaults[state.flow].industryId.placeholder}
          error={props.error}
          helperText={props.error ? props.validationText ?? " " : " "}
        />
      )}
      fullWidth
      openOnFocus
      clearOnEscape
      autoHighlight
      ListboxProps={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sx: {
          "& li:nth-of-type(even)": { backgroundColor: "#F9FBFB" },
          "& li:nth-of-type(odd)": { backgroundColor: "#FFFFFF" },
        },
      }}
    />
  );
};
