import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import TabPanel from "@mui/lab/TabPanel";
import { ReactNode } from "react";

export const XrayTabZero = (props: {
  xrayContent: {
    summaryMd: string;
    contentMd: string;
    callToActionLink: string;
  };
  issuingAgency: string;
  ctaPrimaryText: string;
  ctaPrimaryOnClick: (callToActionLink: string) => void;
  ctaSecondaryText: string;
  ctaSecondaryOnClick: () => void;
}): ReactNode => {
  return (
    <TabPanel value="0">
      <div className="margin-top-3">
        <Content>{props.xrayContent.summaryMd || ""}</Content>
        <Content>{props.xrayContent.contentMd}</Content>
        <HorizontalLine />
        <div className="h6-styling">{props.issuingAgency}</div>
      </div>
      <CtaContainer>
        <ActionBarLayout>
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton
              isColor="primary"
              onClick={props.ctaSecondaryOnClick}
              dataTestId="cta-secondary"
            >
              {props.ctaSecondaryText}
            </SecondaryButton>
          </div>
          <PrimaryButton
            isColor="primary"
            onClick={() => props.ctaPrimaryOnClick(props.xrayContent.callToActionLink)}
            isRightMarginRemoved
            dataTestId="cta-primary"
          >
            {props.ctaPrimaryText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </TabPanel>
  );
};
