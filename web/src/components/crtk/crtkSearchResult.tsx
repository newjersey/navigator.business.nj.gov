// Update to accept crtkData prop instead of using mock data
import { StatusResultHeader } from "@/components/crtk/crtkResultHeader";
import type { CRTKData } from "@/components/crtk/crtkTypes";
import { HorizontalLine } from "@/components/HorizontalLine";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Task } from "@businessnjgovnavigator/shared/types";
import { type ReactElement } from "react";

type StatusType = "FOUND" | "NOT_FOUND";

interface Props {
  isLoading: boolean;
  task?: Task;
  crtkData: CRTKData;
  onSearchAgain?: () => void;
}

const Config = getMergedConfig();

export const CRTKSearchResult = (props: Props): ReactElement => {
  const { crtkData } = props;
  const status = crtkData.CRTKSearchResult as StatusType;
  const businessDetails = crtkData.CRTKBusinessDetails;

  const statusContent = {
    NOT_FOUND: {
      header: "Business Not Found",
      description: `${businessDetails?.businessName} is not currently in the CRTK database.`,
    },
    FOUND: {
      header: "Business Found",
      description: `${businessDetails?.businessName} is in the New Jersey Community Right to Know (CRTK) database. This means you may have chemical reporting requirements.`,
    },
  };

  const CRTKContactInfo = (): ReactElement => {
    return (
      <>
        <p className="margin-bottom-1 text-bold">
          If you have any questions, contact a CRTK expert:
        </p>
        <ul>
          <li>Phone: (609) 292-6714</li>
          <li>
            Email:{" "}
            <a href="mailto:rts@dep.nj.gov" className="text-underline">
              rts@dep.nj.gov
            </a>
          </li>
        </ul>
      </>
    );
  };

  return (
    <>
      <div className="margin-bottom-4">
        <p className="text-base-darkest margin-bottom-2">{Config.crtkTask.introText}</p>
      </div>
      <div className="bg-accent-cooler-50 padding-2 margin-bottom-3 radius-lg">
        <p className="text-base-dark text-bold margin-bottom-0">{businessDetails?.businessName}</p>
        <p className="text-base-dark margin-bottom-2">
          {businessDetails?.addressLine1}, {businessDetails?.city},{" "}
          {businessDetails?.addressZipCode} NJ
        </p>

        <div className="bg-white padding-4 radius-lg">
          <StatusResultHeader
            status={status}
            headerLabel={"Permit Status"}
            statusContent={statusContent}
            testIdPrefix="status"
          />
          <HorizontalLine customMargin={"margin-top-2"} />

          {/* Conditional rendering based on status */}
          {status === "FOUND" ? (
            <>
              <ResultsSectionAccordion
                title={"Your CRTK Details"}
                headingStyleOverride={"font-open-sans-7"}
                titleIcon={
                  <Icon
                    iconName={"comment"}
                    className={`text-accent-warm-darker bg-warning-lighter height-3 width-3 padding-5px radius-pill margin-right-1`}
                  />
                }
              >
                <div className="margin-top-1 font-open-sans-5">
                  <p className="margin-bottom-1">
                    <strong>Facility Type:</strong> {crtkData.facilityType || "N/A"}
                  </p>
                  <p className="margin-bottom-1">
                    <strong>Eligibility:</strong> {crtkData.eligibility || "N/A"}
                  </p>
                  <p className="margin-bottom-1">
                    <strong>Facility Status:</strong> {crtkData.facilityStatus || "N/A"}
                  </p>
                </div>
              </ResultsSectionAccordion>

              <ResultsSectionAccordion
                title={"Next Steps"}
                headingStyleOverride={"font-open-sans-7"}
                titleIcon={
                  <Icon
                    iconName={"check_circle"}
                    className={`text-accent-warm-darker bg-warning-lighter height-3 width-3 padding-5px radius-pill margin-right-1`}
                  />
                }
              >
                <div className="margin-top-1 font-open-sans-5">
                  <p className="margin-bottom-2">
                    You must complete the survey if your facility had EHS above a specific threshold
                    during the previous year. Fill out the survey for each location where the
                    chemical was stored by March 1 every year.
                  </p>
                  <p className="margin-bottom-2">
                    Complete an exemption form if any of the following are true:
                  </p>
                  <ul className="margin-bottom-2">
                    <li>Your building is an administrative site only</li>
                    <li>Your building has no EHS</li>
                    <li>Your building has EHS below the threshold</li>
                    <li>Your building has staff on-site</li>
                  </ul>
                  <p className="margin-bottom-2">
                    <strong>Note:</strong>{" "}
                    {`If CRTK approves your exemption, you don't need to fill
                    out the form every year.`}
                  </p>
                  <CRTKContactInfo />
                </div>
              </ResultsSectionAccordion>
            </>
          ) : (
            <>
              <ResultsSectionAccordion
                title={"Next Steps"}
                headingStyleOverride={"font-open-sans-7"}
                titleIcon={
                  <Icon
                    iconName={"check_circle"}
                    className={`text-base-darkest bg-base-lighter height-3 width-3 padding-5px radius-pill margin-right-1`}
                  />
                }
              >
                <div className="margin-top-1 font-open-sans-5">
                  <p className="margin-bottom-2">
                    {`Your business isn't in the CRTK database for one of the following reasons:`}
                  </p>
                  <ul className="margin-bottom-2">
                    <li>
                      Your business is not in an industry that is likely to have environmental
                      requirements
                    </li>
                    <li>{`Your business isn't registered yet`}</li>
                    <li>
                      {`Your business is registered, but your information hasn't been processed on the
                      CRTK side`}
                    </li>
                    <li>{`Your business name and address don't match what is in the system`}</li>
                  </ul>
                  <CRTKContactInfo />
                </div>
              </ResultsSectionAccordion>
            </>
          )}

          {props.onSearchAgain && (
            <div className="margin-top-3">
              <PrimaryButton
                isColor="outline"
                onClick={props.onSearchAgain}
                dataTestId="crtk-search-again"
              >
                Search Again
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>

      {status === "FOUND" && (
        <div className="bg-warning-lighter padding-2 margin-top-4 radius-lg">
          <div className="display-flex ">
            <div>
              <h3 className="margin-top-0 margin-bottom-1 text-accent-warm-darker text-bold">
                {Config.crtkTask.warningTitle}
              </h3>
              <p className="margin-bottom-0 text-accent-warm-darker">
                {Config.crtkTask.warningText}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-info-lighter  padding-2 margin-top-2 radius-lg">
        <h3 className="margin-top-0 margin-bottom-1 text-accent-cool-more-dark text-bold">
          {Config.crtkTask.federalInfoTitle}
        </h3>
        <p className="margin-bottom-1 text-accent-cool-more-dark">
          {Config.crtkTask.federalInfoText}
        </p>
        <a href="https://www.epa.gov/epcra" className="text-underline text-accent-cool-more-dark">
          {Config.crtkTask.federalLinkText}
        </a>
      </div>
    </>
  );
};
