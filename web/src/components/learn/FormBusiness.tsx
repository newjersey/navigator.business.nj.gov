import type { ReactElement } from "react";
import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import type {
  CalloutTypes,
  LargeCalloutProps,
} from "@/components/njwds-extended/callout/calloutHelpers";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { useConfig } from "@/lib/data-hooks/useConfig";

interface Props {
  heading: string;
}

interface LearnCalloutProps extends Omit<LargeCalloutProps, "calloutType"> {
  children: string[];
  calloutType?: CalloutTypes;
}

const CALLOUT_ICON_CLASSES: Partial<Record<CalloutTypes, string>> = {
  conditional: "learn-form-business-callout-icon--conditional",
  informational: "learn-form-business-callout-icon--informational",
  quickReference: "learn-form-business-callout-icon--quickReference",
};

export const FormBusiness = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const h2Override = ({ children }: { children: string[] }): ReactElement => (
    <h2 className="text-secondary-darker" style={{ marginTop: "1rem" }}>
      {children}
    </h2>
  );

  const largeCalloutOverride = (calloutProps: LearnCalloutProps): ReactElement => {
    const { children, headerText, calloutType = "conditional", ...remainingProps } = calloutProps;
    const iconClass = CALLOUT_ICON_CLASSES[calloutType];

    if (!headerText || !iconClass) {
      return (
        <LargeCallout {...remainingProps} calloutType={calloutType} headerText={headerText}>
          {children}
        </LargeCallout>
      );
    }

    return (
      <LargeCallout {...remainingProps} calloutType={calloutType} showHeader={false}>
        <div className="grid-row grid-gap-2 flex-align-start width-100">
          <div className="grid-col-12 tablet:grid-col-3">
            <div className="display-inline-block text-secondary-darker">
              <span className="display-block text-bold">{headerText}</span>
              <span
                className={`learn-form-business-callout-icon ${iconClass} display-none tablet:display-block margin-x-auto margin-top-1`}
                aria-hidden="true"
                data-testid="form-business-callout-icon"
              />
            </div>
          </div>
          <div className="grid-col-12 tablet:grid-col-9 text-base-darkest">{children}</div>
        </div>
      </LargeCallout>
    );
  };

  return (
    <>
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <Content>{Config.learnPageFormBusiness.overview}</Content>
      <br></br>
      <div className="grid-row grid-gap-4 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-business-name-availability.png"
            alt={Config.learnPageFormBusiness.nameAvailabilityImageAlt}
          />
        </div>
        <div className="grid-col-12 tablet:grid-col-7">
          <h3 className="text-accent-cool-darker">
            {Config.learnPageFormBusiness.firstSectionHeader}
          </h3>
          <Content>{Config.learnPageFormBusiness.firstSection}</Content>
        </div>
      </div>
      <br></br>
      <HorizontalLine />
      <div className="grid-row grid-gap-2 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-7">
          <h3 className="text-accent-cool-darker">
            {Config.learnPageFormBusiness.secondSectionHeader}
          </h3>
          <Content>{Config.learnPageFormBusiness.secondSection}</Content>
        </div>
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-business-details.png"
            alt={Config.learnPageFormBusiness.businessDetailsImageAlt}
          />
        </div>
      </div>
      <br></br>
      <Content overrides={{ h2: h2Override, largeCallout: largeCalloutOverride }}>
        {Config.learnPageFormBusiness.moreInfo}
      </Content>
    </>
  );
};
