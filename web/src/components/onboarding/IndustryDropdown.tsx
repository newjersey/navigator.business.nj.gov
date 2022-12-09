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
  isIndustryIdGeneric,
  LookupIndustryById,
} from "@businessnjgovnavigator/shared/";
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
    return x.isEnabled || process.env.SHOW_DISABLED_INDUSTRIES == "true";
  });

  const onIndustryIdChange = (industryId: string | undefined) => {
    let homeBasedBusiness: boolean | undefined = undefined;
    let cannabisLicenseType = undefined;

    if (!isHomeBasedBusinessApplicable(industryId)) {
      homeBasedBusiness = false;
    }

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
      stringify: (option: Industry) => {
        return `${option.name} ${option.description} ${option.additionalSearchTerms}`;
      },
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
      groupBy={() => {
        return "DEFAULT-GROUP";
      }}
      renderGroup={(params) => {
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
      getOptionLabel={(industry: Industry) => {
        return industry.name;
      }}
      isOptionEqualToValue={(option: Industry, value: Industry) => {
        return option.id === value.id;
      }}
      value={state.profileData.industryId ? LookupIndustryById(state.profileData.industryId) : null}
      onChange={handleIndustry}
      onBlur={props.onValidation}
      onSubmit={props.onValidation}
      renderOption={(props, option, { selected }) => {
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
      renderInput={(params) => {
        return (
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
            placeholder={contentFromConfig.placeholder}
            error={props.error}
            helperText={props.error ? props.validationText ?? " " : " "}
          />
        );
      }}
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
