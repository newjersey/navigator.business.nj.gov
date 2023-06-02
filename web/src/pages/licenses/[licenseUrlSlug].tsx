import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseUrlSlugParam, loadAllLicenseUrlSlugs, loadLicenseByUrlSlug } from "@/lib/static/loadLicenses";
import { LicenseEvent } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  defaultDateFormat,
  LicenseEventSubtype,
  LookupIndustryById,
  parseDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface LicenseElementProps {
  license: LicenseEvent;
  licenseEventType: LicenseEventSubtype;
  dueDate: string;
  preview?: boolean;
  licenseName: string;
}

export const LicenseElement = (props: LicenseElementProps): ReactElement => {
  const titles: Record<LicenseEventSubtype, string> = {
    expiration: Config.licenseEventDefaults.expirationTitleLabel,
    renewal: Config.licenseEventDefaults.renewalTitleLabel,
  };
  const dateText: Record<LicenseEventSubtype, string> = {
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
                <h1>{`${props.licenseName} ${titles[props.licenseEventType]}`}</h1>
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

interface Props {
  license: LicenseEvent;
  licenseEventType: LicenseEventSubtype;
}

const LicensePage = (props: Props): ReactElement => {
  const { business } = useUserData();
  let date = parseDate(business?.licenseData?.expirationISO);
  if (props.licenseEventType === "renewal") {
    date = date.add(30, "days");
  }

  const licenseName = LookupIndustryById(business?.profileData.industryId).licenseType;

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${licenseName}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout>
          <LicenseElement
            license={props.license}
            licenseName={licenseName || ""}
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
  const licenseEventType = params.licenseUrlSlug.split("-").pop() as LicenseEventSubtype;
  return {
    props: {
      license: loadLicenseByUrlSlug(params.licenseUrlSlug),
      licenseEventType,
    },
  };
};

export default LicensePage;
