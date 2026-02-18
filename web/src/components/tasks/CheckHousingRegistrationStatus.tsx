import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Content } from "@/components/Content";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  HousingAddress,
  HousingMunicipality,
  Municipality,
  toProperCase,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  HotelMotelRegistrationSearchError,
  MultipleDwellingSearchError,
} from "@businessnjgovnavigator/shared/types";
import { TextField } from "@mui/material";
import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";

interface Props {
  onSubmit: (address: HousingAddress) => void;
  error: HotelMotelRegistrationSearchError | MultipleDwellingSearchError | undefined;
  isLoading: boolean;
  municipalities: HousingMunicipality[];
}

export const CheckHousingRegistrationStatus = (props: Props): ReactElement => {
  const Config = getMergedConfig();
  const HousingRegistrationSearchErrorLookup: Record<
    HotelMotelRegistrationSearchError | MultipleDwellingSearchError,
    string
  > = {
    NO_PROPERTY_INTEREST_FOUND:
      Config.housingRegistrationSearchTask.errorTextNoPropertyInterestFound,
    NO_HOTEL_MOTEL_REGISTRATIONS_FOUND:
      Config.housingRegistrationSearchTask.errorTextNoHotelMotelRegistrations,
    FIELDS_REQUIRED: Config.housingRegistrationSearchTask.errorTextFieldsRequired,
    SEARCH_FAILED: Config.housingRegistrationSearchTask.errorTextSearchFailed,
    NO_MULTIPLE_DWELLINGS_REGISTRATIONS_FOUND:
      Config.housingRegistrationSearchTask.errorTextNoMultipleDwellingRegistrations,
  };
  const [formValues, setFormValues] = useState<HousingAddress>({ address1: "" });
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | undefined>(
    undefined,
  );
  const { business, updateQueue } = useUserData();

  const formattedMunicipalities = props.municipalities.map((municipality) => {
    return {
      id: municipality.id,
      name: municipality.name,
      displayName: toProperCase(municipality.name),
      county: municipality.county,
    } as Municipality;
  });

  useEffect(() => {
    const communityAffairsAddress = business?.profileData.communityAffairsAddress;

    setFormValues((prevValues) => {
      return {
        ...prevValues,
        address1: communityAffairsAddress?.streetAddress1 || prevValues.address1,
        address2: communityAffairsAddress?.streetAddress2,
      };
    });

    if (communityAffairsAddress?.municipality) {
      setSelectedMunicipality(communityAffairsAddress.municipality);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (business?.profileData && formValues.address1 && selectedMunicipality) {
      const profileData = {
        ...business?.profileData,
        communityAffairsAddress: {
          streetAddress1: formValues.address1,
          streetAddress2: formValues.address2,
          municipality: {
            id: selectedMunicipality?.id,
            name: selectedMunicipality?.name,
            displayName: selectedMunicipality?.name,
            county: selectedMunicipality?.county,
          },
        },
      };
      updateQueue?.queueProfileData(profileData).update();
    }
    props.onSubmit({
      address1: formValues.address1,
      municipalityExternalId: selectedMunicipality?.id || "",
      municipalityName: selectedMunicipality?.name || "",
    });
  };

  const handleChangeForKey = (
    key: keyof HousingAddress,
  ): ((event: ChangeEvent<HTMLInputElement>) => void) => {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      setFormValues((prevValues) => {
        return {
          ...prevValues,
          [key]: event.target.value,
        };
      });
    };
  };

  const getErrorAlert = (): ReactElement => {
    if (!props.error) {
      return <></>;
    }

    return (
      <Alert dataTestid={`error-alert-${props.error}`} variant="error">
        {HousingRegistrationSearchErrorLookup[props.error]}
      </Alert>
    );
  };

  return (
    <>
      {getErrorAlert()}
      {Config.housingRegistrationSearchTask.registrationSearchPrompt}
      <form onSubmit={onSubmit} className={"padding-top-1"}>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">
            <strong>{Config.housingRegistrationSearchTask.address1Label}</strong>
          </label>
          <TextField
            value={formValues.address1}
            onChange={handleChangeForKey("address1")}
            variant="outlined"
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">
            <Content>{Config.housingRegistrationSearchTask.address2Label}</Content>
          </label>
          <TextField
            value={formValues.address2}
            onChange={handleChangeForKey("address2")}
            variant="outlined"
            inputProps={{
              id: "address-2",
              "data-testid": "address-2",
            }}
          />
        </div>
        <div className="fdr flex-half">
          <div className="flex-half padding-right-1">
            <label htmlFor="municipality">
              <strong>{Config.housingRegistrationSearchTask.municipalityLabel}</strong>
            </label>
            <MunicipalityDropdown
              fieldName={"municipalities"}
              municipalities={formattedMunicipalities}
              helperText={""}
              onSelect={(value) => {
                setSelectedMunicipality(value);
              }}
              value={selectedMunicipality}
              onValidation={() => {}}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">
              <strong>{Config.housingRegistrationSearchTask.stateLabel}</strong>
            </label>
            <TextField
              value={"New Jersey"}
              onChange={(): void => {}}
              variant="outlined"
              inputProps={{
                id: "state",
                "data-testid": "state",
                style: {
                  color: "#1b1b1b",
                },
              }}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="mla margin-top-4">
            <SecondaryButton
              isColor="primary"
              isSubmitButton={true}
              isRightMarginRemoved={true}
              onClick={(): void => {}}
              isLoading={props.isLoading}
              dataTestId="check-status-submit"
            >
              {Config.housingRegistrationSearchTask.submitText}
            </SecondaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
