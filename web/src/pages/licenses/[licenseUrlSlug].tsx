import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { LicenseUrlSlugParam, loadAllLicenseUrlSlugs, loadLicenseByUrlSlug } from "@/lib/static/loadLicenses";
import { LicenseEventType } from "@/lib/types/types";
import {
  LicenseEventSubtype,
  defaultDateFormat,
  parseDate,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface LicenseElementProps {
  license: LicenseEventType;
  licenseEventType: LicenseEventSubtype;
  dueDate: string;
  licenseName: string;
}

export const LicenseElement = (props: LicenseElementProps): ReactElement => {
  const { Config } = useConfig();

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
                <span className="text-bold">{dateText[props.licenseEventType].toUpperCase()}</span> &nbsp;
                <span data-testid="due-date">
                  {parseDateWithFormat(props.dueDate, defaultDateFormat).format("MMMM D, YYYY").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="h6-styling">
          <Content>{Config.licenseEventDefaults.disclaimerMarkdown}</Content>
        </div>
        <HorizontalLine />
        <Content>{props.license.contentMd}</Content>
      </div>
      {props.license.callToActionLink && props.license.callToActionText && (
        <SingleCtaLink link={props.license.callToActionLink} text={props.license.callToActionText} />
      )}
    </>
  );
};

interface Props {
  license: LicenseEventType;
  licenseEventType: LicenseEventSubtype;
}

const LicensePage = (
  props: Props
): // props: Props
ReactElement => {
  const { business } = useUserData();
  const licenseName = props.license.licenseName;

  const expirationDateISO = business?.licenseData?.licenses?.[licenseName]?.expirationDateISO;

  let date = parseDate(expirationDateISO);
  if (props.licenseEventType === "renewal") {
    date = date.add(30, "days");
  }

  return (
    <>
      <NextSeo title={getNextSeoTitle(licenseName)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout>
          <></>
          <LicenseElement
            license={props.license}
            licenseName={licenseName}
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
