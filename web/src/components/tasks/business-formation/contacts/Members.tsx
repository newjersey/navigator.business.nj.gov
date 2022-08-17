import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const Members = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(BusinessFormationContext);
  const isCorp = corpLegalStructures.includes(state.legalStructureId);

  const defaultAddress = !isCorp
    ? {
        name:
          state.formationFormData.members.length === 0
            ? `${state.formationFormData.contactFirstName.trim()} ${state.formationFormData.contactLastName.trim()}`
            : "",
        addressCity: state.formationFormData.businessAddressCity?.name as string,
        addressLine1: state.formationFormData.businessAddressLine1,
        addressLine2: state.formationFormData.businessAddressLine2,
        addressState: state.formationFormData.businessAddressState,
        addressZipCode: state.formationFormData.businessAddressZipCode,
        signature: false,
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
    <Addresses
      fieldName={"members"}
      addressData={state.formationFormData.members}
      setData={(members) => {
        setFormationFormData({ ...state.formationFormData, members });
        if (
          members.every(
            (it) => it.name && it.addressCity && it.addressLine1 && it.addressState && it.addressZipCode
          )
        ) {
          setErrorMap({ ...state.errorMap, members: { invalid: false } });
        }
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
