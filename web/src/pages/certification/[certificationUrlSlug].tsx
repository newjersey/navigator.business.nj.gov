import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { useAuthAlertPage } from "@/lib/auth/useAuthProtectedPage";
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
      <div className="flex flex-column space-between minh-37">
        <div>
          <div className="margin-bottom-2">
            <h1>{props.certification.name}</h1>
          </div>
          <Content>{props.certification.contentMd}</Content>
        </div>
        <TaskCTA link={props.certification.callToActionLink} text={props.certification.callToActionText} />
      </div>
    </>
  );
};

const CertificationPage = (props: Props): ReactElement => {
  useAuthAlertPage();

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.certification.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <SidebarPageLayout operateReferences={props.operateReferences}>
          <CertificationElement certification={props.certification} />
        </SidebarPageLayout>
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
