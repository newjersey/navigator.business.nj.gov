import Link from "next/link";
import React, { ReactElement } from "react";

interface Props {
  headerText: string;
  mainText: string;
  buttonText: string;
  link: string;
  imageSource: string;
  altImageText: string;
  buttonClassName?: string;
  mainTextClassName?: string;
  // All other props
  [x: string]: unknown;
}

export const Card = (props: Props): ReactElement => {
  const {
    headerText,
    mainText,
    buttonText,
    link,
    imageSource,
    altImageText,
    buttonClassName,
    mainTextClassName,
  } = props;

  return (
    <li className="usa-card usa-card--header-first tablet:grid-col">
      <div className="usa-card__container flex-align-center card-container-nj-style">
        <div className="usa-card__header padding-top-8 padding-top-1">
          <h3 className="usa-card__heading text-green text-center ">{headerText}</h3>
        </div>
        <div className={`usa-card__body text-center card-padding no-padding-x ${mainTextClassName || ""}`}>
          <p>{mainText}</p>
        </div>

        <div className="usa-card__footer card-footer-padding">
          <Link href={link} passHref>
            <button className={`usa-button usa-button--outline ${buttonClassName || ""}`}>
              {buttonText}
            </button>
          </Link>
        </div>

        <div className="usa-card__media usa-card__media--inset card-media-padding">
          <div className="usa-card__img white-background img-width-250">
            <img src={imageSource} alt={altImageText} />
          </div>
        </div>
      </div>
    </li>
  );
};
