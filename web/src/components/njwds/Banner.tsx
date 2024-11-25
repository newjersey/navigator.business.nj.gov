import { ReactElement } from "react";

export const Banner = (): ReactElement => {
  return (
    <div className="nj-banner">
      <div className="nj-banner__header">
        <div className="grid-container-widescreen desktop:padding-x-7">
          <div className="nj-banner__inner margin-y-1 row-desktop-column-mobile fas flex-align-center-desktop-start-mobile space-between">
            <div className="flex fac margin-y-05">
              <img
                className="nj-banner__header-seal"
                src="/vendor/img/nj_state_seal.png"
                alt="NJ flag"
                role="presentation"
              />
              <a href="https://nj.gov" target="_blank" rel="noreferrer">
                Official Site of the State of New Jersey
              </a>
            </div>
            <div className="flex row-desktop-column-mobile">
              <div className="margin-right-1 padding-right-1 desktop:border-right margin-y-05">
                Governor Phil Murphy &bull; Lt. Governor Tahesha Way
              </div>
              <div className="margin-y-05">
                <a href="https://nj.gov/subscribe/" target="_blank" rel="noreferrer">
                  <svg
                    className="usa-icon bottom-neg-2px margin-right-05"
                    aria-hidden="true"
                    focusable="false"
                    role="img"
                  >
                    <use xlinkHref="/vendor/img/sprite.svg#mail"></use>
                  </svg>
                  Get Updates
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
