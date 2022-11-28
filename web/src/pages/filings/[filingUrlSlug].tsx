import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content, ExternalLink, GreenBox } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortFilterFilingsWithinAYear } from "@/lib/domain-logic/filterFilings";
import { FilingUrlSlugParam, loadAllFilingUrlSlugs, loadFilingByUrlSlug } from "@/lib/static/loadFilings";
import { Filing, TaxFilingMethod } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { defaultDateFormat, parseDateWithFormat, TaxFiling } from "@businessnjgovnavigator/shared";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  filing: Filing;
}

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
        <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 padding-top-105 margin-bottom-4">
          <div className="margin-bottom-2 margin-x-4">
            <h1>{props.filing.name}</h1>
          </div>
          <div className="display-inline-flex margin-bottom-4 margin-x-4">
            <span className="text-bold">{Config.filingDefaults.beforeDueDateText.toUpperCase()}</span> &nbsp;{" "}
            <span data-testid="due-date">
              {parseDateWithFormat(props.dueDate, defaultDateFormat).format("MMMM D, YYYY").toUpperCase()}
            </span>
            <ArrowTooltip title={Config.filingDefaults.dueDateToolTip}>
              <div
                className="fdr fac margin-left-1 margin-bottom-05 font-body-lg text-green"
                data-testid="due-date-tooltip"
              >
                <Icon>help_outline</Icon>
              </div>
            </ArrowTooltip>
            {props.filing.extension && (
              <div className="margin-left-4">
                <Tag backgroundColor="accent-cooler-lightest" data-testid="extension" isLowerCase>
                  {Config.filingDefaults.extensionTagText}
                </Tag>
              </div>
            )}
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
          props.filing.agency == "New Jersey Division of Taxation") && (
          <GreenBox>
            {props.filing.taxRates && (
              <>
                <span className="flex" data-testid="tax-rates">
                  <Icon className="usa-icon--size-3 minw-3 margin-1 text-green margin-right-2">
                    attach_money
                  </Icon>
                  <Content className="margin-top-1">{`**${Config.filingDefaults.taxRateTitle}** &nbsp;&nbsp;${props.filing.taxRates}`}</Content>
                </span>
                <br />
              </>
            )}
            {props.filing.filingMethod && (
              <span className="flex flex-row" data-testid="filing-method">
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

                  <br />
                </span>
              </span>
            )}
            {props.filing.frequency && (
              <>
                <span className="flex">
                  <Icon className="usa-icon--size-3 minw-3 margin-1 text-green margin-right-2">event</Icon>
                  <Content className="margin-top-1">{`**${Config.filingDefaults.filingFrequency}** &nbsp;&nbsp;${props.filing.frequency}`}</Content>
                </span>
                <br />
              </>
            )}
            {props.filing.agency == "New Jersey Division of Taxation" && (
              <span className="flex" data-testid="late-filing">
                <Icon className="usa-icon--size-3 minw-3 margin-1 text-green margin-right-2">cancel</Icon>
                <Content className="margin-top-1">{`**${Config.filingDefaults.lateFilingsTitle}** &nbsp;&nbsp;${Config.filingDefaults.lateFilingsMarkdown}`}</Content>
              </span>
            )}
          </GreenBox>
        )}

        {props.filing.additionalInfo ? (
          <>
            <Accordion
              data-testid="additional-info"
              elevation={0}
              defaultExpanded={props.preview}
              className="margin-top-2"
            >
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
                aria-controls={`${Config.filingDefaults.additionalInfo
                  .toLowerCase()
                  .replaceAll(" ", "-")}-content`}
              >
                <h3 className="margin-y-3">{Config.filingDefaults.additionalInfo}</h3>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{props.filing.additionalInfo}</Content>
              </AccordionDetails>
            </Accordion>
            <hr className="margin-bottom-2" />
          </>
        ) : (
          <hr className="margin-y-3" />
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
  const { userData } = useUserData();
  const matchingFiling = sortFilterFilingsWithinAYear(userData?.taxFilingData.filings ?? []).find(
    (it: TaxFiling) => {
      return it.identifier === props.filing.id;
    }
  );

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.filing.name}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout>
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
