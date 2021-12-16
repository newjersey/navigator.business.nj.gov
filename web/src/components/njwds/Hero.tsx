import { AuthButton } from "@/components/AuthButton";
import React, { ReactElement } from "react";

interface Props {
  calloutText: string;
  subCalloutText: string;
  supportingText: string;
  callToActionText: string;
  onClick: () => void;
}

export const Hero = (props: Props): ReactElement => {
  return (
    <div className="usa-hero gradient-bg padding-top-12 padding-bottom-10">
      <div className="grid-container text-center flex-r-desktop">
        <div className="margin-auto flex-order-2 flex-larger">
          <img src="/img/Hero-img-climb.svg" alt="Hero People Climbing" />
        </div>
        <div className="usa-hero__callout no-bg no-max-width flex-order-1 max-width flex-smaller no-padding-x">
          <h1 className="usa-hero__heading large-font text-primary-darker text-left-desktop hero-header-custom">
            <span className="usa-hero__heading--alt text-primary-darker display-inline-override display-block">
              {props.calloutText} <br />
            </span>
            {props.subCalloutText}
          </h1>
          <p className="text-gray-90 med-font text-left-desktop margin-bottom-4">{props.supportingText}</p>
          <div className="display-inline-block display-flex-custom">
            <button
              className="usa-button usa-button--big margin-right-205 margin-bottom-2 text-no-wrap"
              onClick={props.onClick}
              data-hero-button
            >
              {props.callToActionText}
            </button>
            <AuthButton />
          </div>
        </div>
      </div>
    </div>
  );
};
