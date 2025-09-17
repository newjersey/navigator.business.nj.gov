import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Accordion, AccordionDetails, AccordionSummary, Avatar } from "@mui/material";
import { isUndefined } from "lodash";
import React, { ReactElement } from "react";

interface Content {
  dataTestId: string;
  classText: string;
  infoAccordionHeaderText: string;
  infoAccordionBodyText: string;
  reqAccordionBodyText: string;
  resAccordionBodyText: string;
}

interface Props {
  setSchoolBusRadioValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setPassengersRadioValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  CMS_ONLY_school_bus_radio_value?: boolean;
  CMS_ONLY_passengers_radio_value?: boolean;
}

export const PassengerTransportCdlResult = (props: Props): ReactElement => {
  const cmsOnlySchoolBusOverride = isUndefined(props.CMS_ONLY_school_bus_radio_value)
    ? undefined
    : props.CMS_ONLY_school_bus_radio_value;
  const cmsOnlyPassengersOverride = isUndefined(props.CMS_ONLY_passengers_radio_value)
    ? undefined
    : props.CMS_ONLY_passengers_radio_value;

  const { business, updateQueue } = useUserData();
  const { Config } = useConfig();

  const handleEditClick = (): void => {
    updateQueue?.queueTaskProgress({ ["passenger-transport-cdl"]: "TO_DO" });
    props.setSchoolBusRadioValue(business?.roadmapTaskData?.passengerTransportSchoolBus);
    props.setPassengersRadioValue(
      business?.roadmapTaskData?.passengerTransportSixteenOrMorePassengers,
    );
    updateQueue?.queueRoadmapTaskData({ passengerTransportSchoolBus: undefined });
    updateQueue?.queueRoadmapTaskData({
      passengerTransportSixteenOrMorePassengers: undefined,
    });
    updateQueue?.update();
  };

  const getEndorsementText = (): Content => {
    const schoolBus =
      cmsOnlySchoolBusOverride || business?.roadmapTaskData?.passengerTransportSchoolBus;
    const passengers =
      cmsOnlyPassengersOverride ||
      business?.roadmapTaskData?.passengerTransportSixteenOrMorePassengers;

    if (schoolBus && passengers) {
      return {
        dataTestId: "classCWithS",
        classText: Config.passengerTransportCdlTabTwo.classCWithSText,
        infoAccordionHeaderText: Config.passengerTransportCdlTabTwo.infoAccordionHeaderWithSText,
        infoAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithSInfoAccordionText,
        reqAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithSReqAccordionText,
        resAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithSResAccordionText,
      };
    }
    if (schoolBus && !passengers) {
      return {
        dataTestId: "classBWithS",
        classText: Config.passengerTransportCdlTabTwo.classBWithSText,
        infoAccordionHeaderText: Config.passengerTransportCdlTabTwo.infoAccordionHeaderWithSText,
        infoAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithSInfoAccordionText,
        reqAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithSReqAccordionText,
        resAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithSResAccordionText,
      };
    }
    if (!schoolBus && passengers) {
      return {
        dataTestId: "classCWithoutS",
        classText: Config.passengerTransportCdlTabTwo.classCWithoutSText,
        infoAccordionHeaderText: Config.passengerTransportCdlTabTwo.infoAccordionHeaderWithoutSText,
        infoAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithoutSInfoAccordionText,
        reqAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithoutSReqAccordionText,
        resAccordionBodyText: Config.passengerTransportCdlTabTwo.classCWithoutSResAccordionText,
      };
    }
    return {
      dataTestId: "classBWithoutS",
      classText: Config.passengerTransportCdlTabTwo.classBWithoutSText,
      infoAccordionHeaderText: Config.passengerTransportCdlTabTwo.infoAccordionHeaderWithoutSText,
      infoAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithoutSInfoAccordionText,
      reqAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithoutSReqAccordionText,
      resAccordionBodyText: Config.passengerTransportCdlTabTwo.classBWithoutSResAccordionText,
    };
  };

  return (
    <div data-testid={getEndorsementText().dataTestId}>
      <Heading level={2}>{Config.passengerTransportCdlTabTwo.headerText}</Heading>
      <Alert variant="success">
        {Config.passengerTransportCdlTabTwo.successAlertText}{" "}
        <UnStyledButton onClick={handleEditClick} isUnderline>
          {Config.passengerTransportCdlTabTwo.successAlertButtonText}
        </UnStyledButton>
      </Alert>
      <Content>{Config.passengerTransportCdlTabTwo.bodyText}</Content>
      <ul>
        <li>
          <Content>{getEndorsementText().classText}</Content>
        </li>
      </ul>
      <hr />
      <Accordion>
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
        >
          <div className="flex flex-align-center">
            <span className="margin-right-2">
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName="info" />
              </Avatar>
            </span>
            <Heading level={3} className="margin-0-override">
              {getEndorsementText().infoAccordionHeaderText}
            </Heading>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ marginLeft: 0, marginTop: "1rem" }}>
          <Content>{getEndorsementText().infoAccordionBodyText}</Content>
        </AccordionDetails>
      </Accordion>
      <hr />
      <Accordion>
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
        >
          <div className="flex flex-align-center">
            <span className="margin-right-2">
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName="info" />
              </Avatar>
            </span>
            <Heading level={3} className="margin-0-override">
              {Config.passengerTransportCdlTabTwo.eligibilityAccordionHeaderText}
            </Heading>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ marginLeft: 0, marginTop: "1rem" }}>
          <Content>{Config.passengerTransportCdlTabTwo.eligibilityAccordionText}</Content>
        </AccordionDetails>
      </Accordion>
      <hr />

      <Accordion>
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
        >
          <div className="flex flex-align-center">
            <span className="margin-right-2">
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName="build" />
              </Avatar>
            </span>
            <Heading level={3} className="margin-0-override">
              {Config.passengerTransportCdlTabTwo.requirementsAccordionHeaderText}
            </Heading>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ marginLeft: 0, marginTop: "1rem" }}>
          <Content>{getEndorsementText().reqAccordionBodyText}</Content>
        </AccordionDetails>
      </Accordion>
      <hr />

      <Accordion>
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
        >
          <div className="flex flex-align-center">
            <span className="margin-right-2">
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName="person" />
              </Avatar>
            </span>
            <Heading level={3} className="margin-0-override">
              {Config.passengerTransportCdlTabTwo.contactAccordionHeaderText}
            </Heading>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ marginLeft: 0, marginTop: "1rem" }}>
          <Content>{Config.passengerTransportCdlTabTwo.contactAccordionText}</Content>
        </AccordionDetails>
      </Accordion>
      <hr />
      <Accordion>
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-5 margin-left-1" iconName="expand_more" />}
        >
          <div className="flex flex-align-center">
            <span className="margin-right-2">
              <Avatar className="bg-secondary-lighter" style={{ height: 30, width: 30 }}>
                <Icon className="text-secondary-darker" iconName="person" />
              </Avatar>
            </span>
            <Heading level={3} className="margin-0-override">
              {Config.passengerTransportCdlTabTwo.responseAccordionHeaderText}
            </Heading>
          </div>
        </AccordionSummary>
        <AccordionDetails sx={{ marginLeft: 0, marginTop: "1rem" }}>
          <Content>{getEndorsementText().resAccordionBodyText}</Content>
        </AccordionDetails>
      </Accordion>
      <hr />
      <span className="h5-styling" data-testid="agency-header">
        {Config.passengerTransportCdlTabTwo.issuingAgencyLabelText} &nbsp;
      </span>
      <span className="h6-styling">{Config.passengerTransportCdlTabTwo.issuingAgencyText}</span>
    </div>
  );
};
