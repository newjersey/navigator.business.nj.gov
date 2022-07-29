import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsTemplateValue } from "@/lib/domain-logic/getNaicsTemplateValue";
import {
  CertificationUrlSlugParam,
  loadAllCertificationUrlSlugs,
  loadCertificationByUrlSlug,
} from "@/lib/static/loadCertifications";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Certification, OperateReference } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  certification: Certification;
  operateReferences: Record<string, OperateReference>;
}

export const CertificationElement = (props: { certification: Certification }): ReactElement => {
  const { userData } = useUserData();

  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = userData?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsTemplateValue(naicsCode);
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
        <NavBar sidebarPageLayout={true} operateReferences={props.operateReferences} />
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
