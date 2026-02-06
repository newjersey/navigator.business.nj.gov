import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content, ExternalLink } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { Heading } from "@/components/njwds-extended/Heading";
import { Tag } from "@/components/njwds-extended/Tag";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortCalendarEventsEarliestToLatest } from "@/lib/domain-logic/filterCalendarEvents";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";

import {
  defaultDateFormat,
  parseDateWithFormat,
  TaxFilingCalendarEvent,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  FilingUrlSlugParameter,
  loadAllFilingUrlSlugs,
  loadFilingByUrlSlug,
} from "@businessnjgovnavigator/shared/static";
import { Filing, TaxFilingMethod } from "@businessnjgovnavigator/shared/types";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  filing: Filing;
}

export const FilingElement = (props: {
  filing: Filing;
  dueDate: string;
  preview?: boolean;
}): ReactElement => {
  const Config = getMergedConfig();
  const taxFilingMethodMap: Record<TaxFilingMethod, string> = {
    online: Config.filingDefaults.onlineTaxFilingMethod,
    "paper-or-by-mail-only": Config.filingDefaults.paperOrMailOnlyTaxFilingMethod,
    "online-required": Config.filingDefaults.onlineRequiredTaxFilingMethod,
    "online-or-phone": Config.filingDefaults.onlineOrPhoneTaxFilingMethod,
  };
  return (
    <>
      <div className="min-height-38rem">
        <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
          <div>
            <div className="padding-y-4 margin-x-4 margin-bottom-2">
              <div className="margin-bottom-2 ">
                <h1>{props.filing.name}</h1>
              </div>
              <div className="display-inline-flex ">
                <span className="text-bold">
                  {Config.filingDefaults.beforeDueDateText.toUpperCase()}
                </span>{" "}
                &nbsp;{" "}
                <span data-testid="due-date">
                  {parseDateWithFormat(props.dueDate, defaultDateFormat)
                    .format("MMMM D, YYYY")
                    .toUpperCase()}
                </span>
                {props.filing.urlSlug === "annual-report" ? (
                  <div className="margin-left-1 margin-bottom-05">
                    <ArrowTooltip title={Config.filingDefaults.dueDateToolTip}>
                      <div
                        className="fdr fac font-body-lg text-green"
                        data-testid="due-date-tooltip"
                      >
                        <Icon iconName="help_outline" />
                      </div>
                    </ArrowTooltip>
                  </div>
                ) : (
                  <></>
                )}
                {props.filing.extension && (
                  <div className="margin-left-4">
                    <Tag
                      backgroundColor="accent-cooler-lightest"
                      data-testid="extension"
                      isLowerCase
                    >
                      {Config.filingDefaults.extensionTagText}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Content>{props.filing.summaryDescriptionMd}</Content>
        <HorizontalLine />
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
          <LargeCallout calloutType="conditional" showHeader={false}>
            <div className="flex flex-column">
              {props.filing.taxRates && (
                <>
                  <span className="flex margin-1" data-testid="tax-rates">
                    <Icon
                      className="usa-icon--size-3 minw-3 text-green margin-right-2"
                      iconName="attach_money"
                    />
                    <Content>{`**${Config.filingDefaults.taxRateTitle}** &nbsp;&nbsp;${props.filing.taxRates}`}</Content>
                  </span>
                </>
              )}
              {props.filing.filingMethod && (
                <span className="flex flex-row margin-1 " data-testid="filing-method">
                  <img
                    className="usa-icon--size-3 minw-3 margin-right-2"
                    src={`/img/file-document-outline.svg`}
                    alt=""
                  />
                  <span className="flex flex-column ">
                    <Content className="flex">{`**${
                      Config.filingDefaults.filingMethod
                    }** &nbsp;&nbsp;${taxFilingMethodMap[props.filing.filingMethod]}`}</Content>
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
                  <span className="flex margin-1">
                    <Icon
                      className="usa-icon--size-3 minw-3 text-green margin-right-2"
                      iconName="event"
                    />
                    <Content>{`**${Config.filingDefaults.filingFrequency}** &nbsp;&nbsp;${props.filing.frequency}`}</Content>
                  </span>
                </>
              )}
              {props.filing.agency === "New Jersey Division of Taxation" && (
                <span className="flex margin-1" data-testid="late-filing">
                  <Icon
                    className="usa-icon--size-3 minw-3 text-green margin-right-2"
                    iconName="cancel"
                  />
                  <Content>{`**${Config.filingDefaults.lateFilingsTitle}** &nbsp;&nbsp;${Config.filingDefaults.lateFilingsMarkdown}`}</Content>
                </span>
              )}
            </div>
          </LargeCallout>
        )}

        {props.filing.additionalInfo ? (
          <>
            <Accordion
              data-testid="additional-info"
              defaultExpanded={props.preview}
              className="margin-top-2"
            >
              <AccordionSummary
                expandIcon={
                  <Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />
                }
                aria-controls={`${Config.filingDefaults.additionalInfo
                  .toLowerCase()
                  .replaceAll(" ", "-")}-content`}
              >
                <Heading level={3} className="margin-0-override">
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
        <SingleCtaLink link={props.filing.callToActionLink} text={props.filing.callToActionText} />
      )}
    </>
  );
};

const FilingPage = (props: Props): ReactElement => {
  const { business } = useUserData();
  const matchingFiling = sortCalendarEventsEarliestToLatest(
    business?.taxFilingData.filings ?? [],
  ).find((it: TaxFilingCalendarEvent) => it.identifier === props.filing.id);

  return (
    <>
      <NextSeo title={getNextSeoTitle(props.filing.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <FilingElement filing={props.filing} dueDate={matchingFiling?.dueDate ?? ""} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FilingUrlSlugParameter> => {
  const paths = loadAllFilingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: FilingUrlSlugParameter;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      filing: loadFilingByUrlSlug(params.filingUrlSlug),
    },
  };
};

export default FilingPage;
