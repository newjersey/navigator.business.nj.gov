import { Content } from "@/components/Content";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  getIsApplicableToFunctionByFieldName,
  getResetIndustrySpecificData,
} from "@/lib/domain-logic/essentialQuestions";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { isHomeBasedBusinessApplicable } from "@/lib/domain-logic/isHomeBasedBusinessApplicable";
import { templateEval } from "@/lib/utils/helpers";
import { splitAndBoldSearchText } from "@/lib/utils/splitAndBoldSearchText";
import {
  CannabisLicenseType,
  Industries,
  Industry,
  LookupIndustryById,
  isIndustryIdGeneric,
} from "@businessnjgovnavigator/shared";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";
import { Autocomplete, FilterOptionsState, TextField, createFilterOptions } from "@mui/material";
import { orderBy } from "lodash";
import { ChangeEvent, FocusEvent, ReactElement, useContext, useState } from "react";

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

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["industryId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "industryId",
    });

  const IndustriesOrdered: Industry[] = orderBy(
    Industries,
    [isIndustryIdGeneric, "name"],
    ["desc", "asc"]
  ).filter((x) => {
    return x.isEnabled || process.env.SHOW_DISABLED_INDUSTRIES === "true";
  });

  const onIndustryIdChange = (industryId: string | undefined): void => {
    let cannabisLicenseType = undefined;

    const homeBasedBusiness: boolean | undefined =
      !isHomeBasedBusinessApplicable(industryId) || nexusLocationInNewJersey(state.profileData)
        ? false
        : undefined;

    if (getIsApplicableToFunctionByFieldName("cannabisLicenseType")(industryId)) {
      const wasCannabisPreviouslyApplicable = getIsApplicableToFunctionByFieldName("cannabisLicenseType")(
        state.profileData.industryId
      );
      cannabisLicenseType = wasCannabisPreviouslyApplicable
        ? state.profileData.cannabisLicenseType
        : ("CONDITIONAL" as CannabisLicenseType);
    }

    const newSector = LookupIndustryById(industryId).defaultSectorId;

    setProfileData({
      ...state.profileData,
      ...getResetIndustrySpecificData(industryId),
      homeBasedBusiness,
      cannabisLicenseType,
      nonEssentialRadioAnswers: {},
      industryId: industryId,
      sectorId: newSector,
      naicsCode: state.profileData.industryId === industryId ? state.profileData.naicsCode : "",
    });
  };

  const isForeignBusiness = state.profileData.businessPersona === "FOREIGN";

  const handleSearchBoxChange = (event: ChangeEvent<HTMLInputElement>): void => {
    props.handleChange && props.handleChange();
    setSearchText(event.target.value.trimEnd());
  };

  const handleIndustry = (event: ChangeEvent<unknown>, value: Industry | null): void => {
    props.handleChange && props.handleChange();
    onIndustryIdChange(value?.id);
    setSearchText(value ? value.name : "");
  };

  const getFilterOptions = (options: Industry[], state: FilterOptionsState<Industry>): Industry[] => {
    const filterOptions = createFilterOptions({
      matchFrom: "any",
      stringify: (option: Industry) => {
        return `${option.name} ${option.description} ${option.additionalSearchTerms}`;
      },
    });
    const industriesList = filterOptions(options, state);

    if (industriesList.length === 0) {
      return [LookupIndustryById("generic")];
    }

    if (isForeignBusiness) {
      return industriesList.filter((industry) => industry.id !== "domestic-employer");
    }

    return industriesList;
  };

  return (
    <Autocomplete
      options={IndustriesOrdered}
      filterOptions={getFilterOptions}
      groupBy={(): string => {
        return "DEFAULT-GROUP";
      }}
      renderGroup={(params): JSX.Element => {
        return (
          <div key={params.key}>
            {searchText.length > 0 && (
              <div className="padding-2" data-testid="search-affirmation">
                <Content>
                  {templateEval(contentFromConfig.searchAffirmation, { searchText: searchText })}
                </Content>
              </div>
            )}
            {params.children}
          </div>
        );
      }}
      getOptionLabel={(industry: Industry): string => {
        return industry.name;
      }}
      isOptionEqualToValue={(option: Industry, value: Industry): boolean => {
        return option.id === value.id;
      }}
      value={state.profileData.industryId ? LookupIndustryById(state.profileData.industryId) : null}
      onChange={handleIndustry}
      onBlur={props.onValidation}
      onSubmit={props.onValidation}
      renderOption={(props, option, { selected }): JSX.Element => {
        return (
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
        );
      }}
      renderInput={(params): JSX.Element => {
        return (
          <div className="text-field-width-default">
            <TextField
              {...params}
              id="industryId"
              inputProps={{
                "aria-label": "Industry",
                "data-testid": "industryId",
                ...params.inputProps,
              }}
              value={searchText}
              onChange={handleSearchBoxChange}
              onSubmit={props.onValidation}
              variant="outlined"
              error={props.error}
              helperText={props.error && props.validationText}
            />
          </div>
        );
      }}
      openOnFocus
      clearOnEscape
      autoHighlight
    />
  );
};
