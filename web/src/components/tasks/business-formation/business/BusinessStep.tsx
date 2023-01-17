import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { PartnershipRights } from "@/components/tasks/business-formation/business/PartnershipRights";
import { Provisions } from "@/components/tasks/business-formation/business/Provisions";
import { BusinessFormationTextBox } from "@/components/tasks/business-formation/BusinessFormationTextBox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const BusinessStep = (): ReactElement => {
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
            placeholderText={Config.businessFormationDefaults.combinedInvestmentPlaceholder}
            title={Config.businessFormationDefaults.combinedInvestmentTitle}
            contentMd={Config.businessFormationDefaults.combinedInvestmentBody}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <BusinessFormationTextBox
            maxChars={400}
            fieldName={"withdrawals"}
            required={true}
            placeholderText={Config.businessFormationDefaults.withdrawalsPlaceholder}
            title={Config.businessFormationDefaults.withdrawalsTitle}
            contentMd={Config.businessFormationDefaults.withdrawalsBody}
          />
          <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
          <PartnershipRights />
          <hr className="margin-bottom-2 margin-top-2" aria-hidden={true} />
          <BusinessFormationTextBox
            maxChars={400}
            fieldName={"dissolution"}
            required={true}
            placeholderText={Config.businessFormationDefaults.dissolutionPlaceholder}
            title={Config.businessFormationDefaults.dissolutionTitle}
            contentMd={Config.businessFormationDefaults.dissolutionBody}
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
        placeholderText={Config.businessFormationDefaults.businessPurposePlaceholderText}
        inputLabel={Config.businessFormationDefaults.businessPurposeLabel}
        addButtonText={Config.businessFormationDefaults.businessPurposeAddButtonText}
        title={Config.businessFormationDefaults.businessPurposeTitle}
        contentMd={Config.businessFormationDefaults.businessPurposeBodyText}
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
