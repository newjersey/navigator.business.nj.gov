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
    <section className="usa-hero" aria-label="Introduction">
      <div className="grid-container">
        <div className="usa-hero__callout">
          <h1 className="usa-hero__heading">
            <span className="usa-hero__heading--alt">{props.calloutText}</span>
            {props.subCalloutText}
          </h1>
          <p>{props.supportingText}</p>
          <button className="usa-button" onClick={props.onClick}>
            {props.callToActionText}
          </button>
        </div>
      </div>
    </section>
  );
};
