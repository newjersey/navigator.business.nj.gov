import { ReactElement } from "react";
import { AuthButton } from "@/components/AuthButton";

interface Props {
  calloutText: string;
  subCalloutText: string;
  supportingText: string;
  callToActionText: string;
  onClick: () => void;
}

export const Hero = (props: Props): ReactElement => {
  return (
    <section
      className="usa-hero gradient-bg top-padding top-padding-5 padding-bottom-10 "
      aria-label="Introduction"
    >
      <div className="grid-container text-align flex-desktop">
        <h1 className="hero-header med-font">
          Welcome to <span className="bold-font"> MyBizNJ! </span>
        </h1>
        <div className="hero-image flex-order-2">
          <img src="/img/Hero-img.svg" alt="Hero People" />
        </div>
        <div className="usa-hero__callout no-bg no-max-width flex-order-1">
          <h1 className="usa-hero__heading large-font text-primary-darker text-desktop">
            <span className="usa-hero__heading--alt text-primary-darker display-inline-lscreen display-desktop">
              {props.calloutText}
            </span>
            {props.subCalloutText}
          </h1>
          <p className="dark-font med-font p-width p-padding text-desktop margin-bottom-4">
            {props.supportingText}
          </p>
          <div className="display-inline-block display-flex-desktop">
            <button
              className="usa-button usa-button--big left-buttton margin-right-205"
              onClick={props.onClick}
              data-hero-button
            >
              {props.callToActionText}
            </button>
            <AuthButton />
          </div>
        </div>
      </div>
    </section>
  );
};
