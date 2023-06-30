import { MainBusiness } from "@/components/tasks/business-formation/business/MainBusiness";
import { MainBusinessAddressNj } from "@/components/tasks/business-formation/business/MainBusinessAddressNj";
import { MainBusinessForeignAddressFlow } from "@/components/tasks/business-formation/business/MainBusinessForeignAddressFlow";
import { PartnershipRights } from "@/components/tasks/business-formation/business/PartnershipRights";
import { Provisions } from "@/components/tasks/business-formation/business/Provisions";
import { BusinessFormationTextBox } from "@/components/tasks/business-formation/BusinessFormationTextBox";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Fragment, ReactElement, useContext, useMemo } from "react";

export const BusinessStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const isForeign = useMemo(
    () => state.formationFormData.businessLocationType !== "NJ",
    [state.formationFormData.businessLocationType]
  );

  const isNonprofit = state.formationFormData.legalType === "nonprofit";

  const addressSection = (): ReactElement =>
    isForeign ? <MainBusinessForeignAddressFlow /> : <MainBusinessAddressNj />;

  const lpSection = (): ReactElement | null => {
    if (state.formationFormData.legalType !== "limited-partnership") return null;
    return (
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
    );
  };

  const businessPurposeSection = (): ReactElement => (
    <>
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} key={"business-line-2"} />,
      <BusinessFormationTextBox
        maxChars={300}
        fieldName={"businessPurpose"}
        required={false}
        inputLabel={Config.formation.fields.businessPurpose.label}
        addButtonText={Config.formation.fields.businessPurpose.addButtonText}
        title={Config.formation.fields.businessPurpose.label}
        contentMd={Config.formation.fields.businessPurpose.body}
      />
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} key={"business-line-3"} />,
    </>
  );

  const additionalProvisionsSection = (): ReactElement | null => {
    if (
      state.formationFormData.businessLocationType !== "NJ" &&
      state.formationFormData.legalType !== "foreign-limited-partnership"
    )
      return null;

    return <Provisions />;
  };

  const defaultOrder: (ReactElement | null)[] = [
    <MainBusiness key={"main-business"} />,
    addressSection(),
    lpSection(),
    businessPurposeSection(),
    additionalProvisionsSection(),
  ];

  const nonprofitOrder: (ReactElement | null)[] = [
    <MainBusiness key={"main-business"} />,
    additionalProvisionsSection(),
    businessPurposeSection(),
    addressSection(),
  ];

  const elementsToDisplay = isNonprofit ? nonprofitOrder : defaultOrder;

  return (
    <div data-testid="business-step">
      {elementsToDisplay.map((element, i) => (
        <Fragment key={i}>{element}</Fragment>
      ))}
    </div>
  );
};
