import { HorizontalLine } from "@/components/HorizontalLine";
import { UserDataErrorAlert } from "@/components/UserDataErrorAlert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { toProperCase } from "@businessnjgovnavigator/shared";
import { parseDate } from "@businessnjgovnavigator/shared/dateHelpers";
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

type CardDisplayDetails = {
  headerColor: string;
  bodyColor: string;
  icon: string;
  iconTextColor: string;
};

export const ElevatorRegistrationStatusSummary = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  const { business } = useUserData();

  const getDetailsForRegistrationCard = (status: string): CardDisplayDetails => {
    switch (status) {
      case "Approved":
        return {
          headerColor: "bg-success-darker",
          bodyColor: "bg-success-lighter",
          icon: "check_circle",
          iconTextColor: "text-success-darker",
        };
      case "Rejected":
      case "Returned":
      case "Incomplete":
        return {
          headerColor: "bg-error",
          bodyColor: "bg-error-extra-light",
          icon: "cancel",
          iconTextColor: "text-error-darker",
        };
      default:
        return {
          headerColor: "bg-info-dark",
          bodyColor: "bg-info-extra-light",
          icon: "",
          iconTextColor: "",
        };
    }
  };

  const getInformationalMessageText = (status: string): string => {
    switch (status) {
      case "In Review":
        return Config.elevatorRegistrationSearchTask.informationalInReview;
      case "Incomplete":
        return Config.elevatorRegistrationSearchTask.informationalIncomplete;
      case "Rejected":
        return Config.elevatorRegistrationSearchTask.informationalRejected;
      case "Returned":
        return Config.elevatorRegistrationSearchTask.informationalReturned;
      default:
        return "";
    }
  };

  const elevatorRegistrationStatusCard = (
    date: string,
    deviceCount: number,
    status: string,
    index: number
  ): ReactElement<any> => {
    const details = getDetailsForRegistrationCard(status);
    const formattedDate = parseDate(date).format("MMMM d, YYYY");
    const informationalMessage = getInformationalMessageText(status);

    const getIconForRegistrationCard = (): ReactElement<any> => {
      switch (status) {
        case "In Review":
          return <img src={`/img/access_time_filled.svg`} alt="" style={{ width: "17px", height: "17px" }} />;
        default:
          return (
            <>
              <Icon className={`inline-icon ${details.iconTextColor}`} iconName={details.icon} />
            </>
          );
      }
    };

    return (
      <div
        data-testid={`registration-${index}`}
        key={index}
        className={"bg-white margin-y-4 padding-x-4 padding-y-4 radius-lg drop-shadow-xs"}
      >
        <span className={"text-bold"}>
          <span>{Config.elevatorRegistrationSearchTask.registrationRequestDateText}</span>
          <span data-testid={`registration-${index}-date`}>{formattedDate}</span>
        </span>

        <HorizontalLine />
        <span data-testid={`registration-${index}-device-count`}>
          {Config.elevatorRegistrationSearchTask.registrationDeviceCountText}
          <span className={"text-bold"}>{deviceCount}</span>
        </span>
        <Box className={`${details.headerColor} fdc fg1 radius-lg margin-top-2 drop-shadow-xs`}>
          <span className={"padding-left-2 padding-y-1 text-white"}>Application Status:</span>
          <Box className={`${details.bodyColor} radius-bottom-lg padding-left-2 padding-y-2 `}>
            {getIconForRegistrationCard()}
            <span
              data-testid={`registration-${index}-status`}
              className={`padding-left-2 text-bold ${details.iconTextColor}`}
            >
              {status}
            </span>
            {informationalMessage && (
              <div data-testid={`registration-${index}-informational-message`}>{informationalMessage}</div>
            )}
          </Box>
        </Box>
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
              {props.address.address1}, {toProperCase(props.address.municipalityName)} NJ
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

          <div>
            {props.summary.registrations.map((registration, index) => {
              return elevatorRegistrationStatusCard(
                registration.dateStarted,
                registration.deviceCount,
                registration.status,
                index
              );
            })}
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
