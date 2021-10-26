import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import {
  loadAllFilingUrlSlugs,
  loadFilingByUrlSlug,
  FilingUrlSlugParam,
  loadFilingsReferences,
} from "@/lib/static/loadFilings";
import { Filing, FilingReference } from "@/lib/types/types";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { Content } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { TaskCTA } from "@/components/TaskCTA";
import { NextSeo } from "next-seo";
import { NavBar } from "@/components/navbar/NavBar";
import { useUserData } from "@/lib/data-hooks/useUserData";
import dayjs from "dayjs";
import { FilingDefaults } from "@/display-content/FilingDefaults";

interface Props {
  filing: Filing;
  filingsReferences: Record<string, FilingReference>;
}

const FilingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  const { userData } = useUserData();
  const dueDate = dayjs(userData?.taxFilings[0].dueDate).format("MM/DD/YYYY");

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.filing.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} filingsReferences={props.filingsReferences} />
        <SidebarPageLayout filingsReferences={props.filingsReferences}>
          <div className="margin-3">
            <div
              role="heading"
              aria-level={1}
              className="margin-top-0 margin-bottom-2 h2-element-usa-prose-override"
            >
              {props.filing.name}
            </div>
            <div className="margin-bottom-4" data-testid="due-date">
              <span className="usa-tag bg-white border text-gray-70 text-bold">
                {FilingDefaults.tagContentBeforeDueDate} <span className="text-normal">{dueDate}</span>
              </span>
            </div>

            <Content>{props.filing.contentMd}</Content>
            <TaskCTA link={props.filing.callToActionLink} text={props.filing.callToActionText} />
          </div>
        </SidebarPageLayout>
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
      filingsReferences: loadFilingsReferences(),
    },
  };
};

export default FilingPage;
