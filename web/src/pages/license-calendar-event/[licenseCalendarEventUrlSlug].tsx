import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { LicenseElement } from "@/components/tasks/license-calendar-event/LicenseCalendarEventElement";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";

import { LicenseEventSubtype } from "@businessnjgovnavigator/shared";
import {
  LicenseCalendarEventUrlSlugParameter,
  loadAllLicenseCalendarEventUrlSlugs,
  loadLicenseCalendarEventByUrlSlug,
} from "@businessnjgovnavigator/shared/static";
import { LicenseEventType } from "@businessnjgovnavigator/shared/types";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  license: LicenseEventType;
  licenseEventType: LicenseEventSubtype;
}

const LicenseCalendarEventPage = (props: Props): ReactElement => {
  const licenseName = props.license.licenseName;

  return (
    <>
      <NextSeo title={getNextSeoTitle(licenseName)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <LicenseElement
            license={props.license}
            licenseName={licenseName}
            licenseEventType={props.licenseEventType}
          />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<LicenseCalendarEventUrlSlugParameter> => {
  const paths = loadAllLicenseCalendarEventUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({
  params,
}: {
  params: LicenseCalendarEventUrlSlugParameter;
}): GetStaticPropsResult<Props> => {
  const licenseEventType = params.licenseCalendarEventUrlSlug
    .split("-")
    .pop() as LicenseEventSubtype;
  return {
    props: {
      license: loadLicenseCalendarEventByUrlSlug(params.licenseCalendarEventUrlSlug),
      licenseEventType,
    },
  };
};

export default LicenseCalendarEventPage;
