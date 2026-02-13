// Update to accept crtkData prop instead of using mock data
import { Content } from "@/components/Content";
import { CrtkNotFound } from "@/components/crtk/CrtkNotFound";
import { CrtkFacilityDetails } from "@/components/crtk/CrtkStatus";
import { StatusResultHeader } from "@/components/crtk/StatusResultHeader";
import { HorizontalLine } from "@/components/HorizontalLine";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { CrtkData } from "@businessnjgovnavigator/shared/crtk";
import { Task } from "@businessnjgovnavigator/shared/types";
import dayjs from "dayjs";
import { type ReactElement } from "react";

type StatusType = "FOUND";

interface Props {
  isLoading: boolean;
  task?: Task;
  crtkData: CrtkData;
  onSearchAgain: () => void;
  onResubmit: (facilityDetails: CrtkFacilityDetails) => Promise<void>;
}

const Config = getMergedConfig();

export const CrtkSearchResult = (props: Props): ReactElement => {
  const { crtkData } = props;
  const status = crtkData.crtkSearchResult as StatusType;
  const businessDetails = crtkData.crtkBusinessDetails;

  const statusContent = {
    FOUND: {
      header: "Business Found",
      description: `${businessDetails?.businessName || "Your business"} is in the New Jersey Community Right to Know (CRTK) database. This means you may have chemical reporting requirements.`,
    },
  };

  const CrtkContactInfo = (): ReactElement => {
    return (
      <>
        <p className="margin-bottom-1 text-bold">{Config.crtkTask.contactCrtkExpertTitle}</p>
        <ul>
          <li>Phone: (609) 292-6714</li>
          <li>
            Email:{" "}
            <a href="mailto:rtk@dep.nj.gov" className="text-underline">
              rtk@dep.nj.gov
            </a>
          </li>
        </ul>
      </>
    );
  };

  const CrtkFound = (): ReactElement => {
    return (
      <>
        <div className="bg-accent-cooler-50 padding-2 margin-bottom-3 radius-lg">
          <p className="text-base-dark text-bold margin-bottom-0">
            {businessDetails?.businessName}
          </p>
          <p className="text-base-dark margin-bottom-2">
            {businessDetails?.addressLine1}, {businessDetails?.city},{" "}
            {businessDetails?.addressZipCode} NJ
            {props.onSearchAgain && (
              <>
                {" "}
                <button
                  onClick={props.onSearchAgain}
                  className="usa-button usa-button--unstyled text-primary text-underline"
                  data-testid="crtk-edit-business-info"
                >
                  Edit
                </button>
              </>
            )}
          </p>
          <div className="bg-white padding-4 radius-lg">
            <StatusResultHeader
              status={status}
              headerLabel={`Permit Status${status === "FOUND" ? ": In Review" : ""}`}
              statusContent={statusContent}
              testIdPrefix="status"
            />
            <HorizontalLine customMargin={"margin-top-2"} />

            {/* Conditional rendering based on status */}
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
                    <strong>Facility Type:</strong> {crtkData.crtkEntry.type || "N/A"}
                  </p>
                  <p className="margin-bottom-1">
                    <strong>Eligibility:</strong> {crtkData.crtkEntry.eligibility || "N/A"}
                  </p>
                  <p className="margin-bottom-1">
                    <strong>Facility Status:</strong> {crtkData.crtkEntry.status || "N/A"}
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
                  <p className="margin-bottom-2">{Config.crtkTask.ehsSurveyText}</p>
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
                  <CrtkContactInfo />
                </div>
              </ResultsSectionAccordion>
            </>
          </div>
          <p className="text-base-darkest font-body-2xs padding-top-2">
            <span className="text-bold">Issuing Agency: </span> Community Right to Know, Office of
            Enforcement Policy, NJ Department of Environmental Protection
          </p>
          {crtkData && (
            <div className={"text-base-dark text-italic font-body-2xs"}>
              {templateEval(Config.crtkTask.lastUpdatedText, {
                lastUpdatedFormattedValue: dayjs(crtkData.lastUpdatedISO).format(
                  "MMMM Do, YYYY [at] ha",
                ),
              })}
            </div>
          )}
        </div>
        {status === "FOUND" && (
          <div className="bg-warning-lighter padding-2 margin-top-4 radius-lg">
            <div className="display-flex ">
              <div>
                <p className="margin-top-0 margin-bottom-1 text-accent-warm-darker text-bold">
                  {Config.crtkTask.warningTitle}
                </p>
                <p className="margin-bottom-0 text-accent-warm-darker">
                  {Config.crtkTask.warningText}
                </p>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  const FederalRequirements = (): ReactElement => {
    return (
      <div className="bg-info-lighter  padding-2 margin-top-2 radius-lg">
        <p className="margin-top-0 margin-bottom-1 text-accent-cool-more-dark text-bold">
          {Config.crtkTask.federalInfoTitle}
        </p>
        <p className="margin-bottom-1 text-accent-cool-more-dark">
          {Config.crtkTask.federalInfoText}
        </p>
        <a
          href="https://www.epa.gov/epcra"
          target="_blank"
          className="text-underline text-accent-cool-more-dark"
          rel="noreferrer"
        >
          {Config.crtkTask.federalLinkText}
        </a>
      </div>
    );
  };

  return (
    <>
      <div className="margin-bottom-4">
        <div className="text-base-darkest margin-bottom-2">
          <Content>
            {templateEval(Config.crtkTask.introText, {
              certainIndustriesLink: Config.crtkTask.certainIndustriesLink,
            })}
          </Content>
        </div>
      </div>

      {crtkData.crtkSearchResult === "NOT_FOUND" ? (
        <CrtkNotFound onSearchAgain={props.onSearchAgain} reSubmit={props.onResubmit} />
      ) : (
        CrtkFound()
      )}

      {FederalRequirements()}

      <div className="bg-base-lightest padding-4 padding-x-4 margin-x-neg-4 margin-top-3 margin-bottom-neg-4 display-flex flex-justify-end border-bottom-1px radius-bottom-lg ">
        {status === "FOUND" ? (
          <a
            href="https://www.nj.gov/dep/enforcement/opppc/crtk/crtkguidance.pdf"
            target="_blank"
            rel="noreferrer"
            className="text-no-underline"
          >
            <PrimaryButton isColor="primary" dataTestId="crtk-complete-survey">
              Complete the CRTK Survey or Exemption
            </PrimaryButton>
          </a>
        ) : (
          <PrimaryButton
            isColor="primary"
            onClick={props.onSearchAgain}
            dataTestId="crtk-search-again"
          >
            Check Again
          </PrimaryButton>
        )}
      </div>
    </>
  );
};
