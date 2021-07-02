import { ReactElement } from "react";

interface Props {
  calloutText: string;
  subCalloutText: string;
  supportingText: string;
  callToActionText: string;
  onClick: () => void;
}

export const Hero = (props: Props): ReactElement => {
  return (
    <section className="usa-hero gradient-bg top-padding top-padding-5" aria-label="Introduction">
      <div className="grid-container text-align flex-desktop">
        <h1 className="hero-header med-font">
          Welcome to <span className="bold-font"> MyBizNJ! </span>
        </h1>
        <div className="hero-image flex-order-2">
          <img src="/img/Hero-img.svg" alt="Hero People" />
        </div>
        <div className="usa-hero__callout no-bg no-max-width flex-order-1">
          <h1 className="usa-hero__heading large-font dark-font text-desktop">
            <span className="usa-hero__heading--alt dark-font display-inline-lscreen display-desktop">
              {props.calloutText}
            </span>
            {props.subCalloutText}
          </h1>
          <p className="dark-font med-font p-width p-padding text-desktop">{props.supportingText}</p>
          <button
            className="usa-button usa-button--big left-buttton"
            onClick={props.onClick}
            data-hero-button
          >
            {props.callToActionText}
          </button>
        </div>
      </div>
    </section>
  );
};
