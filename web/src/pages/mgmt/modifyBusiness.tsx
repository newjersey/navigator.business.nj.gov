import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { LicenseNameTaskIdMapping } from "@businessnjgovnavigator/shared/";
import {
  generateLicenseDetails,
  getCurrentDate,
  LicenseStatus,
  licenseStatuses,
  LicenseTaskId,
  TaskProgress,
} from "@businessnjgovnavigator/shared/index";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useRouter } from "next/compat/router";
import { ReactElement, useEffect, useState } from "react";

const ModifyBusinessPage = (): ReactElement => {
  const router = useRouter();

  const { business, updateQueue } = useUserData();
  const isLicenseDataUndefined = !business?.licenseData;

  const [licenseName, setLicenseName] = useState("");
  const [licenseStatus, setLicenseStatus] = useState("");
  const [taskID, setTaskId] = useState("");

  const sortedLicenseNames = Object.keys(LicenseNameTaskIdMapping).sort();
  const sortedLicenseStatuses = licenseStatuses.sort();
  const isModifyBusinessPageDisabled = process.env.FEATURE_MODIFY_BUSINESS_PAGE !== "true";

  useEffect(() => {
    if (isModifyBusinessPageDisabled) {
      router && router.push(ROUTES.dashboard);
    }
  }, [isModifyBusinessPageDisabled, router]);

  if (isModifyBusinessPageDisabled) {
    return <LoadingPageComponent />;
  }

  return (
    <PageSkeleton showNavBar>
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <div className="padding-top-5 desktop:padding-top-0" data-testid={"modifyBusinessPage"}>
            <Heading level={1}>This page will allow you to modify license data</Heading>
            {isLicenseDataUndefined && <div>There is no existing license data for this business</div>}
            {!isLicenseDataUndefined && (
              <div>
                <div className="">The current business contains the following license data:</div>
                <div className="flex margin-top-1">
                  <div className="text-underline width-tablet">License Name</div>
                  <div className="text-underline width-card-lg">License Status</div>
                  <div className="text-underline width-mobile">Task ID</div>
                </div>
                {business?.licenseData?.licenses &&
                  Object.entries(business?.licenseData?.licenses).map(
                    ([licenseName, licenseDetails], index) => (
                      <div className="flex margin-bottom-05" key={`${licenseName}-${index}`}>
                        <div className="width-tablet">{licenseName}</div>
                        <div className="width-card-lg">{licenseDetails.licenseStatus}</div>
                        <div className="width-mobile">{LicenseNameTaskIdMapping[licenseName]}</div>
                      </div>
                    )
                  )}
              </div>
            )}

            <div className="margin-top-6">
              Note 1: to view an anytime actions reinstatement, the license status must be set to expired.
            </div>
            <div>
              Note 2: deleting the license data will reset all license search enabled task statuses to
              NOT_STARTED
            </div>
            <div>
              Note 3: to view the license details in the task, you must select an industry that has the task
              on the roadmap
            </div>

            <div className="flex margin-top-2">
              <div className="width-tablet-lg margin-right-2">
                <FormControl fullWidth>
                  <InputLabel id="license-name">License Name</InputLabel>
                  <Select
                    labelId="license-name"
                    id="license-name"
                    value={licenseName}
                    label="License Name"
                    variant="outlined"
                    onChange={(event) => {
                      setTaskId(LicenseNameTaskIdMapping[event.target.value as LicenseTaskId]);
                      setLicenseName(event.target.value);
                    }}
                  >
                    {sortedLicenseNames.map((licenseName) => {
                      return (
                        <MenuItem key={licenseName} value={licenseName}>
                          {licenseName}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </div>

              <div className="width-mobile">
                <FormControl fullWidth>
                  <InputLabel id="license-status">License Status</InputLabel>
                  <Select
                    labelId="license-status"
                    id="license-status"
                    value={licenseStatus}
                    label="License Status"
                    onChange={(event) => setLicenseStatus(event.target.value)}
                    variant="outlined"
                  >
                    {sortedLicenseStatuses.map((licenseStatus) => (
                      <MenuItem key={licenseStatus} value={licenseStatus}>
                        {licenseStatus}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </div>
            </div>
            <div className="flex margin-top-4">
              <PrimaryButton
                isColor="primary"
                onClick={() => {
                  if (!!licenseStatus && !!licenseName && !!business) {
                    updateQueue?.queueBusiness({
                      ...business,
                      taskProgress: {
                        ...business.taskProgress,
                        [taskID]: "COMPLETED",
                      },
                      licenseData: {
                        licenses: {
                          ...business?.licenseData?.licenses,
                          [licenseName]: generateLicenseDetails({
                            expirationDateISO: getCurrentDate().add(1, "month").toISOString(),
                            licenseStatus: licenseStatus as LicenseStatus,
                          }),
                        },
                        lastUpdatedISO: getCurrentDate().toISOString(),
                      },
                    });

                    setLicenseStatus("");
                    setLicenseName("");
                    setTaskId("");
                    updateQueue?.update();
                  }
                }}
              >
                Add License
              </PrimaryButton>
              <SecondaryButton
                isColor="primary"
                onClick={() => {
                  if (business?.licenseData) {
                    const taskProgress = sortedLicenseNames.reduce(
                      (acc: Record<string, TaskProgress>, curr: string): Record<string, TaskProgress> => {
                        acc[curr] = "NOT_STARTED";
                        return acc;
                      },
                      {}
                    );

                    updateQueue?.queueBusiness({
                      ...business,
                      taskProgress: {
                        ...business.taskProgress,
                        ...taskProgress,
                      },
                      licenseData: undefined,
                    });

                    setLicenseStatus("");
                    setLicenseName("");
                    setTaskId("");
                    updateQueue?.update();
                  }
                }}
              >
                Delete All License Data
              </SecondaryButton>
            </div>
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export default ModifyBusinessPage;
