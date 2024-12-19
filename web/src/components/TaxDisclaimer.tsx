import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ReactElement } from "react";

interface Props {
  legalStructureId?: string;
}

export const TaxDisclaimer = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <>
      {LookupLegalStructureById(props.legalStructureId).elementsToDisplay.has("taxIdDisclaimer") && (
        <div className="margin-top-2" data-testid="tax-disclaimer">
          <Content>{Config.profileDefaults.fields.taxId.default.disclaimerMd}</Content>
        </div>
      )}
    </>
  );
};
