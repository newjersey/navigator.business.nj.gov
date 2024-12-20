import { Heading } from "@/components/njwds-extended/Heading";
import { FormationRadio } from "@/components/tasks/business-formation/business/FormationRadio";
import { FormationTextArea } from "@/components/tasks/business-formation/business/FormationTextArea";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormationFields, FormationTextField } from "@businessnjgovnavigator/shared";
import { ReactElement, ReactNode, useContext } from "react";

export const PartnershipRights = (): ReactElement<any> => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const getTextArea = (fieldName: FormationTextField): ReactNode => {
    return (
      <FormationTextArea
        fieldName={fieldName}
        label={Config.formation.partnershipRights.description}
        maxChars={400}
      />
    );
  };

  const getRadio = (fieldName: FormationFields, title: string): ReactNode => {
    return (
      <FormationRadio
        fieldName={fieldName}
        title={title}
        values={["true", "false"]}
        onChange={(e): void => {
          setFormationFormData({
            ...state.formationFormData,
            [fieldName]: JSON.parse(e.target.value),
          });
          setFieldsInteracted([fieldName]);
        }}
        overrideLabelMap={{
          true: Config.formation.partnershipRights.radioYesText,
          false: Config.formation.partnershipRights.radioNoText,
        }}
      />
    );
  };

  return (
    <>
      <div className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2">
        <Heading level={2} styleVariant="h3" className="margin-bottom-0">
          {Config.formation.partnershipRights.label}
        </Heading>
      </div>

      {getRadio("canCreateLimitedPartner", Config.formation.fields.canCreateLimitedPartner.body)}
      {state.formationFormData.canCreateLimitedPartner && getTextArea("createLimitedPartnerTerms")}

      {getRadio("canGetDistribution", Config.formation.fields.canGetDistribution.body)}
      {state.formationFormData.canGetDistribution && getTextArea("getDistributionTerms")}

      {getRadio("canMakeDistribution", Config.formation.fields.canMakeDistribution.body)}
      {state.formationFormData.canMakeDistribution && getTextArea("makeDistributionTerms")}
    </>
  );
};
