import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getConfigFieldByLegalStructure } from "@/lib/utils/helpers";
import {
  corpLegalStructures,
  createEmptyFormationMember,
  FormationMember,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props {
  hasError: boolean;
}

export const Members = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);

  const defaultAddress = isCorp
    ? undefined
    : {
        name:
          state.formationFormData.members?.length === 0
            ? `${state.formationFormData.contactFirstName.trim()} ${state.formationFormData.contactLastName.trim()}`
            : "",
        addressCity: state.formationFormData.addressMunicipality?.name ?? state.formationFormData.addressCity,
        addressLine1: state.formationFormData.addressLine1,
        addressLine2: state.formationFormData.addressLine2,
        addressState: state.formationFormData.addressState,
        addressZipCode: state.formationFormData.addressZipCode,
      };

  const configField = getConfigFieldByLegalStructure(state.formationFormData.legalType);

  const displayContent = {
    header: Config.formation.fields[configField].label,
    subheader: Config.formation.fields[configField].subheader,
    description: Config.formation.fields[configField].description,
    newButtonText: Config.formation.fields[configField].addButtonText,
    snackbarHeader: Config.formation.fields[configField].successSnackbarHeader,
    snackbarBody: Config.formation.fields[configField].successSnackbarBody,
    modalTitle: Config.formation.fields[configField].modalTitle,
    modalSaveButton: Config.formation.fields[configField].modalSaveButton,
    defaultCheckbox: isCorp ? undefined : Config.formation.fields.members.addressCheckboxText,
    placeholder: Config.formation.fields[configField].placeholder ?? "",
    error: Config.formation.fields[configField].error ?? "",
  };

  return (
    <Addresses<FormationMember>
      createEmptyAddress={createEmptyFormationMember}
      fieldName={"members"}
      addressData={state.formationFormData.members ?? []}
      setData={(members): void => {
        setFormationFormData((previousFormationFormData) => {
          return { ...previousFormationFormData, members };
        });
      }}
      needSignature={false}
      displayContent={displayContent}
      defaultAddress={defaultAddress}
      legalType={state.formationFormData.legalType}
      hasError={props.hasError}
    />
  );
};
