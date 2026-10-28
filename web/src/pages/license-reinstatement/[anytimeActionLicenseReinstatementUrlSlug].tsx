import {
  type AnytimeActionLicenseReinstatementUrlSlugParameter,
  loadAllAnytimeActionLicenseReinstatementsUrlSlugs,
  loadAnytimeActionLicenseReinstatementsByUrlSlug,
} from "@businessnjgovnavigator/shared/static";
import type { AnytimeActionLicenseReinstatement } from "@businessnjgovnavigator/shared/types";
import type { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import type { ReactElement } from "react";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { AnytimeActionLicenseReinstatementElement } from "@/components/tasks/anytime-action/AnytimeActionLicenseReinstatementElement";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";

interface Props {
  anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement;
}

const AnytimeActionLicenseReinstatementPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.anytimeActionLicenseReinstatement.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <AnytimeActionLicenseReinstatementElement
            anytimeActionLicenseReinstatement={props.anytimeActionLicenseReinstatement}
          />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths =
  (): GetStaticPathsResult<AnytimeActionLicenseReinstatementUrlSlugParameter> => {
    const paths = loadAllAnytimeActionLicenseReinstatementsUrlSlugs();
    return {
      paths,
      fallback: false,
    };
  };

export const getStaticProps = ({
  params,
}: {
  params: AnytimeActionLicenseReinstatementUrlSlugParameter;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      anytimeActionLicenseReinstatement: loadAnytimeActionLicenseReinstatementsByUrlSlug(
        params.anytimeActionLicenseReinstatementUrlSlug,
      ),
    },
  };
};

export default AnytimeActionLicenseReinstatementPage;
