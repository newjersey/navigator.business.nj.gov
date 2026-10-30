import {
  corpLegalStructures,
  createEmptyFormationIncorporator,
  type FormationIncorporator,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/";
import { type ReactElement, useContext } from "react";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { createSignedEmptyFormationObject } from "@/components/tasks/business-formation/contacts/helpers";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { getLegalTypeOverride } from "@/components/tasks/business-formation/formationFieldContent";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";

export const ContactsStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const { doesFieldHaveError } = useFormationErrors();

  const shouldShowMembers = (): boolean => {
    return (
      [...corpLegalStructures, "limited-liability-company", "nonprofit"].includes(
        state.formationFormData.legalType,
      ) && state.formationFormData.businessLocationType === "NJ"
    );
  };

  const getDescription = (field: "incorporators"): string => {
    const fieldContent = Config.formation.fields[field];
    const override = getLegalTypeOverride(fieldContent, state.formationFormData.legalType);
    if (override) {
      return override.description;
    }
    return fieldContent.description;
  };

  return (
    <>
      <div data-testid="contacts-step">
        <RegisteredAgent />
        {shouldShowMembers() && (
          <>
            <hr className="margin-y-3" />
            <ScrollableFormFieldWrapper fieldName="members">
              <Members hasError={doesFieldHaveError("members")} />
            </ScrollableFormFieldWrapper>
          </>
        )}
        <hr className="margin-y-3" />
        {incorporationLegalStructures.includes(state.formationFormData.legalType) ? (
          <ScrollableFormFieldWrapper fieldName="incorporators">
            <Addresses<FormationIncorporator>
              createEmptyAddress={(): FormationIncorporator => {
                return createSignedEmptyFormationObject(
                  state.formationFormData.legalType,
                  createEmptyFormationIncorporator,
                );
              }}
              fieldName="incorporators"
              addressData={state.formationFormData.incorporators ?? []}
              setData={(incorporators): void => {
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
                description: getDescription("incorporators"),
                header: Config.formation.fields.incorporators.label,
                placeholder: Config.formation.fields.incorporators.placeholder ?? "",
                newButtonText: Config.formation.fields.incorporators.addButtonText,
                snackbarHeader: Config.formation.fields.incorporators.successSnackbarHeader,
                snackbarBody: Config.formation.fields.incorporators.successSnackbarBody,
                modalTitle: Config.formation.fields.incorporators.modalTitle,
                modalSaveButton: Config.formation.fields.incorporators.addButtonText,
                error: Config.formation.fields.incorporators.error,
              }}
              legalType={state.formationFormData.legalType}
              hasError={doesFieldHaveError("signers") || doesFieldHaveError("incorporators")}
            />
          </ScrollableFormFieldWrapper>
        ) : (
          <Signatures />
        )}
      </div>
    </>
  );
};
