import { Alert } from "@/components/njwds-extended/Alert";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { createSignedEmptyFormationObject } from "@/components/tasks/business-formation/contacts/helpers";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  corpLegalStructures,
  createEmptyFormationIncorporator,
  FormationIncorporator,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ContactsStep = (): ReactElement => {
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const shouldShowMembers = (): boolean => {
    return (
      [...corpLegalStructures, "limited-liability-company"].includes(state.formationFormData.legalType) &&
      state.formationFormData.businessLocationType == "NJ"
    );
  };

  return (
    <>
      <div data-testid="contacts-step">
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
        {doesFieldHaveError("incorporators") && (
          <Alert variant="error">
            {getErrorStateForField("incorporators", state.formationFormData, undefined).label}
          </Alert>
        )}
        {incorporationLegalStructures.includes(state.formationFormData.legalType) ? (
          <Addresses<FormationIncorporator>
            createEmptyAddress={() => {
              return createSignedEmptyFormationObject(
                state.formationFormData.legalType,
                createEmptyFormationIncorporator
              );
            }}
            fieldName={"incorporators"}
            addressData={state.formationFormData.incorporators ?? []}
            setData={(incorporators) => {
              setFormationFormData((previousFormationData) => {
                return {
                  ...previousFormationData,
                  incorporators: incorporators,
                };
              });
            }}
            defaultAddress={
              "limited-partnership" === state.formationFormData.legalType
                ? {
                    addressCity:
                      state.formationFormData.addressMunicipality?.name ??
                      state.formationFormData.addressCity,
                    addressLine1: state.formationFormData.addressLine1,
                    addressLine2: state.formationFormData.addressLine2,
                    addressState: state.formationFormData.addressState,
                    addressZipCode: state.formationFormData.addressZipCode,
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
