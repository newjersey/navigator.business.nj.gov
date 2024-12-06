import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getAddressCity, getAddressCountry, getAddressState } from "@/lib/utils/formation-helpers";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const businessLocationType = state.formationFormData.businessLocationType;

  return (
    <>
      <hr className="margin-y-205" />
      <ReviewSubSection header={Config.formation.sections.addressHeader} marginOverride="margin-top-0">
        <ReviewLineItem
          label={Config.formation.fields.addressLine1.label}
          value={state.formationFormData.addressLine1}
        />
        {state.formationFormData.addressLine2 && (
          <ReviewLineItem
            label={Config.formation.fields.addressLine2.label}
            value={state.formationFormData.addressLine2}
            dataTestId={"business-address-line-two"}
          />
        )}
        <ReviewLineItem
          label={Config.formation.fields.addressCity.label}
          value={getAddressCity(state.formationFormData)}
        />

        {businessLocationType === "INTL" ? (
          <ReviewLineItem
            label={Config.formation.fields.addressProvince.label}
            value={getAddressState(state.formationFormData)}
          />
        ) : (
          <ReviewLineItem
            label={Config.formation.fields.addressState.label}
            value={getAddressState(state.formationFormData)}
          />
        )}

        <ReviewLineItem
          label={Config.formation.fields.addressZipCode.label}
          value={state.formationFormData.addressZipCode}
        />
        {businessLocationType === "INTL" && (
          <ReviewLineItem
            label={Config.formation.fields.addressCountry.label}
            value={getAddressCountry(state.formationFormData)}
          />
        )}
      </ReviewSubSection>
    </>
  );
};
