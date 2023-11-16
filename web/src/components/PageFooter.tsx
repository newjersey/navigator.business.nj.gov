import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { openInNewTab } from "@/lib/utils/helpers";
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
          <div className={`${isLargeScreen ? "" : "flex flex-column flex-align-center"}`}>
            <a
              href={Config.footer.linkOne}
              className="margin-right-1 text-white"
              target="_blank"
              rel="noreferrer"
            >
              {Config.footer.linkOneText}
            </a>
            <a
              href={Config.footer.linkTwo}
              className="margin-x-1 text-white"
              target="_blank"
              rel="noreferrer"
            >
              {Config.footer.linkTwoText}
            </a>

            <a
              href={Config.footer.linkThree}
              className="margin-left-1 text-white"
              target="_blank"
              rel="noreferrer"
            >
              {Config.footer.linkThreeText}
            </a>
          </div>
          <hr className="margin-y-2" />
          <div className={`${isLargeScreen ? "" : "flex flex-column flex-align-center"}`}>
            <span className="padding-right-1 text-center">
              <UnStyledButton
                onClick={(): void => openInNewTab(Config.footer.officeLink)}
                className="text-white text-center"
                ariaLabel="Made with love by the Office of Innovation"
                style="footerLink"
                isUnderline={true}
              >
                {Config.footer.madeWithText}
                &nbsp;<Icon className="text-accent-hot">favorite</Icon>
                {Config.footer.byTheOfficeOfInnovationText.replaceAll(" ", "\u00A0")}
              </UnStyledButton>
            </span>

            <div className="padding-left-0 desktop:padding-left-1 tablet:display-inline">
              {Config.footer.creditText}
              <a href={Config.footer.creditLink} target="_blank" className="text-white" rel="noreferrer">
                {Config.footer.creditLinkText}
              </a>
            </div>
          </div>
          {!isLargeScreen && <hr className="margin-y-2" />}
        </section>

        <section aria-label="Social media">
          <div className="display-flex flex-column fac">
            <div>{Config.footer.officeExternalText}</div>
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
              <a href={Config.footer.twitterLink} target="_blank" rel="noreferrer" aria-label="Twitter">
                <Icon className="footer-social-media-icon margin-top-1">twitter</Icon>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
