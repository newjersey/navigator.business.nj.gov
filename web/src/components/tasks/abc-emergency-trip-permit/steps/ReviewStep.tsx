import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { EmergencyTripPermitReviewField } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitReviewField";
import { EmergencyTripPermitReviewSection } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitReviewSection";
import {
  doesStepHaveError,
  LookupStepIndexByName,
} from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  AbcEmergencyTripPermitStepNames,
  EmergencyTripPermitFieldErrorState,
  ReducedFieldStates,
} from "@/lib/types/types";
import {
  EmergencyTripPermitApplicationInfo,
  EmergencyTripPermitFieldNames,
} from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const ReviewStep = (): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const dataFormErrorMapContext = useContext(DataFormErrorMapContext);
  const getInvalidFieldIds = (): string[] => {
    return Object.keys(dataFormErrorMapContext.fieldStates).filter((field: string) => {
      const fieldName = field as keyof EmergencyTripPermitApplicationInfo;
      const fieldStates = dataFormErrorMapContext.fieldStates as ReducedFieldStates<
        EmergencyTripPermitFieldNames,
        EmergencyTripPermitFieldErrorState
      >;
      return fieldStates[fieldName].invalid;
    });
  };
  const invalidFieldIds = getInvalidFieldIds() as EmergencyTripPermitFieldNames[];

  const getPermitSection = (): ReactElement => {
    return (
      <>
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <span className={"text-bold"}>
              {Config.abcEmergencyTripPermit.steps.review.confirmationEmail}
            </span>
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            {context.state.applicationInfo.requestorEmail}
          </span>
        </div>
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <span className={"text-bold"}>{Config.abcEmergencyTripPermit.steps.review.permitAttach}</span>
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            {context.state.applicationInfo.pdfAttach === "1" ? "Yes" : "No"}
          </span>
        </div>
        {context.state.applicationInfo.textMsg === "1" && (
          <div className={"grid-row grid-gap"}>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              <span className={"text-bold"}>
                {Config.abcEmergencyTripPermit.steps.review.permitTextMessage}
              </span>
            </span>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              {context.state.applicationInfo.textMsgMobile}
            </span>
          </div>
        )}
        {context.state.applicationInfo.additionalEmail !== "" && (
          <div className={"grid-row grid-gap"}>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              <span className={"text-bold"}>{Config.abcEmergencyTripPermit.steps.review.alternateEmail}</span>
            </span>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              {context.state.applicationInfo.additionalEmail}
            </span>
          </div>
        )}
      </>
    );
  };

  const getStepsWithErrors = (stepName: AbcEmergencyTripPermitStepNames): ReactElement => {
    return (
      <li>
        <UnStyledButton
          isButtonALink
          isUnderline
          onClick={() => {
            context.setStepIndex(LookupStepIndexByName(stepName));
          }}
        >
          {stepName}{" "}
        </UnStyledButton>
      </li>
    );
  };

  return (
    <>
      {!context.state.submitted && (
        <Alert variant={"info"}>{Config.abcEmergencyTripPermit.steps.review.infoAlertText}</Alert>
      )}
      {context.state.submitted && invalidFieldIds.length > 0 && (
        <Alert variant={"error"}>
          {Config.abcEmergencyTripPermit.steps.review.errorSubmitText}
          <ul>
            {doesStepHaveError("Requestor", invalidFieldIds) && getStepsWithErrors("Requestor")}
            {doesStepHaveError("Trip", invalidFieldIds) && getStepsWithErrors("Trip")}
            {doesStepHaveError("Billing", invalidFieldIds) && getStepsWithErrors("Billing")}
          </ul>
        </Alert>
      )}
      <EmergencyTripPermitReviewSection stepName={"Requestor"} dataTestId={"requestor-review-section"}>
        <EmergencyTripPermitReviewField fieldName={"carrier"} />
        <EmergencyTripPermitReviewField fieldName={"requestorFirstName"} />
        <EmergencyTripPermitReviewField fieldName={"requestorLastName"} />
        <EmergencyTripPermitReviewField fieldName={"requestorEmail"} />
        <EmergencyTripPermitReviewField fieldName={"requestorPhone"} />
        <EmergencyTripPermitReviewField fieldName={"requestorCountry"} />
        <EmergencyTripPermitReviewField fieldName={"requestorAddress1"} />
        <EmergencyTripPermitReviewField fieldName={"requestorAddress2"} optional />
        <EmergencyTripPermitReviewField fieldName={"requestorCity"} />
        <EmergencyTripPermitReviewField fieldName={"requestorStateProvince"} />
        <EmergencyTripPermitReviewField fieldName={"requestorZipPostalCode"} />
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.requestor.vehicleSection}
        </Heading>
        <EmergencyTripPermitReviewField fieldName={"vehicleMake"} />
        <EmergencyTripPermitReviewField fieldName={"vehicleYear"} />
        <EmergencyTripPermitReviewField fieldName={"vehicleVinSerial"} />
        <EmergencyTripPermitReviewField fieldName={"vehicleLicensePlateNum"} />
        <EmergencyTripPermitReviewField fieldName={"vehicleStateProvince"} />
        <EmergencyTripPermitReviewField fieldName={"vehicleCountry"} />
      </EmergencyTripPermitReviewSection>
      <EmergencyTripPermitReviewSection stepName={"Trip"}>
        <EmergencyTripPermitReviewField fieldName={"permitDate"} />
        <EmergencyTripPermitReviewField fieldName={"permitStartTime"} />
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.trip.pickupSiteSection}
        </Heading>
        <EmergencyTripPermitReviewField fieldName={"pickupSiteName"} />
        <EmergencyTripPermitReviewField fieldName={"pickupCountry"} />
        <EmergencyTripPermitReviewField fieldName={"pickupAddress"} />
        <EmergencyTripPermitReviewField fieldName={"pickupCity"} />
        <EmergencyTripPermitReviewField fieldName={"pickupStateProvince"} />
        <EmergencyTripPermitReviewField fieldName={"pickupCountry"} />
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.trip.deliverySiteSection}
        </Heading>
        <EmergencyTripPermitReviewField fieldName={"deliverySiteName"} />
        <EmergencyTripPermitReviewField fieldName={"deliveryCountry"} />
        <EmergencyTripPermitReviewField fieldName={"deliveryAddress"} />
        <EmergencyTripPermitReviewField fieldName={"deliveryCity"} />
        <EmergencyTripPermitReviewField fieldName={"deliveryStateProvince"} />
        <EmergencyTripPermitReviewField fieldName={"deliveryCountry"} />
      </EmergencyTripPermitReviewSection>
      <EmergencyTripPermitReviewSection stepName={"Billing"}>
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.billing.servicesSection}
        </Heading>
        <EmergencyTripPermitReviewField fieldName={"permitDate"} />
        <EmergencyTripPermitReviewField fieldName={"permitStartTime"} />
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.billing.billingSection}
        </Heading>
        <EmergencyTripPermitReviewField fieldName={"payerFirstName"} />
        <EmergencyTripPermitReviewField fieldName={"payerLastName"} />
        <EmergencyTripPermitReviewField fieldName={"payerCompanyName"} />
        <EmergencyTripPermitReviewField fieldName={"payerCountry"} />
        <EmergencyTripPermitReviewField fieldName={"payerAddress1"} />
        <EmergencyTripPermitReviewField fieldName={"payerAddress2"} optional />
        <EmergencyTripPermitReviewField fieldName={"payerCity"} />
        <EmergencyTripPermitReviewField fieldName={"payerStateAbbreviation"} />
        <EmergencyTripPermitReviewField fieldName={"payerZipCode"} />
        <Heading className={"padding-top-1"} level={3}>
          {Config.abcEmergencyTripPermit.steps.billing.permitSection}
        </Heading>
        {getPermitSection()}
      </EmergencyTripPermitReviewSection>
    </>
  );
};
