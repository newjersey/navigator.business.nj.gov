import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { Tag } from "@/components/njwds-extended/Tag";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { FilingDefaults } from "@/display-defaults/FilingDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FilingUrlSlugParam, loadAllFilingUrlSlugs, loadFilingByUrlSlug } from "@/lib/static/loadFilings";
import { loadOperateReferences } from "@/lib/static/loadOperateReferences";
import { Filing, OperateReference } from "@/lib/types/types";
import dayjs from "dayjs";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import React, { ReactElement } from "react";

interface Props {
  filing: Filing;
  operateReferences: Record<string, OperateReference>;
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
        <NavBar sideBarPageLayout={true} operateReferences={props.operateReferences} />
        <SidebarPageLayout operateReferences={props.operateReferences}>
          <div className="flex flex-column space-between minh-37">
            <div>
              <div className="margin-bottom-2">
                <h1>{props.filing.name}</h1>
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
      operateReferences: loadOperateReferences(),
    },
  };
};

export default FilingPage;
