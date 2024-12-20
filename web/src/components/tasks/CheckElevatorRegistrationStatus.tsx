import { MunicipalityDropdown } from "@/components/data-fields/MunicipalityDropdown";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ElevatorRegistrationSearchError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { toProperCase } from "@businessnjgovnavigator/shared";
import { ElevatorSafetyAddress } from "@businessnjgovnavigator/shared/elevatorSafety";
import { HousingMunicipality } from "@businessnjgovnavigator/shared/housing";
import { Municipality } from "@businessnjgovnavigator/shared/municipality";
import { TextField } from "@mui/material";
import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";

interface Props {
  onSubmit: (address: ElevatorSafetyAddress) => void;
  error: ElevatorRegistrationSearchError | undefined;
  isLoading: boolean;
  municipalities: HousingMunicipality[];
}

const Config = getMergedConfig();
const ElevatorSearchErrorLookup: Record<ElevatorRegistrationSearchError, string> = {
  NO_PROPERTY_INTEREST_FOUND: Config.elevatorRegistrationSearchTask.errorTextNoPropertyInterestFound,
  NO_ELEVATOR_REGISTRATIONS_FOUND: Config.elevatorRegistrationSearchTask.errorTextNoElevatorRegistrations,
  FIELDS_REQUIRED: Config.elevatorRegistrationSearchTask.errorTextFieldsRequired,
  SEARCH_FAILED: Config.elevatorRegistrationSearchTask.errorTextSearchFailed,
};

export const CheckElevatorRegistrationStatus = (props: Props): ReactElement<any> => {
  const [formValues, setFormValues] = useState<ElevatorSafetyAddress>({ address1: "" });
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality | undefined>(undefined);
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

    if (communityAffairsAddress) {
      if (communityAffairsAddress.streetAddress1) {
        setFormValues((prevValues) => {
          return {
            ...prevValues,
            address1: communityAffairsAddress.streetAddress1,
          };
        });
      }
      if (communityAffairsAddress.streetAddress2) {
        setFormValues((prevValues) => {
          return {
            ...prevValues,
            address2: communityAffairsAddress.streetAddress2,
          };
        });
      }
      if (communityAffairsAddress.municipality) {
        setSelectedMunicipality(communityAffairsAddress.municipality);
      }
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
    analytics.event.task_elevator_registration.submit.elevator_registration_form_submission();
    props.onSubmit({
      address1: formValues.address1,
      municipalityExternalId: selectedMunicipality?.id || "",
      municipalityName: selectedMunicipality?.name || "",
    });
  };

  const handleChangeForKey = (
    key: keyof ElevatorSafetyAddress
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

  const getErrorAlert = (): ReactElement<any> => {
    if (!props.error) {
      return <></>;
    }

    return (
      <Alert dataTestid={`error-alert-${props.error}`} variant="error">
        {ElevatorSearchErrorLookup[props.error]}
      </Alert>
    );
  };

  return (
    <>
      {getErrorAlert()}
      {Config.elevatorRegistrationSearchTask.registrationSearchPrompt}
      <form onSubmit={onSubmit} className={"padding-top-1"}>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{Config.elevatorRegistrationSearchTask.address1Label}</label>
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
          <label htmlFor="address-2">{Config.elevatorRegistrationSearchTask.address2Label}</label>
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
            <label htmlFor="municipality">{Config.elevatorRegistrationSearchTask.municipalityLabel}</label>
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
            <label htmlFor="state">{Config.elevatorRegistrationSearchTask.stateLabel}</label>
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
              {Config.elevatorRegistrationSearchTask.submitText}
            </SecondaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
