import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import {
  CertificationUrlSlugParam,
  loadAllCertificationUrlSlugs,
  loadCertificationByUrlSlug,
} from "@/lib/static/loadCertifications";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, OperateReference } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  certification: Certification;
  operateReferences: Record<string, OperateReference>;
}

export const CertificationElement = (props: { certification: Certification }): ReactElement => {
  return (
    <>
      <div className="minh-38">
        <div className="margin-bottom-2">
          <h1>{props.certification.name}</h1>
        </div>
        <Content>{props.certification.contentMd}</Content>
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
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <TaskSidebarPageLayout operateReferences={props.operateReferences}>
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
      operateReferences: loadOperateReferences(),
    },
  };
};

export default CertificationPage;
