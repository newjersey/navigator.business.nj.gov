import { HorizontalLine } from "@/components/HorizontalLine";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import {
  ElevatorSafetyAddress,
  ElevatorSafetyRegistrationSummary,
} from "@businessnjgovnavigator/shared/elevatorSafety";
import { Box } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  task: Task;
  summary: ElevatorSafetyRegistrationSummary;
  address: ElevatorSafetyAddress | undefined;
  onEdit: () => void;
}

export const ElevatorRegistrationStatusSummary = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const { business } = useUserData();

  const getInformationalMessageText = (): string => {
    const statuses: string[] = [];
    for (const reg of props.summary.registrations) {
      statuses.push(reg.status);
    }

    if (
      statuses.includes("Incomplete") ||
      statuses.includes("Cancelled") ||
      statuses.includes("Returned") ||
      statuses.includes("Rejected")
    ) {
      return Config.elevatorRegistrationSearchTask.registrationFoundIncompleteReturnedText;
    } else if (statuses.includes("In Review")) {
      return Config.elevatorRegistrationSearchTask.registrationInReviewMessage;
    }
    return "";
  };

  getInformationalMessageText();

  const elevatorRegistrationStatus = (
    date: string,
    deviceCount: number,
    status: string,
    index: number
  ): ReactElement => {
    return (
      <div data-testid={`registration-${index}`} key={index} className={"padding-bottom-2"}>
        <span>{Config.elevatorRegistrationSearchTask.registrationRequestDateText}</span>
        <span data-testid={`registration-${index}-date`} className={"text-bold"}>
          {date}
        </span>
        <ul>
          <li data-testid={`registration-${index}-device-count`}>
            {Config.elevatorRegistrationSearchTask.registrationDeviceCountText}
            <span className={"text-bold"}>{deviceCount}</span>
          </li>
          <li data-testid={`registration-${index}-status`}>
            {Config.elevatorRegistrationSearchTask.registrationStatusText}
            <span className={"text-bold"}>{status}</span>
          </li>
        </ul>
      </div>
    );
  };

  return (
    <>
      {props.summary.lookupStatus === "SUCCESSFUL" && (
        <div className={"padding-bottom-1"}>
          {Config.elevatorRegistrationSearchTask.registrationApplicationFoundText}
        </div>
      )}
      <Box className="bg-base-extra-light  fdc fg1 padding-y-2 radius-lg drop-shadow-xs">
        <div className={"margin-x-4"}>
          {business?.profileData?.businessName && (
            <span className={"text-bold"}>{business?.profileData?.businessName}</span>
          )}
          <br />
          {props.address && (
            <span>
              {props.address.address1}, {props.address.zipCode} NJ
              <UnStyledButton
                dataTestid={"address-edit"}
                isUnderline
                className={"padding-x-5"}
                onClick={props.onEdit}
              >
                Edit
              </UnStyledButton>
            </span>
          )}

          <div
            className={`bg-white margin-y-4 padding-x-4 padding-bottom-2 padding-top-2 radius-lg drop-shadow-xs`}
          >
            {props.summary.registrations.map((registration, index) => {
              return elevatorRegistrationStatus(
                registration.dateStarted,
                registration.deviceCount,
                registration.status,
                index
              );
            })}
            {getInformationalMessageText()}
          </div>

          <HorizontalLine />
          <div className={"padding-bottom-1"}>
            <span className={"text-bold"}>Issuing Agency:</span> Department of Community Affairs
          </div>
        </div>
      </Box>

      <UserDataErrorAlert />
    </>
  );
};
