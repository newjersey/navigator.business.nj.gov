import { Alert } from "@/components/njwds-extended/Alert";
import { Addresses } from "@/components/tasks/business-formation/contacts/Addresses";
import { createSignedEmptyFormationObject } from "@/components/tasks/business-formation/contacts/helpers";
import { Members } from "@/components/tasks/business-formation/contacts/Members";
import { RegisteredAgent } from "@/components/tasks/business-formation/contacts/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/contacts/Signatures";
import { getErrorStateForField } from "@/components/tasks/business-formation/getErrorStateForField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import {
  corpLegalStructures,
  createEmptyFormationIncorporator,
  FormationIncorporator,
  incorporationLegalStructures,
} from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

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

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const getDescription = (field: string): string => {
    const legalType = state.formationFormData.legalType;
    const overriddenLegalTypes = Object.keys((Config.formation.fields as any)[field].overrides ?? {});
    if (overriddenLegalTypes.includes(legalType)) {
      return ((Config.formation.fields as any)[field].overrides as any)[legalType].description;
    }
    return (Config.formation.fields as any)[field].description;
  };

  return (
    <>
      <div data-testid="contacts-step">
        <RegisteredAgent />
        {shouldShowMembers() && (
          <>
            <hr className="margin-top-0 margin-bottom-3" />
            <Members hasError={doesFieldHaveError("members")} />
          </>
        )}
        <hr className="margin-top-0 margin-bottom-3" />
        {doesFieldHaveError("signers") && (
          <Alert variant="error">
            {getErrorStateForField({ field: "signers", formationFormData: state.formationFormData }).label}
          </Alert>
        )}
        {incorporationLegalStructures.includes(state.formationFormData.legalType) ? (
          <Addresses<FormationIncorporator>
            createEmptyAddress={(): FormationIncorporator => {
              return createSignedEmptyFormationObject(
                state.formationFormData.legalType,
                createEmptyFormationIncorporator,
              );
            }}
            fieldName={"incorporators"}
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
        ) : (
          <Signatures />
        )}
      </div>
    </>
  );
};
