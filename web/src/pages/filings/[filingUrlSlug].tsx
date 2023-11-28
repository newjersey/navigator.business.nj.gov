import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content, ExternalLink, GreenBox } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { NavBar } from "@/components/navbar/NavBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortCalendarEventsEarliestToLatest } from "@/lib/domain-logic/filterCalendarEvents";
import { FilingUrlSlugParam, loadAllFilingUrlSlugs, loadFilingByUrlSlug } from "@/lib/static/loadFilings";
import { Filing, TaxFilingMethod } from "@/lib/types/types";
import {
  defaultDateFormat,
  parseDateWithFormat,
  TaxFilingCalendarEvent,
} from "@businessnjgovnavigator/shared";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  filing: Filing;
}

const Config = getMergedConfig();
export const taxFilingMethodMap: Record<TaxFilingMethod, string> = {
  online: Config.filingDefaults.onlineTaxFilingMethod,
  "paper-or-by-mail-only": Config.filingDefaults.paperOrMailOnlyTaxFilingMethod,
  "online-required": Config.filingDefaults.onlineRequiredTaxFilingMethod,
  "online-or-phone": Config.filingDefaults.onlineOrPhoneTaxFilingMethod,
};

export const FilingElement = (props: {
  filing: Filing;
  dueDate: string;
  preview?: boolean;
}): ReactElement => {
  return (
    <>
      <div className="minh-38">
        <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
          <div>
            <div className="padding-y-4 margin-x-4 margin-bottom-2">
              <div className="margin-bottom-2 ">
                <h1>{props.filing.name}</h1>
              </div>
              <div className="display-inline-flex ">
                <span className="text-bold">{Config.filingDefaults.beforeDueDateText.toUpperCase()}</span>{" "}
                &nbsp;{" "}
                <span data-testid="due-date">
                  {parseDateWithFormat(props.dueDate, defaultDateFormat).format("MMMM D, YYYY").toUpperCase()}
                </span>
                {props.filing.urlSlug === "annual-report" ? (
                  <div className="margin-left-1 margin-bottom-05">
                    <ArrowTooltip title={Config.filingDefaults.dueDateToolTip}>
                      <div className="fdr fac font-body-lg text-green" data-testid="due-date-tooltip">
                        <Icon>help_outline</Icon>
                      </div>
                    </ArrowTooltip>
                  </div>
                ) : (
                  <></>
                )}
                {props.filing.extension && (
                  <div className="margin-left-4">
                    <Tag backgroundColor="accent-cooler-lightest" data-testid="extension" isLowerCase>
                      {Config.filingDefaults.extensionTagText}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Content>{props.filing.contentMd}</Content>
        {props.filing.treasuryLink && (
          <div className="padding-top-1" data-testid="treasury-link">
            <ExternalLink href={props.filing.treasuryLink}>
              {Config.filingDefaults.treasuryLinkText}
            </ExternalLink>
          </div>
        )}
        {(props.filing.taxRates ||
          props.filing.filingMethod ||
          props.filing.frequency ||
          props.filing.agency === "New Jersey Division of Taxation") && (
          <GreenBox>
            {props.filing.taxRates && (
              <>
                <span className="flex" data-testid="tax-rates">
                  <Icon className="usa-icon--size-3 minw-3 margin-left-1 text-green margin-right-2">
                    attach_money
                  </Icon>
                  <Content className="">{`**${Config.filingDefaults.taxRateTitle}** &nbsp;&nbsp;${props.filing.taxRates}`}</Content>
                </span>
              </>
            )}
            {props.filing.filingMethod && (
              <span className="flex flex-row margin-top-05" data-testid="filing-method">
                <img
                  className="usa-icon--size-3 minw-3 margin-1 margin-right-2"
                  src={`/img/file-document-outline.svg`}
                  alt=""
                />
                <span className="flex flex-column margin-top-1">
                  <Content className="flex">{`**${Config.filingDefaults.filingMethod}** &nbsp;&nbsp;${
                    taxFilingMethodMap[props.filing.filingMethod]
                  }`}</Content>
                  {props.filing.filingDetails && (
                    <>
                      {" "}
                      <br />
                      <Content data-testid="filing-details">{props.filing.filingDetails}</Content>
                    </>
                  )}
                </span>
              </span>
            )}
            {props.filing.frequency && (
              <>
                <span className="flex margin-top-05">
                  <Icon className="usa-icon--size-3 minw-3 margin-1 text-green margin-right-2">event</Icon>
                  <Content className="margin-top-1">{`**${Config.filingDefaults.filingFrequency}** &nbsp;&nbsp;${props.filing.frequency}`}</Content>
                </span>
              </>
            )}
            {props.filing.agency === "New Jersey Division of Taxation" && (
              <span className="flex margin-top-05" data-testid="late-filing">
                <Icon className="usa-icon--size-3 minw-3 margin-1 text-green margin-right-2">cancel</Icon>
                <Content className="margin-top-1">{`**${Config.filingDefaults.lateFilingsTitle}** &nbsp;&nbsp;${Config.filingDefaults.lateFilingsMarkdown}`}</Content>
              </span>
            )}
          </GreenBox>
        )}

        {props.filing.additionalInfo ? (
          <>
            <Accordion data-testid="additional-info" defaultExpanded={props.preview} className="margin-top-2">
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
                aria-controls={`${Config.filingDefaults.additionalInfo
                  .toLowerCase()
                  .replaceAll(" ", "-")}-content`}
              >
                <Heading level={3} className="margin-y-3">
                  {Config.filingDefaults.additionalInfo}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{props.filing.additionalInfo}</Content>
              </AccordionDetails>
            </Accordion>
            <hr className="margin-bottom-2" />
          </>
        ) : (
          <HorizontalLine />
        )}

        {props.filing.agency && (
          <>
            <div>
              <span className="h5-styling" data-testid="agency-header">
                {Config.filingDefaults.issuingAgencyText} &nbsp;
              </span>
              <span className="h6-styling">{props.filing.agency.toString()}</span>
            </div>
          </>
        )}
        <>
          <div>
            <span className="h5-styling" data-testid="form-id-header">
              {Config.filingDefaults.formText} &nbsp;
            </span>
            <span className="h6-styling">{props.filing.id}</span>
          </div>
        </>
      </div>
      {props.filing.callToActionLink && props.filing.callToActionText && (
        <TaskCTA link={props.filing.callToActionLink} text={props.filing.callToActionText} />
      )}
    </>
  );
};

const FilingPage = (props: Props): ReactElement => {
  const { business } = useUserData();
  const matchingFiling = sortCalendarEventsEarliestToLatest(business?.taxFilingData.filings ?? []).find(
    (it: TaxFilingCalendarEvent) => it.identifier === props.filing.id
  );

  return (
    <>
      <NextSeo title={`${Config.pagesMetadata.titlePrefix} - ${props.filing.name}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <FilingElement filing={props.filing} dueDate={matchingFiling?.dueDate ?? ""} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FilingUrlSlugParam> => {
  const paths = loadAllFilingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: FilingUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      filing: loadFilingByUrlSlug(params.filingUrlSlug),
    },
  };
};

export default FilingPage;
