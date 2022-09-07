import { Alert } from "@/components/njwds-extended/Alert";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ContactsSection = (): ReactElement => {
  const { userData } = useUserData();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const shouldShowMembers = (): boolean => {
    return [...corpLegalStructures, "limited-liability-company"].includes(
      userData?.profileData.legalStructureId ?? ""
    );
  };

  const shouldShowSignersWithAddresses = (): boolean => {
    return [...corpLegalStructures, "limited-partnership"].includes(state.legalStructureId);
  };

  return (
    <>
      <div data-testid="contacts-section">
        <RegisteredAgent />
        {shouldShowMembers() && (
          <>
            <hr className="margin-top-0 margin-bottom-3" />
            {doesFieldHaveError("members") && (
              <Alert variant="error">
                {getErrorStateForField("members", state.formationFormData, undefined).label}
              </Alert>
            )}
            <Members />
          </>
        )}
        <hr className="margin-top-0 margin-bottom-3" />
        {doesFieldHaveError("signers") && (
          <Alert variant="error">
            {getErrorStateForField("signers", state.formationFormData, undefined).label}
          </Alert>
        )}
        {shouldShowSignersWithAddresses() ? (
          <Addresses
            fieldName={"signers"}
            addressData={state.formationFormData.signers}
            setData={(signers) => {
              const members =
                "limited-partnership" === state.legalStructureId ? signers : state.formationFormData.members;
              setFormationFormData({ ...state.formationFormData, signers, members });
            }}
            defaultAddress={
              "limited-partnership" === state.legalStructureId
                ? {
                    addressCity: state.formationFormData.businessAddressCity?.name as string,
                    addressLine1: state.formationFormData.businessAddressLine1,
                    addressLine2: state.formationFormData.businessAddressLine2,
                    addressState: state.formationFormData.businessAddressState,
                    addressZipCode: state.formationFormData.businessAddressZipCode,
                  }
                : undefined
            }
            needSignature={true}
            displayContent={{
              contentMd: state.displayContent.signatureHeader.contentMd,
              placeholder: state.displayContent.signatureHeader.placeholder ?? "",
              newButtonText: Config.businessFormationDefaults.addNewSignerButtonText,
              alertHeader: Config.businessFormationDefaults.incorporatorsSuccessTextHeader,
              alertBody: Config.businessFormationDefaults.incorporatorsSuccessTextBody,
              title: Config.businessFormationDefaults.incorporatorsModalTitle,
              saveButton: Config.businessFormationDefaults.incorporatorsModalNextButtonText,
            }}
          />
        ) : (
          <Signatures />
        )}
      </div>
    </>
  );
};
