import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Xray } from "@/components/xray/Xray";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { loadXrayRenewalCalendarEvent } from "@businessnjgovnavigator/shared/static";
import { XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";

import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  renewal: XrayRenewalCalendarEventType;
}

const XrayRenewalCalendarEvent = (props: Props): ReactElement => {
  const renewalName = props.renewal.name;

  return (
    <>
      <NextSeo title={getNextSeoTitle(renewalName)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <Xray renewal={props.renewal} />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  return {
    props: {
      renewal: loadXrayRenewalCalendarEvent(),
    },
  };
};

export default XrayRenewalCalendarEvent;
