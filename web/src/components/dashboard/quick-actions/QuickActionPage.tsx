import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { NavBar } from "@/components/navbar/NavBar";
import { Alert } from "@/components/njwds-extended/Alert";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { GovernmentContractorPaginator } from "@/components/tasks/government-contracting/GovernmentContractingPaginator";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getMergedConfig } from "@/contexts/configContext";
import { QuickActionLicenseReinstatement, QuickActionTask } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  quickAction: QuickActionLicenseReinstatement | QuickActionTask;
}

const Config = getMergedConfig();

export const QuickActionElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.quickAction.name}</h1>
        </div>
      </div>
      {props.quickAction.summaryDescriptionMd?.length > 0 && (
        <>
          <Content>{props.quickAction.summaryDescriptionMd}</Content>
          <HorizontalLine />
        </>
      )}
      <Content>{props.quickAction.contentMd}</Content>
      {props.quickAction.form && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.formText} &nbsp;
          </span>
          <span className="h6-styling">{props.quickAction.form}</span>
        </>
      )}
      {props.quickAction.callToActionLink && props.quickAction.callToActionText && (
        <SingleCtaLink link={props.quickAction.callToActionLink} text={props.quickAction.callToActionText} />
      )}
    </div>
  );
};

export const QuickActionGovernmentContractingElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.quickAction.name}</h1>
        </div>
        <div className="flex flex-column minh-38 bg-white">
          <Alert className="margin-x-4" variant={"warning"}>
            {"To contract with the government, you need to have your "}
            <Link href={"https://www.njconsumeraffairs.gov/ocp/Pages/hic.aspx"}>
              Home Improvement Contractor License
            </Link>
          </Alert>
          <GovernmentContractorPaginator />
        </div>
      </div>
    </div>
  );
};

export const QuickActionPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={`${Config.pagesMetadata.titlePrefix} - ${props.quickAction.name}`} />
      <PageSkeleton>
        <NavBar showSidebar={true} hideMiniRoadmap={true} />
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          {rswitch(props.quickAction.filename, {
            "government-contracting": (
              <QuickActionGovernmentContractingElement quickAction={props.quickAction} />
            ),
            default: <QuickActionElement quickAction={props.quickAction} />,
          })}
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};
