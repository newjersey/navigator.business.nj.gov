import { Content } from "@/components/Content";
import { BusinessActivities } from "@/components/crtk/BusinessActivities";
import { CrtkFacilityDetails } from "@/components/crtk/CrtkStatus";
import { ModalOneButton } from "@/components/ModalOneButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement, useState } from "react";

interface Props {
  onSearchAgain: () => void;
  reSubmit: (facilityDetails: CrtkFacilityDetails) => Promise<void>;
}

export const CrtkNotFound = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const [crtkEmailSent, setCrtkEmailSent] = useState(business?.crtkData?.crtkEmailSent || false);
  const [notFoundModal, setNotFoundModal] = useState(false);

  const WhatifIncompleteCrtkInfo = (): ReactElement => {
    return (
      <div className="bg-warning-extra-light padding-2 radius-lg text-normal margin-y-3">
        <div className="text-bold">{Config?.crtkTask?.warningTitle}</div>
        <div>{Config?.crtkTask?.regulatedBusinessWarningText}</div>
      </div>
    );
  };

  const handleResubmit = async (): Promise<void> => {
    if (business?.crtkData?.crtkBusinessDetails !== undefined)
      await props
        .reSubmit({
          businessName: business.crtkData.crtkBusinessDetails.businessName,
          businessStreetAddress: business.crtkData.crtkBusinessDetails.addressLine1,
          city: business.crtkData.crtkBusinessDetails.city,
          state: "NJ",
          zip: business.crtkData.crtkBusinessDetails.addressZipCode,
          ein: business.crtkData.crtkBusinessDetails.ein || "",
        })
        .then(() => {
          if (business?.crtkData?.crtkSearchResult === "NOT_FOUND") {
            setNotFoundModal(true);
          }
        });
  };

  return (
    <div data-testid="crtk-not-found">
      <ModalOneButton
        isOpen={notFoundModal}
        title={Config?.crtkTask?.businessNotFoundTitle}
        primaryButtonText={Config?.crtkTask?.okButtonText}
        primaryButtonOnClick={() => setNotFoundModal(false)}
      >
        <Content>{Config?.crtkTask?.businessNotFoundModalContent}</Content>
      </ModalOneButton>
      {crtkEmailSent ? (
        <div data-testid="crtk-email-sent-alert">
          <Alert variant={"success"}>
            <div className="text-bold">{Config?.crtkTask?.crtkInfoSharedTitle}</div>
            <div>
              {Config.crtkTask.crtkInfoSharedPtOne}
              <UnStyledButton isUnderline className="margin-x-05" onClick={handleResubmit}>
                {Config.crtkTask.crtkInfoSharedPtTwo}
              </UnStyledButton>
              {Config.crtkTask.crtkInfoSharedPtThree}
            </div>
          </Alert>
          <div>
            <div className="text-bold">Here’s what will happen next:</div>
            <ul>
              <li>{Config?.crtkTask?.reviewTimelineText}</li>
              <li>{Config?.crtkTask?.crtkWillContactText}</li>
            </ul>
            <div className="text-bold">{Config.crtkTask.contactCrtkExpertTitle}</div>
            <ul>
              <li>{Config?.crtkTask?.contactPhone} </li>
              <li>{Config?.crtkTask?.contactEmail}</li>
            </ul>
          </div>
        </div>
      ) : (
        <BusinessActivities
          onSearchAgain={props.onSearchAgain}
          setCrtkEmailSent={setCrtkEmailSent}
        />
      )}
      {WhatifIncompleteCrtkInfo()}
    </div>
  );
};
