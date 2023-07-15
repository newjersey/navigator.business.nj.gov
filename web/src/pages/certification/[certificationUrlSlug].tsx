import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
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
          <h1>{props.certification.name}</h1>
        </div>
        <Content>{addNaicsCodeData(props.certification.contentMd)}</Content>
      </div>
      <TaskCTA link={props.certification.callToActionLink} text={props.certification.callToActionText} />
    </>
  );
};

const CertificationPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.certification.name}`} />
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
