import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

import { CigaretteSalesStartDate } from "@/components/tasks/cigarette-license/fields/CigaretteSalesStartDate";
import { CigaretteSupplierDropdown } from "@/components/tasks/cigarette-license/fields/CigaretteSupplierDropdown";

interface Props {
  setStepIndex: (step: number) => void;
  CMS_ONLY_show_error?: boolean;
}

export const SalesInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <>
      <h2>{Config.cigaretteLicenseStep3.salesInformationHeader}</h2>
      <CigaretteSalesStartDate CMS_ONLY_show_error={props.CMS_ONLY_show_error} />
      <div className="margin-top-3">
        <CigaretteSupplierDropdown CMS_ONLY_show_error={props.CMS_ONLY_show_error} />
      </div>
      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <SecondaryButton isColor="primary" onClick={() => props.setStepIndex(1)}>
            {Config.cigaretteLicenseStep3.backButtonText}
          </SecondaryButton>
          <PrimaryButton
            isColor="primary"
            onClick={() => props.setStepIndex(3)}
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep3.nextButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
