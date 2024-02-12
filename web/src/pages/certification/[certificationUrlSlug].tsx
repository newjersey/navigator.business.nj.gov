import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { NavBar } from "@/components/navbar/NavBar";
import { Heading } from "@/components/njwds-extended/Heading";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import {
  CertificationUrlSlugParam,
  loadAllCertificationUrlSlugs,
  loadCertificationByUrlSlug,
} from "@/lib/static/loadCertifications";
import { Certification } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  certification: Certification;
}

export const CertificationElement = (props: { certification: Certification }): ReactElement => {
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
          {props.certification.name && <Heading level={1}>{props.certification.name}</Heading>}
        </div>
        {props.certification.summaryDescriptionMd && (
          <Content>{props.certification.summaryDescriptionMd}</Content>
        )}
        <HorizontalLine />
        {props.certification.contentMd && (
          <Content>{addNaicsCodeData(props.certification.contentMd)}</Content>
        )}
      </div>
      {props.certification.callToActionLink && props.certification.callToActionText && (
        <SingleCtaLink
          link={props.certification.callToActionLink}
          text={props.certification.callToActionText}
        />
      )}
    </>
  );
};

const CertificationPage = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <>
      {props.certification.name && (
        <NextSeo title={`${Config.pagesMetadata.titlePrefix} - ${props.certification.name}`} />
      )}
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <CertificationElement certification={props.certification} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<CertificationUrlSlugParam> => {
  const paths = loadAllCertificationUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: CertificationUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      certification: loadCertificationByUrlSlug(params.certificationUrlSlug),
    },
  };
};

export default CertificationPage;
