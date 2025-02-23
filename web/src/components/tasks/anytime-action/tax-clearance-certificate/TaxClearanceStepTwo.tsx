import { Content } from "@/components/Content";
import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { EntityId } from "@/components/data-fields/EntityId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxClearanceCertificateAgencyDropdown } from "@/components/data-fields/TaxClearanceCertificateAgencyDropdown";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const TaxClearanceStepTwo = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <div data-testid={"eligibility-tab"}>
        <Heading level={2} styleVariant={"h3"}>
          {Config.taxClearanceCertificateStep2.requestingAgencySectionHeader}
        </Heading>
        <Content className={"text-bold margin-bottom-05"}>
          {Config.taxClearanceCertificateStep2.requestingAgencyLabel}
        </Content>
        <TaxClearanceCertificateAgencyDropdown />
        <HorizontalLine />
        <div className="margin-top-3">
          <Heading level={2} styleVariant={"h3"}>
            {Config.taxClearanceCertificateStep2.businessInformationSectionHeader}
          </Heading>
        </div>
        <div className="margin-bottom-2">
          <FieldLabelProfile fieldName={"businessName"} />
          <BusinessName inputWidth="full" />
        </div>
        <FieldLabelProfile fieldName={"entityId"} />
        <EntityId inputWidth="full" />

        <div className="margin-y-2">
          <UnitesStatesAddress excludeNJ={false} onValidation={() => {}} isFullWidth />
        </div>

        {/* if encryption is wonky, use regular text field */}
        <FieldLabelProfile fieldName="taxId" />
        <TaxId inputWidth="full" />

        {/* if encryption is wonky, use regular text field */}
        <FieldLabelProfile fieldName="taxPin" />
        <TaxPin inputWidth="full" />
      </div>
    </>
  );
};
