import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  corpLegalStructures,
  createEmptyFormationMember,
  FormationMember,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const Members = (): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const isCorp = corpLegalStructures.includes(state.legalStructureId);
  const defaultAddress = !isCorp
    ? {
        name:
          state.formationFormData.members?.length === 0
            ? `${state.formationFormData.contactFirstName.trim()} ${state.formationFormData.contactLastName.trim()}`
            : "",
        addressCity:
          state.formationFormData.addressMunicipality?.displayName ?? state.formationFormData.addressCity,
        addressLine1: state.formationFormData.addressLine1,
        addressLine2: state.formationFormData.addressLine2,
        addressState: state.formationFormData.addressState,
        addressZipCode: state.formationFormData.addressZipCode,
      }
    : undefined;

  const displayContent = isCorp
    ? {
        newButtonText: Config.businessFormationDefaults.directorsNewButtonText,
        alertHeader: Config.businessFormationDefaults.directorsSuccessTextHeader,
        alertBody: Config.businessFormationDefaults.directorsSuccessTextBody,
        title: Config.businessFormationDefaults.directorsModalTitle,
        saveButton: Config.businessFormationDefaults.directorsModalNextButtonText,
      }
    : {
        newButtonText: Config.businessFormationDefaults.membersNewButtonText,
        alertHeader: Config.businessFormationDefaults.membersSuccessTextHeader,
        alertBody: Config.businessFormationDefaults.membersSuccessTextBody,
        title: Config.businessFormationDefaults.membersModalTitle,
        defaultCheckbox: Config.businessFormationDefaults.membersCheckboxText,
        saveButton: Config.businessFormationDefaults.membersModalNextButtonText,
      };

  return (
    <Addresses<FormationMember>
      createEmptyAddress={createEmptyFormationMember}
      fieldName={"members"}
      addressData={state.formationFormData.members ?? []}
      setData={(members) => {
        setFormationFormData((previousFormationFormData) => {
          return { ...previousFormationFormData, members };
        });
      }}
      needSignature={false}
      displayContent={{
        contentMd: state.displayContent.members.contentMd,
        placeholder: state.displayContent.members.placeholder ?? "",
        ...displayContent,
      }}
      defaultAddress={defaultAddress}
    />
  );
};
