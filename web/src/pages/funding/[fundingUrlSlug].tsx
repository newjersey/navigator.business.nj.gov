import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { templateEval } from "@/lib/utils/helpers";

import { LookupFundingAgencyById } from "@businessnjgovnavigator/shared/";
import { Locale, LocaleContext } from "@businessnjgovnavigator/shared/contexts/localeContext";
import {
  FundingUrlSlugParameter,
  loadAllFundingUrlSlugs,
  loadFundingByUrlSlug,
} from "@businessnjgovnavigator/shared/static";
import { Funding } from "@businessnjgovnavigator/shared/types";
import { useMediaQuery } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement, useContext } from "react";

interface Props {
  fundings: Record<Locale, Funding>;
}

export const FundingElement = (props: { funding: Funding }): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const { Config } = useConfig();

  const { business } = useUserData();
  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = business?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
    return templateEval(contentMd, { naicsCode: naicsTemplateValue });
  };

  return (
    <>
      <div className="min-height-38rem">
        <div className="margin-bottom-2">
          <h1>{props.funding.name}</h1>
          <div>
            {props.funding.dueDate && (
              <span className="margin-right-2 border padding-x-1 border-base text-base">
                DUE: {props.funding.dueDate}{" "}
              </span>
            )}
            {!props.funding.dueDate && props.funding.status && (
              <>
                {isLargeScreen ? (
                  <span className="text-base">{props.funding.status.toUpperCase()}</span>
                ) : (
                  <div className="text-base margin-top-1">{props.funding.status.toUpperCase()}</div>
                )}
              </>
            )}
          </div>
        </div>
        <Content>{props.funding.summaryDescriptionMd}</Content>
        <HorizontalLine />
        {props.funding.contentMd && <Content>{addNaicsCodeData(props.funding.contentMd)}</Content>}
        {props.funding.agency && props.funding.agency.length > 0 ? (
          <>
            <HorizontalLine />
            <div>
              <span
                className="h5-styling"
                data-testid="funding-agency-header"
              >{`${Config.fundingDefaults.issuingAgencyText}: `}</span>
              <span className="h6-styling">
                {props.funding.agency
                  .map(LookupFundingAgencyById)
                  .map((it) => it.name)
                  .join(", ")}
              </span>
            </div>
          </>
        ) : null}
      </div>
      {props.funding.callToActionLink && props.funding.callToActionText && (
        <SingleCtaLink
          link={props.funding.callToActionLink}
          text={props.funding.callToActionText}
        />
      )}
    </>
  );
};

const FundingPage = (props: Props): ReactElement => {
  const { locale } = useContext(LocaleContext);
  const funding = props.fundings[locale];

  return (
    <>
      <NextSeo title={getNextSeoTitle(funding.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <FundingElement funding={funding} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FundingUrlSlugParameter> => {
  const paths = loadAllFundingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: FundingUrlSlugParameter;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      fundings: {
        en: loadFundingByUrlSlug(params.fundingUrlSlug, "en"),
        "es-LA": loadFundingByUrlSlug(params.fundingUrlSlug, "es-LA"),
      },
    },
  };
};

export default FundingPage;
