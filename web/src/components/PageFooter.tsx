import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

export const PageFooter = (): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const { Config } = useConfig();

  return (
    <div className="bg-base-darkest text-white">
      <div
        className={`${
          isLargeScreen ? "flex flex-align-center fjb" : ""
        } margin-x-auto padding-y-4 grid-container-widescreen desktop:padding-x-7`}
      >
        <section aria-label="New Jersey Office of Innovation information and services">
          <ul
            className={`${
              isLargeScreen ? "flex" : "flex flex-column flex-align-center"
            } footer-social-media-structure`}
          >
            <li>
              <div>
                <a
                  href={Config.footer.linkOne}
                  className="margin-right-1 text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Config.footer.linkOneText}
                </a>
              </div>
            </li>
            <li>
              <div>
                <a
                  href={Config.footer.linkTwo}
                  className="margin-left-1 text-white"
                  target="_blank"
                  rel="noreferrer"
                >
                  {Config.footer.linkTwoText}
                </a>
              </div>
            </li>
          </ul>
          <hr className="margin-y-2" />
          <ul
            className={`${
              isLargeScreen ? "flex" : "flex flex-column flex-align-center"
            } footer-social-media-structure`}
          >
            <li className="padding-right-1 text-center">
              <div>
                <a
                  href={Config.footer.officeLink}
                  className="text-white"
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={Config.footer.madeWithLoveByTheOfficeOfInnovationAriaLabel}
                >
                  {Config.footer.madeWithText}
                  &nbsp;<Icon className="text-accent-hot">favorite</Icon>&nbsp;
                  {Config.footer.byTheOfficeOfInnovationText}
                </a>
              </div>
            </li>

            <li className="padding-left-0 desktop:padding-left-1 tablet:display-inline">
              <div>
                {Config.footer.creditText}
                <a href={Config.footer.creditLink} target="_blank" className="text-white" rel="noreferrer">
                  {Config.footer.creditLinkText}
                </a>
              </div>
            </li>
          </ul>
          {!isLargeScreen && <hr className="margin-y-2" />}
        </section>

        <section aria-label="Social media">
          <div className="display-flex flex-column fac">
            <div>{Config.footer.officeExternalText}</div>
            <ul className={`footer-social-media-structure flex`}>
              <li>
                <div>
                  <a
                    href={Config.footer.gitHubLink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="margin-right-105"
                  >
                    <Icon className="footer-social-media-icon margin-top-1">github</Icon>
                  </a>
                </div>
              </li>
              <li>
                <div>
                  <a href={Config.footer.facebookLink} target="_blank" rel="noreferrer" aria-label="Facebook">
                    <Icon className="footer-social-media-icon margin-top-1">facebook</Icon>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};
