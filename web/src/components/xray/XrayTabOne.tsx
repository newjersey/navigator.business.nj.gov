import { XrayStatus } from "@/components/xray/XrayStatus";
import { XraySummary } from "@/components/xray/XraySummary";
import { FacilityDetails, XrayData, XraySearchError } from "@businessnjgovnavigator/shared/xray";
import { ReactNode } from "react";

interface Props {
  xrayRegistrationData: XrayData | undefined;
  error: XraySearchError | undefined;
  isLoading: boolean;
  onEdit: () => void;
  onSubmit: (facilityDetails: FacilityDetails) => void;
  goToRegistrationTab: () => void;
}

export const XrayTabOne = (props: Props): ReactNode => {
  return (
    <div className="margin-top-3">
      {props.xrayRegistrationData && props.error === undefined ? (
        <XraySummary
          xrayRegistrationData={props.xrayRegistrationData}
          edit={props.onEdit}
          goToRegistrationTab={props.goToRegistrationTab}
        />
      ) : (
        <XrayStatus onSubmit={props.onSubmit} error={props.error} isLoading={props.isLoading} />
      )}
    </div>
  );
};
