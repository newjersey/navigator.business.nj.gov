import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { PartnershipRights } from "@/components/tasks/business-formation/business/PartnershipRights";
import { Provisions } from "@/components/tasks/business-formation/business/Provisions";
import { BusinessFormationTextBox } from "@/components/tasks/business-formation/BusinessFormationTextBox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const BusinessStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid="business-step">
      <MainBusiness />
      {state.formationFormData.legalType == "limited-partnership" ? (
        <>
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <BusinessFormationTextBox
            maxChars={400}
            fieldName={"combinedInvestment"}
            required={true}
            title={Config.formation.fields.combinedInvestment.label}
            contentMd={Config.formation.fields.combinedInvestment.body}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <BusinessFormationTextBox
            maxChars={400}
            fieldName={"withdrawals"}
            required={true}
            title={Config.formation.fields.withdrawals.label}
            contentMd={Config.formation.fields.withdrawals.body}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <PartnershipRights />
          <hr className="margin-bottom-2 margin-top-2" aria-hidden={true} />
          <BusinessFormationTextBox
            maxChars={400}
            fieldName={"dissolution"}
            required={true}
            title={Config.formation.fields.dissolution.label}
            contentMd={Config.formation.fields.dissolution.body}
          />
        </>
      ) : (
        <></>
      )}
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <BusinessFormationTextBox
        maxChars={300}
        fieldName={"businessPurpose"}
        required={false}
        inputLabel={Config.formation.fields.businessPurpose.label}
        addButtonText={Config.formation.fields.businessPurpose.addButtonText}
        title={Config.formation.fields.businessPurpose.label}
        contentMd={Config.formation.fields.businessPurpose.body}
      />
      {state.formationFormData.businessLocationType != "NJ" &&
      state.formationFormData.legalType != "foreign-limited-partnership" ? (
        <></>
      ) : (
        <>
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <Provisions />
        </>
      )}
    </div>
  );
};
