import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Xray } from "@/components/tasks/xray/Xray";

import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import {
  loadAllRenewalCalendarEventUrlSlugs,
  loadRenewalCalendarEventByUrlSlug,
  RenewalCalendarEventUrlSlugParam,
} from "@/lib/static/loadRenewalCalendarEvents";
import { RenewalEventType } from "@/lib/types/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  renewal: RenewalEventType;
}

const RenewalCalendarEvent = (props: Props): ReactElement => {
  const renewalName = props.renewal.name;

  return (
    <>
      <NextSeo title={getNextSeoTitle(renewalName)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          {props.renewal.id === "xray-renewal" && <Xray renewal={props.renewal} />}
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<RenewalCalendarEventUrlSlugParam> => {
  const paths = loadAllRenewalCalendarEventUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: RenewalCalendarEventUrlSlugParam;
}): GetStaticPropsResult<Props> => {
  return {
    props: {
      renewal: loadRenewalCalendarEventByUrlSlug(params.renewalCalendarEventUrlSlug),
    },
  };
};

export default RenewalCalendarEvent;
