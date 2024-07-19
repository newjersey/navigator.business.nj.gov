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
import { FundingUrlSlugParam, loadAllFundingUrlSlugs, loadFundingByUrlSlug } from "@/lib/static/loadFundings";
import { Funding } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { LookupFundingAgencyById } from "@businessnjgovnavigator/shared/fundingAgency";
import { useMediaQuery } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  funding: Funding;
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
      <div className="minh-38">
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
        <SingleCtaLink link={props.funding.callToActionLink} text={props.funding.callToActionText} />
      )}
    </>
  );
};

const FundingPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.funding.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <FundingElement funding={props.funding} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<FundingUrlSlugParam> => {
  const paths = loadAllFundingUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: FundingUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      funding: loadFundingByUrlSlug(params.fundingUrlSlug),
    },
  };
};

export default FundingPage;
