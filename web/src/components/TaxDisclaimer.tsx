import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isTradeNameLegalStructureApplicable } from "@/lib/domain-logic/isTradeNameLegalStructureApplicable";
import { ReactElement } from "react";

interface Props {
  legalStructureId?: string;
}

export const TaxDisclaimer = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      {isTradeNameLegalStructureApplicable(props.legalStructureId) && (
        <div className="margin-top-2" data-testid="tax-disclaimer">
          <Content>{Config.profileDefaults.fields.taxId.default.disclaimerMd}</Content>
        </div>
      )}
    </>
  );
};
