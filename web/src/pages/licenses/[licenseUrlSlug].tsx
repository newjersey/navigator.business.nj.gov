import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseUrlSlugParam, loadAllLicenseUrlSlugs, loadLicenseByUrlSlug } from "@/lib/static/loadLicenses";
import { LicenseEvent, LicenseEventType } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { defaultDateFormat, parseDate, parseDateWithFormat } from "@businessnjgovnavigator/shared";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  license: LicenseEvent;
  licenseEventType: LicenseEventType;
}

export const LicenseElement = (props: {
  license: LicenseEvent;
  licenseEventType: LicenseEventType;
  dueDate: string;
  preview?: boolean;
}): ReactElement => {
  const titles: Record<LicenseEventType, string> = {
    expiration: Config.licenseEventDefaults.expirationTitleLabel,
    renewal: Config.licenseEventDefaults.renewalTitleLabel,
  };
  const dateText: Record<LicenseEventType, string> = {
    expiration: Config.licenseEventDefaults.beforeExpirationDateText,
    renewal: Config.licenseEventDefaults.beforeRenewalDateText,
  };
  return (
    <>
      <div className="minh-38">
        <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
          <div>
            <div className="padding-y-4 margin-x-4 margin-bottom-2">
              <div className="margin-bottom-2 ">
                <h1>{`${props.license.title} ${titles[props.licenseEventType]}`}</h1>
              </div>
              <div className="display-inline-flex ">
                <span className="text-bold">{dateText[props.licenseEventType].toUpperCase()}</span> &nbsp;{" "}
                <span data-testid="due-date">
                  {parseDateWithFormat(props.dueDate, defaultDateFormat).format("MMMM D, YYYY").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Content>{props.license.contentMd}</Content>

        <hr className="margin-y-3" />
        <div className="h6-styling">
          <span className="text-base-dark">
            <Content>{Config.licenseEventDefaults.disclaimerMarkdown}</Content>
          </span>
        </div>
      </div>
      {props.license.callToActionLink && props.license.callToActionText && (
        <TaskCTA link={props.license.callToActionLink} text={props.license.callToActionText} />
      )}
    </>
  );
};

const LicensePage = (props: Props): ReactElement => {
  const { userData } = useUserData();
  let date = parseDate(userData?.licenseData?.expirationISO);
  props.licenseEventType === "renewal" ? (date = date.add(30, "days")) : undefined;
  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.license.title}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout>
          <LicenseElement
            license={props.license}
            licenseEventType={props.licenseEventType}
            dueDate={date.format(defaultDateFormat)}
          />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<LicenseUrlSlugParam> => {
  const paths = loadAllLicenseUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: LicenseUrlSlugParam }): GetStaticPropsResult<Props> => {
  const licenseEventType = params.licenseUrlSlug.split("-").pop() as LicenseEventType;
  return {
    props: {
      license: loadLicenseByUrlSlug(params.licenseUrlSlug),
      licenseEventType,
    },
  };
};

export default LicensePage;
