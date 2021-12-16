import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { Tag } from "@/components/njwds-extended/Tag";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { FilingDefaults } from "@/display-defaults/FilingDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  FilingUrlSlugParam,
  loadAllFilingUrlSlugs,
  loadFilingByUrlSlug,
  loadFilingsReferences,
} from "@/lib/static/loadFilings";
import { Filing, FilingReference } from "@/lib/types/types";
import dayjs from "dayjs";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  filing: Filing;
  filingsReferences: Record<string, FilingReference>;
}

const FilingPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  const { userData } = useUserData();
  const matchingFiling = userData?.taxFilingData.filings.find((it) => it.identifier === props.filing.id);
  const dueDate = matchingFiling ? dayjs(matchingFiling.dueDate).format("MM/DD/YYYY") : "";

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.filing.name}`} />
      <PageSkeleton>
        <NavBar sideBarPageLayout={true} filingsReferences={props.filingsReferences} />
        <SidebarPageLayout filingsReferences={props.filingsReferences}>
          <div className="flex flex-column space-between minh-37">
            <div>
              <div
                role="heading"
                aria-level={1}
                className="margin-top-0 margin-bottom-2 h2-element-usa-prose-override"
              >
                {props.filing.name}
              </div>
              <div className="margin-bottom-4" data-testid="due-date">
                <Tag tagVariant="baseDark" bold={true}>
                  {FilingDefaults.tagContentBeforeDueDate} {dueDate}
                </Tag>
              </div>
              <Content>{props.filing.contentMd}</Content>
            </div>
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
