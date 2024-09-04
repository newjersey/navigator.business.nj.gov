import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { AnytimeActionLicenseReinstatementElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseReinstatementElement";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import {
  AnytimeActionLicenseRenewalUrlSlugParam,
  loadAllAnytimeActionLicenseRenewalsUrlSlugs,
  loadAnytimeActionLicenseRenewalsByUrlSlug,
} from "@/lib/static/loadAnytimeActionLicenseRenewals";
import { AnytimeActionLicenseRenewal } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  anytimeActionLicenseRenewal: AnytimeActionLicenseRenewal;
}

const AnytimeActionLicenseRenewalPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.anytimeActionLicenseRenewal.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <AnytimeActionLicenseReinstatementElement
            anytimeActionLicenseReinstatement={props.anytimeActionLicenseRenewal}
          />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<AnytimeActionLicenseRenewalUrlSlugParam> => {
  const paths = loadAllAnytimeActionLicenseRenewalsUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionLicenseRenewalUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionLicenseRenewal: loadAnytimeActionLicenseRenewalsByUrlSlug(
        params.anytimeActionLicenseRenewalUrlSlug
      ),
    },
  };
};

export default AnytimeActionLicenseRenewalPage;
