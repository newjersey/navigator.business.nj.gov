import { ReactElement } from "react";

export const Banner = (): ReactElement => {
  return (
    <section className="nj-banner" aria-label="Official government website">
      <header className="nj-banner__header">
        <div className="grid-container">
          <div className="nj-banner__inner">
            <div className="grid-col-auto">
              <img
                className="nj-banner__header-seal"
                src="/img/nj_state_seal.png"
                alt="NJ flag"
              />
            </div>
            <div className="grid-col-fill">
              <a href="https://nj.gov">
                Official Site of the State of New Jersey
              </a>
            </div>
            <div className="grid-col-auto">
              <div className="text-white">
                <ul>
                  <li>
                    Governor Phil Murphy &bull; Lt. Governor Sheila Oliver
                  </li>
                  <li>
                    <a href="https://nj.gov/subscribe/" target="_blank">
                      <svg
                        className="usa-icon bottom-neg-2px margin-right-05"
                        aria-hidden="true"
                        focusable="false"
                        role="img"
                      >
                        <use xlinkHref="/img/sprite.svg#mail"></use>
                      </svg>
                      Get Updates
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </header>
    </section>
  );
};
