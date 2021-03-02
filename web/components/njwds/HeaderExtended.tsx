import { ReactElement } from "react";

export const HeaderExtended = (): ReactElement => {
  return (
    <>
      <div className="usa-overlay"></div>
      <header className="usa-header usa-header--extended">
        <div className="usa-navbar">
          <div className="usa-logo" id="extended-logo">
            <em className="usa-logo__text">
              <a href="/" title="Home" aria-label="Home">
                Project title
              </a>
            </em>
          </div>
          <button className="usa-menu-btn">Menu</button>
        </div>
        <nav aria-label="Primary navigation" className="usa-nav">
          <div className="usa-nav__inner">
            <button className="usa-nav__close">
              <img src="/img/close.svg" alt="close" />
            </button>
            <ul className="usa-nav__primary usa-accordion">
              <li className="usa-nav__primary-item">
                <button
                  className="usa-accordion__button usa-nav__link  usa-current"
                  aria-expanded="false"
                  aria-controls="extended-nav-section-one"
                >
                  <span>Current section</span>
                </button>
                <ul id="extended-nav-section-one" className="usa-nav__submenu">
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                </ul>
              </li>
              <li className="usa-nav__primary-item">
                <button
                  className="usa-accordion__button usa-nav__link"
                  aria-expanded="false"
                  aria-controls="extended-nav-section-two"
                >
                  <span>Section</span>
                </button>
                <ul id="extended-nav-section-two" className="usa-nav__submenu">
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                  <li className="usa-nav__submenu-item">
                    <a href="/" className="">
                      {" "}
                      Navigation link
                    </a>
                  </li>
                </ul>
              </li>
              <li className="usa-nav__primary-item">
                <a className="usa-nav__link" href="/">
                  <span>Simple link</span>
                </a>
              </li>
            </ul>
            <div className="usa-nav__secondary">
              <ul className="usa-nav__secondary-links">
                <li className="usa-nav__secondary-item">
                  <a href="/">Secondary link</a>
                </li>
                <li className="usa-nav__secondary-item">
                  <a href="/">Another secondary link</a>
                </li>
              </ul>
              <form className="usa-search usa-search--small " role="search">
                <label className="usa-sr-only" htmlFor="extended-search-field-small">
                  Search small
                </label>
                <input className="usa-input" id="extended-search-field-small" type="search" name="search" />
                <button className="usa-button" type="submit">
                  <span className="usa-sr-only">Search</span>
                </button>
              </form>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
