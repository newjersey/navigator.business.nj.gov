import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { Alert } from "@/components/njwds-extended/Alert";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { GovernmentContractorPaginator } from "@/components/tasks/government-contracting/GovernmentContractingPaginator";
import { getMergedConfig } from "@/contexts/configContext";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
}

const Config = getMergedConfig();

export const AnytimeActionElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-y-4 margin-x-4 margin-bottom-2">
          <h1>{props.anytimeAction.name}</h1>
        </div>
      </div>
      {props.anytimeAction.summaryDescriptionMd?.length > 0 && (
        <>
          <Content>{props.anytimeAction.summaryDescriptionMd}</Content>
          <HorizontalLine />
        </>
      )}
      <Content>{props.anytimeAction.contentMd}</Content>
      {props.anytimeAction.form && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.formText} &nbsp;
          </span>
          <span className="h6-styling">{props.anytimeAction.form}</span>
        </>
      )}
      {props.anytimeAction.callToActionLink && props.anytimeAction.callToActionText && (
        <SingleCtaLink
          link={props.anytimeAction.callToActionLink}
          text={props.anytimeAction.callToActionText}
        />
      )}
    </div>
  );
};

export const AnytimeActionGovernmentContractingElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.anytimeAction.name}</h1>
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

export const AnytimeActionPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.anytimeAction.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          {rswitch(props.anytimeAction.filename, {
            "government-contracting": (
              <AnytimeActionGovernmentContractingElement anytimeAction={props.anytimeAction} />
            ),
            default: <AnytimeActionElement anytimeAction={props.anytimeAction} />,
          })}
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};
